
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { PaymentGateway, PaymentGatewayFormValues } from '@/types/payment';

async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  const { data, error } = await supabase
    .from('payment_gateways')
    .select('*')
    .order('gateway_name');

  if (error) {
    console.error('Error fetching payment gateways:', error);
    throw error;
  }

  return data || [];
}

async function updatePaymentGateway(
  gateway: { id: string } & PaymentGatewayFormValues
): Promise<PaymentGateway> {
  const { id, ...updateData } = gateway;
  
  console.log('Updating payment gateway:', id, updateData);
  
  const { data, error } = await supabase
    .from('payment_gateways')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment gateway:', error);
    throw error;
  }

  console.log('Payment gateway updated:', data);
  return data;
}

export function usePaymentGateways() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const {
    data: paymentGateways,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: fetchPaymentGateways,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const updateGatewayMutation = useMutation({
    mutationFn: updatePaymentGateway,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      // Also invalidate payment-methods query which might be using this data
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: 'Payment gateway updated',
        description: `${data.gateway_name} settings have been saved successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Failed to update payment gateway:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'There was an error updating your payment gateway settings.',
        variant: 'destructive',
      });
    }
  });

  return {
    paymentGateways,
    isLoading,
    error,
    selectedGateway,
    setSelectedGateway,
    updateGateway: updateGatewayMutation.mutate,
    isPending: updateGatewayMutation.isPending,
    isError: updateGatewayMutation.isError,
    updateGatewayAsync: updateGatewayMutation.mutateAsync
  };
}
