
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

async function createPayPalPayout(
  config: PayPalConfig, 
  amount: number,
  email: string,
  note: string,
  batchId: string
): Promise<any> {
  const accessToken = await getPayPalAccessToken(config)
  
  // Determine API base URL based on environment
  const baseUrl = config.isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'
  
  try {
    const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: batchId,
          email_subject: 'You have a payment from Essay Writing Service',
          email_message: 'You have received a wallet withdrawal payment from Essay Writing Service.'
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: amount.toFixed(2),
              currency: 'USD'
            },
            note: note,
            receiver: email,
            sender_item_id: batchId + '_1'
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal payout error:', errorData)
      throw new Error(`PayPal Payout Error: ${errorData.message || 'Unknown error'}`)
    }

    const payoutData = await response.json()
    console.log('PayPal payout created:', payoutData.batch_header.payout_batch_id)
    return payoutData
  } catch (error) {
    console.error('Failed to create PayPal payout:', error)
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
    const { amount, walletId, paypalEmail } = await req.json()
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    if (!walletId) {
      throw new Error('Missing wallet ID')
    }

    if (!paypalEmail) {
      throw new Error('Missing PayPal email')
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

    // Check if user has enough balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance')
    }

    // Get wallet settings for fee calculation
    const { data: settingsData, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', 'wallet_settings')
      .maybeSingle()
      
    if (settingsError) {
      console.error('Settings error:', settingsError)
      throw new Error('Failed to retrieve wallet settings')
    }
    
    // Default fee percentage if settings not found
    let feePercentage = 2.5
    
    if (settingsData?.value && typeof settingsData.value === 'object') {
      // Type assertion for TypeScript
      const settings = settingsData.value as any
      if (typeof settings.withdrawal_fee_percentage === 'number') {
        feePercentage = settings.withdrawal_fee_percentage
      }
    }
    
    // Calculate fee and final amount
    const feeAmount = (amount * feePercentage) / 100
    const finalAmount = amount - feeAmount

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

    // Generate a unique batch ID
    const batchId = 'BATCH_' + Date.now() + '_' + Math.floor(Math.random() * 1000000)
    
    // Create the payout
    const config: PayPalConfig = {
      clientId: paypalConfig.config.client_id,
      clientSecret: paypalConfig.config.client_secret,
      isSandbox: paypalConfig.is_sandbox
    }

    // Create withdrawal transaction first (pending)
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        amount: amount,
        type: 'withdrawal',
        status: 'pending',
        description: `Wallet withdrawal to ${paypalEmail} (Fee: $${feeAmount.toFixed(2)})`,
        payment_gateway: 'paypal',
        payment_id: batchId,
        payment_status: 'PENDING'
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      throw new Error('Failed to create transaction record')
    }

    try {
      // Create PayPal payout
      const payoutResult = await createPayPalPayout(
        config, 
        finalAmount, 
        paypalEmail,
        `Wallet withdrawal (Transaction ID: ${transaction.id})`,
        batchId
      )
      
      // Update wallet balance
      const newBalance = Number(wallet.balance) - Number(amount)
      const { error: updateWalletError } = await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId)

      if (updateWalletError) {
        throw new Error('Failed to update wallet balance')
      }
      
      // Update transaction with payout information
      const { error: updateTransactionError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          payment_status: 'PENDING', // PayPal payouts are processed asynchronously
          payment_data: payoutResult
        })
        .eq('id', transaction.id)

      if (updateTransactionError) {
        throw new Error('Failed to update transaction record')
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          batch_id: payoutResult.batch_header.payout_batch_id,
          transactionId: transaction.id
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } catch (payoutError) {
      // Update transaction to failed status
      await supabase
        .from('wallet_transactions')
        .update({
          status: 'failed',
          payment_status: 'FAILED',
          payment_error: payoutError.message
        })
        .eq('id', transaction.id)
        
      throw payoutError
    }
  } catch (error) {
    console.error('PayPal payout error:', error)
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
