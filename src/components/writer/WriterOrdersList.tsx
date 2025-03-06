import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { OrderItem, OrderStatus, getStatusBadgeVariant, getStatusLabel } from '@/types/order';
import { useAuth } from '@/contexts/auth';
import { CircleX, Loader2, RefreshCw } from 'lucide-react';

export const WriterOrdersList = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user?.id) {
      fetchWriterOrders();
    }
  }, [user]);
  
  const fetchWriterOrders = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
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
  
  const handleViewDetails = (orderId: string) => {
    navigate(`/writer-dashboard/orders/${orderId}`);
  };
  
  const handleReleaseOrder = async (orderId: string) => {
    try {
      setReleasingOrderId(orderId);
      
      const { error } = await supabase
        .from('assignment_details')
        .update({ 
          writer_id: null,
          status: OrderStatus.AVAILABLE
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      setOrders(orders.filter(order => order.id !== orderId));
      
      toast({
        title: 'Order Released',
        description: 'You have successfully released this order. It is now available for other writers.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error releasing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to release order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setReleasingOrderId(null);
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      
      const { error } = await supabase
        .from('assignment_details')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      toast({
        title: 'Status Updated',
        description: `Order status has been updated to "${getStatusLabel(newStatus)}"`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const writerStatuses = [
    OrderStatus.NOT_STARTED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.ON_HOLD,
    OrderStatus.SUBMITTED,
    OrderStatus.REVISION_IN_PROGRESS,
    OrderStatus.RESUBMITTED
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No Current Orders</h3>
        <p className="text-muted-foreground">
          You don't have any current orders. Check the Available Orders section to find work!
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
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell>
                <div className="flex flex-col space-y-2">
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  
                  <Select
                    disabled={updatingStatus === order.id}
                    defaultValue={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="h-7 w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {writerStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
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
                    variant="destructive"
                    size="sm"
                    disabled={releasingOrderId === order.id}
                    onClick={() => handleReleaseOrder(order.id)}
                  >
                    {releasingOrderId === order.id ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 
                        Releasing...
                      </>
                    ) : (
                      <>
                        <CircleX className="mr-1 h-3 w-3" /> 
                        Release Order
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
