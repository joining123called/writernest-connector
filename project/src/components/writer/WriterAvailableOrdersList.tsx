
import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OrdersLoadingSkeleton } from '../client/OrdersLoadingSkeleton';
import { OrderItem } from '@/types';
import { WriterOrdersTable } from './WriterOrdersTable';

export const WriterAvailableOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchAvailableOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch all available orders (not assigned to any writer)
        const { data, error } = await supabase
          .from('assignment_details')
          .select('*')
          .is('writer_id', null)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching available orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableOrders();
  }, [toast]);

  const handleTakeOrder = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be logged in to take an order.',
          variant: 'destructive',
        });
        return;
      }

      // Update the order to assign it to the current writer
      const { error } = await supabase
        .from('assignment_details')
        .update({ writer_id: user.id, status: 'in_progress' })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Remove the order from the available orders list
      setOrders(orders.filter(order => order.id !== orderId));
      
      toast({
        title: 'Order Taken',
        description: 'You have successfully taken this order. It will now appear in your Current Orders.',
      });
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: 'Error',
        description: 'Failed to take the order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border">
        <p className="text-lg font-medium mb-2">No Available Orders</p>
        <p className="text-muted-foreground text-center max-w-md">
          There are currently no available orders for you to take. Please check back later.
        </p>
      </div>
    );
  }

  return <WriterOrdersTable orders={orders} onTakeOrder={handleTakeOrder} showTakeButton={true} />;
};
