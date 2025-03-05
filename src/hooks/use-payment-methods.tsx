
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PaymentMethod } from '@/types/payment';
import { CreditCard } from 'lucide-react';
import React from 'react';

export function usePaymentMethods() {
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethod[]> => {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_enabled', true);

      if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
      }

      // Transform the database records into PaymentMethod objects
      return data.map(gateway => {
        let icon = <CreditCard className="h-5 w-5" />;
        let description = 'Pay securely';
        
        if (gateway.gateway_name === 'PayPal') {
          icon = (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42c-.476 3.118-2.87 5.209-6.433 5.209H12.75a.59.59 0 0 0-.582.642l.618 3.913c.05.316.33.558.651.558h2.733c.52 0 .963-.375 1.044-.89.022-.123.049-.25.077-.382.173-.753.356-1.534.356-2.21 0-.6.051-.72.65-.72h.635c2.711 0 4.82-1.104 5.43-4.3.215-1.119.077-2.122-.487-2.78-.312-.37-.789-.648-1.435-.868-.317-.118-.74-.206-1.22-.272z" />
            </svg>
          );
          description = 'Pay with PayPal';
        } else if (gateway.gateway_name === 'Stripe') {
          description = 'Pay with credit card';
        }

        return {
          id: gateway.gateway_name.toLowerCase(),
          name: gateway.gateway_name,
          description,
          icon,
          isEnabled: gateway.is_enabled
        };
      });
    }
  });

  return {
    paymentMethods: paymentMethods || [],
    isLoading,
    error
  };
}
