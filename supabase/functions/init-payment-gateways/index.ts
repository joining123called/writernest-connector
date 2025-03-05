
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

    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

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

    // Check if we need to create the payment_gateways table
    const { error: tableCheckError } = await supabase
      .from('payment_gateways')
      .select('id')
      .limit(1)
      
    if (tableCheckError) {
      console.log('Payment gateways table needs to be created')
      // Table doesn't exist or we don't have access - no action needed here
      // as we'll need to run SQL commands to create it
    }

    // Check if PayPal gateway config exists
    const { data: existingConfig, error: existingError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_name', 'paypal')
      .maybeSingle()

    if (existingError && !existingError.message.includes('does not exist')) {
      console.error('Error checking existing config:', existingError)
      throw new Error('Failed to check existing configuration')
    }

    let result = null
    
    if (!existingConfig) {
      // Create default PayPal gateway config
      const { data, error: insertError } = await supabase
        .from('payment_gateways')
        .insert({
          gateway_name: 'paypal',
          config: {
            client_id: '',
            client_secret: '',
            webhook_id: ''
          },
          is_enabled: true,
          is_test_mode: true
        })
        .select()
        .maybeSingle()

      if (insertError) {
        console.error('Config insert error:', insertError)
        throw new Error('Failed to create PayPal configuration')
      }
      
      result = data
    } else {
      // Config already exists
      result = existingConfig
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment gateways initialized successfully',
        data: result
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Payment gateways initialization error:', error)
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
