
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

// Validate PayPal webhook signature
async function validatePayPalWebhook(
  body: string,
  headers: Headers,
  webhookId: string
): Promise<boolean> {
  try {
    const transmissionId = headers.get('Paypal-Transmission-Id')
    const timestamp = headers.get('Paypal-Transmission-Time')
    const webhookSignature = headers.get('Paypal-Transmission-Sig')
    const certUrl = headers.get('Paypal-Cert-Url')
    
    if (!transmissionId || !timestamp || !webhookSignature || !certUrl) {
      console.error('Missing required PayPal webhook headers')
      return false
    }
    
    // In a production environment, you would:
    // 1. Fetch the certificate from certUrl
    // 2. Verify the signature using the certificate
    // 3. Ensure the cert is issued by PayPal
    
    // For this demo, we'll assume the webhook is valid if headers are present
    console.log('PayPal webhook validation passed (simplified)')
    return true
  } catch (error) {
    console.error('PayPal webhook validation error:', error)
    return false
  }
}

serve(async (req) => {
  // PayPal webhooks don't need CORS headers, but we'll include them anyway
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Get Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the raw request body for signature verification
    const bodyText = await req.text()
    
    // Get PayPal config for webhook verification
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

    const webhookId = paypalConfig.config.webhook_id
    
    // Validate the webhook payload
    const isValid = await validatePayPalWebhook(bodyText, req.headers, webhookId)
    
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }
    
    // Parse the body as JSON
    const webhookEvent = JSON.parse(bodyText)
    
    // Log webhook event
    console.log('PayPal webhook received:', webhookEvent.event_type)
    
    // Process based on event type
    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = webhookEvent.resource
      const orderId = resource.supplementary_data?.related_ids?.order_id
      
      if (!orderId) {
        throw new Error('Missing order ID in webhook payload')
      }
      
      // Find the transaction for this order
      const { data: transaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('payment_id', orderId)
        .eq('payment_gateway', 'paypal')
        .single()

      if (transactionError || !transaction) {
        console.error('Transaction not found for webhook:', transactionError)
        throw new Error('Transaction not found')
      }
      
      // Only update if not already completed
      if (transaction.status !== 'completed') {
        // Update transaction status
        const { error: updateTransactionError } = await supabase
          .from('wallet_transactions')
          .update({
            status: 'completed',
            description: 'PayPal deposit (webhook completed)',
            payment_status: 'COMPLETED',
            payment_data: resource
          })
          .eq('payment_id', orderId)

        if (updateTransactionError) {
          console.error('Transaction update error in webhook:', updateTransactionError)
          throw new Error('Failed to update transaction')
        }

        // Get wallet and update balance
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', transaction.wallet_id)
          .single()

        if (walletError || !wallet) {
          console.error('Wallet fetch error in webhook:', walletError)
          throw new Error('Failed to retrieve wallet')
        }

        // Update wallet balance
        const newBalance = Number(wallet.balance) + Number(transaction.amount)
        const { error: updateWalletError } = await supabase
          .from('wallets')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.wallet_id)

        if (updateWalletError) {
          console.error('Wallet update error in webhook:', updateWalletError)
          throw new Error('Failed to update wallet balance')
        }
        
        console.log('PayPal webhook processed successfully:', orderId)
      } else {
        console.log('Transaction already completed, skipping webhook processing')
      }
    }
    
    // Send success response
    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    
    // Even on error, return 200 to acknowledge receipt (PayPal will retry otherwise)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
