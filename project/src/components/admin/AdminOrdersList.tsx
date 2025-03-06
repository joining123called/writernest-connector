
import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OrdersLoadingSkeleton } from '../client/OrdersLoadingSkeleton';
import { OrderItem } from '@/types';
import { AdminOrdersTable } from './AdminOrdersTable';

export const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch all orders
        const { data, error } = await supabase
          .from('assignment_details')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOrders();
  }, [toast]);

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border">
        <p className="text-lg font-medium mb-2">No Orders Found</p>
        <p className="text-muted-foreground text-center max-w-md">
          There are currently no orders in the system.
        </p>
      </div>
    );
  }

  return <AdminOrdersTable orders={orders} />;
};
