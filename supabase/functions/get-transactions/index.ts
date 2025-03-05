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

    // Get query parameters
    const url = new URL(req.url)
    const walletId = url.searchParams.get('walletId')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    if (!walletId) {
      throw new Error('Wallet ID is required')
    }

    // Check if user owns this wallet or is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error('Failed to retrieve user profile')
    }

    let isAuthorized = false
    
    // If admin, they can view any wallet
    if (profile.role === 'admin') {
      isAuthorized = true
    } else {
      // Otherwise, check if this is the user's wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('user_id')
        .eq('id', walletId)
        .single()

      if (walletError) {
        console.error('Wallet error:', walletError)
        throw new Error('Failed to retrieve wallet')
      }

      isAuthorized = wallet.user_id === user.id
    }

    if (!isAuthorized) {
      throw new Error('You do not have permission to view these transactions')
    }

    // Get transactions with pagination
    const { data: transactions, error: transactionsError, count } = await supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transactionsError) {
      console.error('Transactions error:', transactionsError)
      throw new Error('Failed to retrieve transactions')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions, 
        total: count
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Get transactions API error:', error)
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
