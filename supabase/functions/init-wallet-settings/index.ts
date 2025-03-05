
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const defaultWalletSettings = {
  id: 'wallet_settings',
  min_deposit_amount: 5,
  max_deposit_amount: 1000,
  allow_withdrawals: true,
  withdrawal_fee_percentage: 2.5,
  enable_wallet_system: true,
  payment_methods: {
    paypal: {
      enabled: true,
      client_id: '',
      client_secret: '',
      webhook_id: ''
    }
  }
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

    // Check if wallet settings already exist
    const { data: existingSettings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', 'wallet_settings')
      .maybeSingle()

    if (settingsError && !settingsError.message.includes('does not exist')) {
      console.error('Error checking existing settings:', settingsError)
      throw new Error('Failed to check existing wallet settings')
    }

    let result
    
    if (existingSettings) {
      console.log('Wallet settings already exist')
      result = existingSettings
    } else {
      console.log('Creating new wallet settings')
      // Create new settings
      const { data, error: insertError } = await supabase
        .from('platform_settings')
        .insert({
          key: 'wallet_settings',
          value: defaultWalletSettings
        })
        .select()
        .single()

      if (insertError) {
        console.error('Settings insert error:', insertError)
        throw new Error('Failed to create wallet settings')
      }
      
      result = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wallet settings initialized successfully',
        data: result
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Wallet settings initialization error:', error)
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
