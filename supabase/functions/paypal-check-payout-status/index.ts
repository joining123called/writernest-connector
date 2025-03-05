
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

async function checkPayoutStatus(
  config: PayPalConfig, 
  payoutBatchId: string
): Promise<any> {
  const accessToken = await getPayPalAccessToken(config)
  
  // Determine API base URL based on environment
  const baseUrl = config.isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'
  
  try {
    const response = await fetch(`${baseUrl}/v1/payments/payouts/${payoutBatchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal payout status check error:', errorData)
      throw new Error(`PayPal Payout Status Error: ${errorData.message || 'Unknown error'}`)
    }

    const statusData = await response.json()
    console.log('PayPal payout status checked:', statusData.batch_header.batch_status)
    return statusData
  } catch (error) {
    console.error('Failed to check PayPal payout status:', error)
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
    const { transactionId } = await req.json()
    
    if (!transactionId) {
      throw new Error('Missing transaction ID')
    }

    // Get the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .select('*, wallet:wallet_id(*)')
      .eq('id', transactionId)
      .eq('type', 'withdrawal')
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction fetch error:', transactionError)
      throw new Error('Transaction not found')
    }

    // Verify wallet belongs to user
    if (transaction.wallet.user_id !== user.id) {
      throw new Error('Unauthorized - transaction does not belong to user')
    }

    // If no payment data (batch ID), can't check status
    if (!transaction.payment_data || 
        !transaction.payment_data.batch_header || 
        !transaction.payment_data.batch_header.payout_batch_id) {
      throw new Error('No payout batch ID found for this transaction')
    }

    const payoutBatchId = transaction.payment_data.batch_header.payout_batch_id

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

    // Check the payout status
    const config: PayPalConfig = {
      clientId: paypalConfig.config.client_id,
      clientSecret: paypalConfig.config.client_secret,
      isSandbox: paypalConfig.is_sandbox
    }

    const statusResult = await checkPayoutStatus(config, payoutBatchId)
    
    // Map PayPal status to our status
    let newStatus = transaction.status
    let newPaymentStatus = statusResult.batch_header.batch_status
    
    // Update based on PayPal status
    if (newPaymentStatus === 'SUCCESS') {
      newStatus = 'completed'
    } else if (newPaymentStatus === 'DENIED' || newPaymentStatus === 'CANCELED' || newPaymentStatus === 'FAILED') {
      newStatus = 'failed'
      
      // If payment failed, refund the wallet
      if (transaction.status !== 'failed') {
        // Get current wallet balance
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', transaction.wallet_id)
          .single()

        if (walletError || !wallet) {
          console.error('Wallet fetch error:', walletError)
          throw new Error('Failed to retrieve wallet')
        }

        // Restore the withdrawn amount
        const newBalance = Number(wallet.balance) + Number(transaction.amount)
        const { error: updateWalletError } = await supabase
          .from('wallets')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.wallet_id)

        if (updateWalletError) {
          console.error('Wallet update error for refund:', updateWalletError)
          throw new Error('Failed to refund wallet balance')
        }
        
        // Create refund transaction
        const { error: refundError } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: transaction.wallet_id,
            amount: transaction.amount,
            type: 'refund',
            status: 'completed',
            description: `Refund for failed withdrawal (Transaction ID: ${transaction.id})`,
            reference_id: transaction.id
          })

        if (refundError) {
          console.error('Refund transaction creation error:', refundError)
          throw new Error('Failed to create refund transaction')
        }
      }
    }
    
    // Update transaction with status info
    const { error: updateTransactionError } = await supabase
      .from('wallet_transactions')
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        payment_data: statusResult,
        description: `Wallet withdrawal (${newStatus})`
      })
      .eq('id', transaction.id)

    if (updateTransactionError) {
      console.error('Transaction update error:', updateTransactionError)
      throw new Error('Failed to update transaction')
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus,
        paypalStatus: newPaymentStatus,
        statusDetails: statusResult
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('PayPal payout status check error:', error)
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
