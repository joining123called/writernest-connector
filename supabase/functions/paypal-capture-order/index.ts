
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

async function capturePayPalOrder(config: PayPalConfig, orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken(config)
  
  // Determine API base URL based on environment
  const baseUrl = config.isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'
  
  try {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal capture order error:', errorData)
      throw new Error(`PayPal Capture Error: ${errorData.message || 'Unknown error'}`)
    }

    const captureData = await response.json()
    console.log('PayPal order captured:', captureData.id)
    return captureData
  } catch (error) {
    console.error('Failed to capture PayPal order:', error)
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
    const { orderId, walletId } = await req.json()
    
    if (!orderId) {
      throw new Error('Missing order ID')
    }

    if (!walletId) {
      throw new Error('Missing wallet ID')
    }

    // Find the transaction for this order
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('payment_id', orderId)
      .eq('payment_gateway', 'paypal')
      .maybeSingle()

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      throw new Error('Failed to retrieve transaction')
    }

    if (!transaction) {
      console.error('Transaction not found for order ID:', orderId)
      throw new Error('Transaction not found')
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
      .eq('gateway_name', 'paypal')
      .eq('is_enabled', true)
      .maybeSingle()

    if (configError) {
      console.error('Config error:', configError)
      throw new Error('Failed to retrieve PayPal configuration')
    }

    if (!paypalConfig) {
      throw new Error('PayPal is not configured or is disabled')
    }

    // Capture the PayPal order
    const config: PayPalConfig = {
      clientId: paypalConfig.config.client_id,
      clientSecret: paypalConfig.config.client_secret,
      isSandbox: paypalConfig.is_test_mode
    }

    const captureResult = await capturePayPalOrder(config, orderId)
    
    // Update transaction status based on capture result
    const captureStatus = captureResult.status
    const newStatus = captureStatus === 'COMPLETED' ? 'completed' : 'pending'
    
    // Update transaction record
    const { error: updateTransactionError } = await supabase
      .from('wallet_transactions')
      .update({
        status: newStatus,
        description: `PayPal deposit (${newStatus})`,
        payment_status: captureStatus,
        payment_data: captureResult
      })
      .eq('payment_id', orderId)

    if (updateTransactionError) {
      console.error('Transaction update error:', updateTransactionError)
      throw new Error('Failed to update transaction')
    }

    // If completed, update wallet balance
    if (newStatus === 'completed') {
      // Update wallet balance with the transaction amount
      const newBalance = Number(wallet.balance) + Number(transaction.amount)
      const { error: updateWalletError } = await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId)

      if (updateWalletError) {
        console.error('Wallet update error:', updateWalletError)
        throw new Error('Failed to update wallet balance')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus, 
        captureResult 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('PayPal capture order error:', error)
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
