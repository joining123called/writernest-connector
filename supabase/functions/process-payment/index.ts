
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
    // Get Supabase client
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

    // Process the payment (simulated)
    const { amount, paymentMethod, walletId } = await req.json()
    
    // Validate request
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount')
    }
    
    if (!paymentMethod) {
      throw new Error('Payment method is required')
    }
    
    if (!walletId) {
      throw new Error('Wallet ID is required')
    }
    
    // Verify the wallet belongs to the user
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
    
    // Here we would integrate with a payment processor
    // For demo purposes, we'll just update the wallet balance directly
    
    // Generate a mock payment result
    const paymentResult = {
      id: `payment_${Date.now()}`,
      status: 'success',
      amount: amount,
      currency: 'USD',
      payment_method: paymentMethod,
      created_at: new Date().toISOString()
    }
    
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
      throw new Error('Failed to update wallet balance')
    }
    
    // Record the transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert([{
        wallet_id: walletId,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: `Wallet deposit via ${paymentMethod} (simulated)`,
        payment_method: paymentMethod,
        payment_id: paymentResult.id,
        payment_status: 'success',
        payment_data: paymentResult
      }])
      
    if (transactionError) {
      console.error('Transaction record error:', transactionError)
      throw new Error('Failed to record transaction')
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: paymentResult
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
    
  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred during payment processing' 
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
