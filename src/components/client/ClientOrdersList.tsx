
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OrdersLoadingSkeleton } from './OrdersLoadingSkeleton';
import { EmptyOrdersState } from './EmptyOrdersState';
import { OrdersTable } from './OrdersTable';
import { OrderItem } from '@/types/order';

export const ClientOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Using the type assertion to properly handle the database schema differences
      const { data, error } = await supabase
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

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('assignment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_details',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            setOrders(prevOrders => [payload.new as OrderItem, ...prevOrders]);
            
            toast({
              title: 'New Order',
              description: `Order #${(payload.new as OrderItem).assignment_code} has been created.`,
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === payload.new.id ? (payload.new as OrderItem) : order
              )
            );
            
            // Only show status change notifications
            if (payload.old.status !== payload.new.status) {
              toast({
                title: 'Order Status Updated',
                description: `Order #${(payload.new as OrderItem).assignment_code} is now ${(payload.new as OrderItem).status.replace('_', ' ')}.`,
              });
            }
          } 
          else if (payload.eventType === 'DELETE') {
            setOrders(prevOrders => 
              prevOrders.filter(order => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  if (isLoading) {
    return <OrdersLoadingSkeleton />;
  }

  if (orders.length === 0) {
    return <EmptyOrdersState />;
  }

  return <OrdersTable orders={orders} />;
};
