
import React, { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalButtonsProps {
  amount: number;
  onSuccess: (transactionId: string, amount: number) => void;
  onError: (error: string) => void;
  clientId: string;
  walletId: string;
}

export const PayPalButtons = ({ 
  amount, 
  onSuccess, 
  onError, 
  clientId, 
  walletId 
}: PayPalButtonsProps) => {
  const { toast } = useToast();
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const paypalScriptLoaded = useRef(false);

  useEffect(() => {
    if (!clientId || amount <= 0 || !paypalButtonRef.current) return;

    const loadPayPalScript = () => {
      // Don't load script if it's already loading or loaded
      if (document.querySelector('script[src*="paypal.com/sdk/js"]') || paypalScriptLoaded.current) {
        return;
      }

      paypalScriptLoaded.current = true;
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.dataset.namespace = "paypalSdkButtons";
      
      script.onload = () => {
        if (window.paypal && paypalButtonRef.current) {
          paypalButtonRef.current.innerHTML = '';
          window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay'
            },
            createOrder: async () => {
              try {
                // Create the order through our server-side endpoint
                const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-create-order`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                  },
                  body: JSON.stringify({
                    amount: amount.toString(),
                    walletId: walletId
                  })
                });
                
                const data = await response.json();
                
                if (!data.success) {
                  throw new Error(data.error || 'Failed to create PayPal order');
                }
                
                return data.orderId;
              } catch (error) {
                console.error('Error creating PayPal order:', error);
                onError(error instanceof Error ? error.message : 'Failed to create PayPal order');
                throw error;
              }
            },
            onApprove: async (data: any, actions: any) => {
              try {
                // Capture the order through our server-side endpoint
                const response = await fetch(`${window.location.origin}/.netlify/functions/paypal-capture-order`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                  },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    walletId: walletId
                  })
                });
                
                const result = await response.json();
                
                if (!result.success) {
                  throw new Error(result.error || 'Failed to capture PayPal order');
                }
                
                // Call the success callback with the captured order details
                onSuccess(data.orderID, amount);
              } catch (error) {
                console.error('Error capturing PayPal order:', error);
                onError(error instanceof Error ? error.message : 'Failed to capture PayPal order');
              }
            },
            onCancel: () => {
              toast({
                title: "Payment cancelled",
                description: "You cancelled the PayPal payment.",
              });
            },
            onError: (err: any) => {
              console.error('PayPal error:', err);
              onError(err instanceof Error ? err.message : 'Error with PayPal transaction');
            }
          }).render(paypalButtonRef.current);
        }
      };
      
      script.onerror = () => {
        paypalScriptLoaded.current = false;
        console.error('PayPal script failed to load');
        onError('PayPal services are currently unavailable. Please try again later.');
      };
      
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      // Cleanup is handled by not removing the script to avoid issues with reloading
      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }
    };
  }, [amount, clientId, onError, onSuccess, toast, walletId]);

  return (
    <div className="paypal-button-container">
      <div ref={paypalButtonRef} className="min-h-[45px]">
        <div className="flex justify-center items-center h-12">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
          <span>Loading PayPal...</span>
        </div>
      </div>
    </div>
  );
};
