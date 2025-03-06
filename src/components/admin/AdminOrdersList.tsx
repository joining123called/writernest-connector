
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  OrderItem, 
  OrderStatus, 
  getStatusBadgeVariant, 
  getStatusLabel 
} from '@/types/order';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<(OrderItem & { client?: Profile, writer?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('assignment_details')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch all profiles to get client and writer names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Map profiles to orders
      const ordersWithProfiles = ordersData.map(order => {
        const client = profilesData.find(profile => profile.id === order.user_id);
        const writer = order.writer_id 
          ? profilesData.find(profile => profile.id === order.writer_id) 
          : undefined;
          
        return {
          ...order,
          client,
          writer
        };
      });
      
      setOrders(ordersWithProfiles);
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
    navigate(`/admin-dashboard/orders/${orderId}`);
  };

  const handleWriterAssign = async (orderId: string, writerId: string | null) => {
    try {
      setIsProcessing(orderId);
      
      // Update the writer assignment
      const { error } = await supabase
        .from('assignment_details')
        .update({
          writer_id: writerId,
          status: writerId ? OrderStatus.WRITER_ASSIGNED : OrderStatus.PAYMENT_CONFIRMED
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: writerId ? 'Writer Assigned' : 'Writer Unassigned',
        description: writerId 
          ? 'Writer has been successfully assigned to this order.' 
          : 'Writer has been removed from this order.',
      });
      
      // Refresh the list
      fetchOrders();
    } catch (error) {
      console.error('Error assigning writer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update writer assignment. Please try again.',
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
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      searchQuery === '' || 
      order.assignment_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.writer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.paper_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('admin_order_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_details'
        },
        (payload) => {
          console.log('Realtime update for admin:', payload);
          
          // Refresh the orders list on any change
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID, client, writer, or type..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
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
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filter criteria.' 
              : 'There are no orders in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Writer</TableHead>
                <TableHead className="hidden xl:table-cell">Paper Type</TableHead>
                <TableHead className="hidden lg:table-cell">Subject</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
                <TableHead className="hidden sm:table-cell">Pages</TableHead>
                <TableHead className="text-right hidden md:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.assignment_code}</TableCell>
                  <TableCell>{order.client?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{order.writer?.full_name || 'Unassigned'}</TableCell>
                  <TableCell className="hidden xl:table-cell">{order.paper_type.replace('_', ' ')}</TableCell>
                  <TableCell className="hidden lg:table-cell">{order.subject}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.deadline), 'MMM d, yyyy')}
                      </span>
                      <DeadlineCountdown deadline={order.deadline} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{order.pages}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">${order.final_price.toFixed(2)}</TableCell>
                  <TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
