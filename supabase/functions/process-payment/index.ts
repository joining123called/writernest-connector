
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { paymentMethod, amount, orderId, userId } = await req.json();
    
    if (!paymentMethod || !amount || !orderId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if the payment gateway is enabled
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_name', paymentMethod === 'stripe' ? 'Stripe' : 'PayPal')
      .eq('is_enabled', true)
      .single();
      
    if (gatewayError || !gateway) {
      return new Response(
        JSON.stringify({ error: 'Payment method is not available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // In a real implementation, we would integrate with the payment gateway here
    // For this example, we'll simulate a successful payment
    
    // Create a new transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: orderId,
        user_id: userId,
        gateway: paymentMethod,
        amount,
        currency: 'USD',
        status: 'completed', // In a real implementation, this would initially be 'pending'
        gateway_transaction_id: `sim_${Math.random().toString(36).substring(2, 15)}`,
        gateway_response: { 
          timestamp: new Date().toISOString(),
          status: 'SUCCESS',
          message: 'Payment processed successfully' 
        }
      })
      .select()
      .single();
      
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully', 
        transaction 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
