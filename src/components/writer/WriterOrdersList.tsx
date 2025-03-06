
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  OrderItem, 
  OrderStatus, 
  getStatusBadgeVariant, 
  getStatusLabel 
} from '@/types/order';
import { useNavigate } from 'react-router-dom';
import { OrdersTable } from '@/components/client/OrdersTable';
import { Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Define specific props for the component
interface WriterOrdersListProps {
  type: 'available' | 'current';
}

export const WriterOrdersList: React.FC<WriterOrdersListProps> = ({ type }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to fetch orders based on type
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('assignment_details')
        .select('*');
      
      if (type === 'available') {
        // Available orders should have status 'available' or similar and no writer assigned
        query = query.is('writer_id', null);
      } else if (type === 'current') {
        // Current orders should be assigned to the current writer
        query = query.eq('writer_id', supabase.auth.getUser().then(({data}) => data.user?.id));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
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

  const handleViewDetails = (orderId: string) => {
    navigate(`/writer-dashboard/orders/${orderId}`);
  };

  const handleTakeOrder = async (orderId: string) => {
    try {
      const user = await supabase.auth.getUser();
      const writerId = user.data.user?.id;
      
      if (!writerId) {
        toast({
          title: 'Error',
          description: 'You must be logged in to take orders.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('assignment_details')
        .update({
          writer_id: writerId,
          status: OrderStatus.CLAIMED
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'You have successfully claimed this order.',
      });
      
      // Refresh the list
      fetchOrders();
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReleaseOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('assignment_details')
        .update({
          writer_id: null,
          status: OrderStatus.AVAILABLE
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'You have successfully released this order.',
      });
      
      // Refresh the list
      fetchOrders();
    } catch (error) {
      console.error('Error releasing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to release order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('assignment_details')
        .update({
          status: newStatus
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${getStatusLabel(newStatus)}.`,
      });
      
      // Refresh the list
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter orders based on status filter
  const filteredOrders = orders.filter(order => {
    return statusFilter === '' || order.status === statusFilter;
  });

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('writer_order_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_details'
        },
        (payload) => {
          console.log('Realtime update for writer:', payload);
          
          // Refresh the orders list on any change
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {Object.values(OrderStatus).map(status => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {type === 'available' 
              ? 'There are currently no available orders to claim.' 
              : 'You have no current orders at this time.'}
          </p>
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
};
