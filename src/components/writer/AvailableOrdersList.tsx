
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { OrderItem, OrderStatus, getStatusBadgeVariant, getStatusLabel } from '@/types/order';
import { useAuth } from '@/contexts/auth';
import { CircleCheck, Loader2 } from 'lucide-react';

export const AvailableOrdersList = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingOrderId, setTakingOrderId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchAvailableOrders();
  }, []);
  
  const fetchAvailableOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch orders that are available (no writer assigned yet)
      const { data, error } = await supabase
        .from('assignment_details')
        .select('*')
        .is('writer_id', null)
        .eq('status', OrderStatus.AVAILABLE)
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
  
  const handleViewDetails = (orderId: string) => {
    navigate(`/writer-dashboard/available-orders/${orderId}`);
  };
  
  const handleTakeOrder = async (orderId: string) => {
    if (!user?.id) return;
    
    try {
      setTakingOrderId(orderId);
      
      // Update the order with the writer's ID and change status to CLAIMED
      const { error } = await supabase
        .from('assignment_details')
        .update({ 
          writer_id: user.id,
          status: OrderStatus.CLAIMED
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Remove the taken order from the list
      setOrders(orders.filter(order => order.id !== orderId));
      
      toast({
        title: 'Order Claimed',
        description: 'You have successfully claimed this order. You can find it in your Current Orders.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTakingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading available orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No Available Orders</h3>
        <p className="text-muted-foreground">
          There are currently no available orders to claim. Check back later!
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
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.assignment_code}</TableCell>
              <TableCell>{order.paper_type}</TableCell>
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
              <TableCell className="text-right">${order.final_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={takingOrderId === order.id}
                    onClick={() => handleTakeOrder(order.id)}
                  >
                    {takingOrderId === order.id ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CircleCheck className="mr-1 h-3 w-3" /> 
                        Take Order
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
