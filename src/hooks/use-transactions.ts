
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/payment';
import { useAuth } from '@/contexts/auth';

export function useTransactions() {
  const { user, isAdmin } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      try {
        const { data } = await supabase.functions.invoke('get-transactions', {
          body: { userId: user.id, isAdmin },
        });
        
        if (data.error) throw new Error(data.error);
        
        return data.transactions || [];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
    },
    enabled: !!user,
  });

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch
  };
}
