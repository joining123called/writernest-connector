
import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OrdersLoadingSkeleton } from './OrdersLoadingSkeleton';
import { EmptyOrdersState } from './EmptyOrdersState';
import { OrdersTable } from './OrdersTable';

interface OrderItem {
  id: string;
  assignment_code: string;
  topic: string | null;
  paper_type: string;
  subject: string;
  deadline: string;
  pages: number;
  final_price: number;
  status: string;
}

export const ClientOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Using 'any' as a temporary workaround for Supabase type issues
        const { data, error } = await (supabase as any)
          .from('assignment_details')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  if (orders.length === 0) {
    return <EmptyOrdersState />;
  }

  return <OrdersTable orders={orders} />;
};
