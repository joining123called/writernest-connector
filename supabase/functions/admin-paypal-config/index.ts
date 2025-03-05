
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Get Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error('Failed to retrieve user profile')
    }

    if (profile.role !== 'admin') {
      throw new Error('Unauthorized - admin access required')
    }

    // Process based on HTTP method
    if (req.method === 'GET') {
      // Retrieve current PayPal config
      const { data: paypalConfig, error: configError } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('gateway_name', 'paypal')
        .maybeSingle()

      if (configError) {
        console.error('Config retrieval error:', configError)
        throw new Error('Failed to retrieve PayPal configuration')
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          config: paypalConfig || null
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } else if (req.method === 'POST') {
      // Update PayPal config
      const { 
        clientId, 
        clientSecret, 
        webhookId, 
        isSandbox, 
        isActive 
      } = await req.json()
      
      // Check for required fields
      if (!clientId) {
        throw new Error('Client ID is required')
      }
      
      // Check if config already exists
      const { data: existingConfig, error: existingError } = await supabase
        .from('payment_gateways')
        .select('id')
        .eq('gateway_name', 'paypal')
        .maybeSingle()

      if (existingError) {
        console.error('Error checking existing config:', existingError)
        throw new Error('Failed to check existing configuration')
      }

      const config = {
        client_id: clientId,
        client_secret: clientSecret || '',
        webhook_id: webhookId || ''
      }

      let result
      
      if (existingConfig) {
        // Update existing config - use database field names
        const { data, error: updateError } = await supabase
          .from('payment_gateways')
          .update({ 
            config,
            is_enabled: isActive !== undefined ? isActive : true,
            is_test_mode: isSandbox !== undefined ? isSandbox : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
          .select()
          .single()

        if (updateError) {
          console.error('Config update error:', updateError)
          throw new Error('Failed to update PayPal configuration')
        }
        
        result = data
      } else {
        // Create new config - use database field names
        const { data, error: insertError } = await supabase
          .from('payment_gateways')
          .insert({
            gateway_name: 'paypal',
            config,
            is_enabled: isActive !== undefined ? isActive : true,
            is_test_mode: isSandbox !== undefined ? isSandbox : true
          })
          .select()
          .single()

        if (insertError) {
          console.error('Config insert error:', insertError)
          throw new Error('Failed to create PayPal configuration')
        }
        
        result = data
      }
      
      // Also update wallet settings for PayPal
      const { error: settingsError } = await supabase
        .from('platform_settings')
        .update({
          value: {
            payment_methods: {
              paypal: {
                enabled: isActive !== undefined ? isActive : true,
                client_id: clientId
              }
            }
          }
        })
        .eq('key', 'wallet_settings')

      if (settingsError) {
        console.error('Wallet settings update error:', settingsError)
        // Continue anyway, this is just for UI consistency
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          config: result
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } else {
      throw new Error('Method not allowed')
    }
  } catch (error) {
    console.error('PayPal config API error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
