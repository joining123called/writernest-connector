
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { OrderItem, OrderStatus, getStatusBadgeVariant, getStatusLabel } from '@/types/order';
import { Loader2 } from 'lucide-react';

interface WriterOrdersListProps {
  type: 'available' | 'current';
}

export const WriterOrdersList: React.FC<WriterOrdersListProps> = ({ type }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from('assignment_details')
        .select('*')
        .order('deadline', { ascending: true });
      
      if (type === 'available') {
        // Get orders that don't have a writer assigned and are in PAYMENT_CONFIRMED status
        query = query
          .is('writer_id', null)
          .eq('status', OrderStatus.PAYMENT_CONFIRMED);
      } else {
        // Get orders assigned to the current writer
        query = query.eq('writer_id', user.id);
      }
      
      const { data, error } = await query;
      
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

  const handleTakeOrder = async (orderId: string) => {
    try {
      setIsProcessing(orderId);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to take orders.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update the order to assign it to this writer and change status
      const { error } = await supabase
        .from('assignment_details')
        .update({
          writer_id: user.id,
          status: OrderStatus.WRITER_ASSIGNED
        })
        .eq('id', orderId)
        .is('writer_id', null); // Only if no writer is assigned
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Order Assigned',
        description: 'You have successfully taken this order.',
      });
      
      // Refresh the list
      fetchOrders();
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: 'Error',
        description: 'Failed to take order. It may have been assigned to another writer.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReleaseOrder = async (orderId: string) => {
    try {
      setIsProcessing(orderId);
      
      // Update the order to release it
      const { error } = await supabase
        .from('assignment_details')
        .update({
          writer_id: null,
          status: OrderStatus.PAYMENT_CONFIRMED
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Order Released',
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
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsProcessing(orderId);
      
      // Update the order status
      const { error } = await supabase
        .from('assignment_details')
        .update({
          status: newStatus
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
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
    } finally {
      setIsProcessing(null);
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/writer-dashboard/orders/${orderId}`);
  };

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('writer_assignment_changes')
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
          
          // Show toast notifications for various events
          if (payload.eventType === 'UPDATE') {
            // Only show notifications for status changes
            if (payload.old.status !== payload.new.status) {
              toast({
                title: 'Order Update',
                description: `Order #${(payload.new as OrderItem).assignment_code} status changed to ${getStatusLabel(payload.new.status)}.`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, type]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-2">No orders available</h3>
        <p className="text-muted-foreground">
          {type === 'available' 
            ? 'There are currently no available orders to take.' 
            : 'You have not taken any orders yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Paper Type</TableHead>
            <TableHead className="hidden md:table-cell">Subject</TableHead>
            <TableHead className="hidden md:table-cell">Deadline</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Pages</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Price</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.assignment_code}</TableCell>
              <TableCell>{order.paper_type.replace('_', ' ')}</TableCell>
              <TableCell className="hidden md:table-cell">{order.subject}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(order.deadline), 'MMM d, yyyy')}
                  </span>
                  <DeadlineCountdown deadline={order.deadline} />
                </div>
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell">{order.pages}</TableCell>
              <TableCell className="text-right hidden lg:table-cell">${order.final_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusBadgeVariant(order.status) as any}>
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View
                  </Button>
                  
                  {type === 'available' && (
                    <Button 
                      size="sm"
                      variant="default"
                      onClick={() => handleTakeOrder(order.id)}
                      disabled={isProcessing === order.id}
                    >
                      {isProcessing === order.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Taking...
                        </>
                      ) : 'Take Order'}
                    </Button>
                  )}
                  
                  {type === 'current' && (
                    <>
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReleaseOrder(order.id)}
                        disabled={isProcessing === order.id}
                      >
                        {isProcessing === order.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Releasing...
                          </>
                        ) : 'Release'}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
