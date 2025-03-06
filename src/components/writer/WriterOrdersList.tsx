
import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OrdersLoadingSkeleton } from '../client/OrdersLoadingSkeleton';
import { OrderItem } from '@/types';
import { WriterOrdersTable } from './WriterOrdersTable';

export const WriterOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchWriterOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch orders assigned to this writer
        const { data, error } = await supabase
          .from('assignment_details')
          .select('*')
          .eq('writer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching writer orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWriterOrders();
  }, [toast]);

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border">
        <p className="text-lg font-medium mb-2">No Orders Yet</p>
        <p className="text-muted-foreground text-center max-w-md">
          You haven't taken any orders yet. Visit the Available Orders section to find writing tasks.
        </p>
      </div>
    );
  }

  return <WriterOrdersTable orders={orders} showTakeButton={false} />;
};
