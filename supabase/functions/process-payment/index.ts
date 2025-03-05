
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

    // Get request data
    const { paymentMethod, amount, walletId } = await req.json()
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    if (!walletId) {
      throw new Error('Missing wallet ID')
    }

    if (!paymentMethod) {
      throw new Error('Missing payment method')
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

    // This is a placeholder for actual payment processing logic
    // In a real implementation, you would integrate with a payment processor here
    // For now, we'll just simulate a successful payment
    
    // Update wallet balance
    const newBalance = Number(wallet.balance) + Number(amount)
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId)

    if (updateError) {
      console.error('Wallet update error:', updateError)
      throw new Error('Failed to update wallet')
    }

    // Record the transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: `${paymentMethod} deposit`,
        payment_gateway: paymentMethod,
        payment_id: `sim_${Date.now()}`,
        payment_status: 'COMPLETED'
      })

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
      throw new Error('Failed to record transaction')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully',
        newBalance
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Process payment error:', error)
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
