
import { supabase } from '@/lib/supabase';

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  order?: any;
  error?: string;
}

interface CaptureOrderResponse {
  success: boolean;
  status?: string;
  captureResult?: any;
  error?: string;
}

interface PayoutResponse {
  success: boolean;
  batch_id?: string;
  transactionId?: string;
  error?: string;
}

interface CheckStatusResponse {
  success: boolean;
  status?: string;
  paypalStatus?: string;
  statusDetails?: any;
  error?: string;
}

export async function createPayPalOrder(amount: number, walletId: string): Promise<CreateOrderResponse> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        walletId
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating order'
    };
  }
}

export async function capturePayPalOrder(orderId: string): Promise<CaptureOrderResponse> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderId
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error capturing order'
    };
  }
}

export async function createPayPalPayout(
  amount: number, 
  walletId: string, 
  paypalEmail: string
): Promise<PayoutResponse> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        walletId,
        paypalEmail
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating payout'
    };
  }
}

export async function checkPayoutStatus(transactionId: string): Promise<CheckStatusResponse> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-check-payout-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        transactionId
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error checking PayPal payout status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking status'
    };
  }
}
