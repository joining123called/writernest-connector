
import { supabase } from './supabase';
import { PaymentGateway, PaymentRequest, PaymentResponse } from '@/types/payment';

/**
 * Gets payment gateway configuration from the database
 */
export async function getPaymentGateway(gatewayName: string): Promise<PaymentGateway | null> {
  const { data, error } = await supabase
    .from('payment_gateways')
    .select('*')
    .eq('gateway_name', gatewayName)
    .eq('is_enabled', true)
    .single();

  if (error) {
    console.error(`Error fetching ${gatewayName} configuration:`, error);
    return null;
  }

  return data;
}

/**
 * Process payment through PayPal gateway
 */
export async function processPayPalPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const gateway = await getPaymentGateway('PayPal');
  
  if (!gateway) {
    return {
      success: false,
      errorMessage: 'PayPal gateway configuration not found or disabled',
    };
  }

  try {
    // This is a placeholder for actual PayPal integration
    // In a real implementation, this would make API calls to PayPal
    
    // Create a transaction record in the database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        order_id: request.orderId,
        user_id: request.userId,
        gateway: 'PayPal',
        amount: request.amount,
        currency: request.currency || 'USD',
        status: 'pending',
        gateway_response: { metadata: request.metadata }
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create transaction record:', error);
      return {
        success: false,
        errorMessage: 'Failed to record transaction',
      };
    }

    // In a real implementation, you would process the payment with PayPal here
    // and then update the transaction status based on the response

    return {
      success: true,
      transactionId: data.id,
      gatewayResponse: { transactionId: `pp-test-${Date.now()}` }
    };
  } catch (error) {
    console.error('PayPal payment processing error:', error);
    return {
      success: false,
      errorMessage: 'Payment processing failed',
    };
  }
}

/**
 * Process payment through Stripe gateway
 */
export async function processStripePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const gateway = await getPaymentGateway('Stripe');
  
  if (!gateway) {
    return {
      success: false,
      errorMessage: 'Stripe gateway configuration not found or disabled',
    };
  }

  try {
    // This is a placeholder for actual Stripe integration
    // In a real implementation, this would make API calls to Stripe
    
    // Create a transaction record in the database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        order_id: request.orderId,
        user_id: request.userId,
        gateway: 'Stripe',
        amount: request.amount,
        currency: request.currency || 'USD',
        status: 'pending',
        gateway_response: { metadata: request.metadata }
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create transaction record:', error);
      return {
        success: false,
        errorMessage: 'Failed to record transaction',
      };
    }

    // In a real implementation, you would process the payment with Stripe here
    // and then update the transaction status based on the response

    return {
      success: true,
      transactionId: data.id,
      gatewayResponse: { transactionId: `stripe-test-${Date.now()}` }
    };
  } catch (error) {
    console.error('Stripe payment processing error:', error);
    return {
      success: false,
      errorMessage: 'Payment processing failed',
    };
  }
}

/**
 * Process a payment using the specified gateway
 */
export async function processPayment(
  gatewayName: string,
  request: PaymentRequest
): Promise<PaymentResponse> {
  switch (gatewayName.toLowerCase()) {
    case 'paypal':
      return processPayPalPayment(request);
    case 'stripe':
      return processStripePayment(request);
    default:
      return {
        success: false,
        errorMessage: `Unsupported payment gateway: ${gatewayName}`,
      };
  }
}
