
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createPayPalOrder, capturePayPalOrder } from './PayPalUtils';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonsProps {
  amount: number;
  walletId: string;
  clientId: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

export const PayPalButtons = ({ 
  amount, 
  walletId,
  clientId,
  onSuccess,
  onError,
  onCancel
}: PayPalButtonsProps) => {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load PayPal script
  useEffect(() => {
    if (!clientId || scriptLoaded) return;

    const loadPayPalScript = () => {
      if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
        setScriptLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => {
        console.log('PayPal script loaded');
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal script');
        toast({
          title: 'PayPal Error',
          description: 'Failed to load PayPal checkout. Please try again.',
          variant: 'destructive'
        });
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, [clientId, scriptLoaded, toast]);

  // Render PayPal buttons
  useEffect(() => {
    if (!scriptLoaded || !paypalButtonRef.current || !window.paypal) return;

    const renderButtons = async () => {
      if (!paypalButtonRef.current) return;
      
      // Clear any existing buttons
      paypalButtonRef.current.innerHTML = '';
      
      try {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          },
          createOrder: async () => {
            setIsLoading(true);
            try {
              // Use our backend to create the order
              const result = await createPayPalOrder(amount, walletId);
              
              if (!result.success) {
                throw new Error(result.error || 'Failed to create order');
              }
              
              return result.orderId as string;
            } catch (error) {
              console.error('Error in createOrder:', error);
              onError(error);
              throw error;
            } finally {
              setIsLoading(false);
            }
          },
          onApprove: async (data: any) => {
            setIsLoading(true);
            try {
              // Use our backend to capture the order
              const captureResult = await capturePayPalOrder(data.orderID);
              
              if (!captureResult.success) {
                throw new Error(captureResult.error || 'Failed to capture order');
              }
              
              onSuccess(captureResult);
              return captureResult;
            } catch (error) {
              console.error('Error in onApprove:', error);
              onError(error);
              throw error;
            } finally {
              setIsLoading(false);
            }
          },
          onCancel: () => {
            console.log('PayPal transaction cancelled');
            onCancel?.();
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            onError(err);
          }
        }).render(paypalButtonRef.current);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error rendering PayPal buttons:', error);
        onError(error);
        setIsLoading(false);
      }
    };

    renderButtons();
  }, [amount, walletId, scriptLoaded, onSuccess, onError, onCancel]);

  return (
    <div className="paypal-button-container">
      {isLoading && (
        <div className="flex justify-center items-center h-12 mb-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
          <span>Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalButtonRef} className="paypal-button-container"></div>
    </div>
  );
};
