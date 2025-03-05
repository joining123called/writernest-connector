
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PayPal API configuration
interface PayPalConfig {
  clientId: string
  clientSecret: string
  isSandbox: boolean
}

async function getPayPalAccessToken(config: PayPalConfig): Promise<string> {
  const { clientId, clientSecret, isSandbox } = config
  
  // Determine API base URL based on environment
  const baseUrl = isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'
  
  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal auth error:', errorData)
      throw new Error(`PayPal Auth Error: ${errorData.error_description || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Failed to get PayPal access token:', error)
    throw error
  }
}

async function createPayPalOrder(
  config: PayPalConfig, 
  amount: number, 
  userId: string,
  walletId: string
): Promise<{ id: string, links: any[] }> {
  const accessToken = await getPayPalAccessToken(config)
  
  // Determine API base URL based on environment
  const baseUrl = config.isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'
  
  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          description: 'Wallet deposit',
          custom_id: `wallet_deposit_${walletId}`
        }],
        application_context: {
          brand_name: 'Your Essay Writing Service',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/wallet/success`,
          cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/wallet/cancel`
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal create order error:', errorData)
      throw new Error(`PayPal Create Order Error: ${errorData.message || 'Unknown error'}`)
    }

    const orderData = await response.json()
    console.log('PayPal order created:', orderData.id)
    return orderData
  } catch (error) {
    console.error('Failed to create PayPal order:', error)
    throw error
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

    // Get request data
    const { amount, walletId } = await req.json()
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    if (!walletId) {
      throw new Error('Missing wallet ID')
    }

    // Verify wallet belongs to user
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      console.error('Wallet verification error:', walletError)
      throw new Error('Wallet not found or does not belong to user')
    }

    // Get payment gateway configuration
    const { data: paypalConfig, error: configError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('name', 'paypal')
      .eq('is_active', true)
      .maybeSingle()

    if (configError) {
      console.error('Config error:', configError)
      throw new Error('Failed to retrieve PayPal configuration')
    }

    if (!paypalConfig) {
      throw new Error('PayPal is not configured')
    }

    // Create PayPal order
    const config: PayPalConfig = {
      clientId: paypalConfig.config.client_id,
      clientSecret: paypalConfig.config.client_secret,
      isSandbox: paypalConfig.is_sandbox
    }

    const order = await createPayPalOrder(config, amount, user.id, walletId)

    // Store the order reference
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        amount: amount,
        type: 'deposit',
        status: 'pending',
        description: 'PayPal deposit (processing)',
        payment_gateway: 'paypal',
        payment_id: order.id,
        payment_status: 'CREATED'
      })

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
      throw new Error('Failed to record transaction')
    }

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, order }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('PayPal create order error:', error)
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
