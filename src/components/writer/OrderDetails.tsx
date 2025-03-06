
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CircleCheck, 
  CircleX, 
  Clock, 
  Download, 
  FileText, 
  Loader2,
  PaperClip
} from 'lucide-react';
import { OrderItem, OrderFile, OrderStatus, getStatusBadgeVariant, getStatusLabel } from '@/types/order';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { Toast } from '@/hooks/use-toast';

export const OrderDetails = ({ viewMode = 'available' }: { viewMode?: 'available' | 'current' }) => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [orderFiles, setOrderFiles] = useState<OrderFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('assignment_details')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Fetch order files
      const { data: filesData, error: filesError } = await supabase
        .from('assignment_files')
        .select('*')
        .eq('assignment_id', orderId);
      
      if (filesError) throw filesError;
      
      setOrder(orderData);
      setOrderFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTakeOrder = async () => {
    if (!order || !user) return;
    
    try {
      setIsActionLoading(true);
      
      const { error } = await supabase
        .from('assignment_details')
        .update({ 
          writer_id: user.id,
          status: OrderStatus.CLAIMED
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast({
        title: 'Order Claimed',
        description: 'You have successfully claimed this order. You can find it in your Current Orders.',
        variant: 'default',
      });
      
      // Navigate to current orders
      navigate('/writer-dashboard/orders');
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleReleaseOrder = async () => {
    if (!order) return;
    
    try {
      setIsActionLoading(true);
      
      const { error } = await supabase
        .from('assignment_details')
        .update({ 
          writer_id: null,
          status: OrderStatus.AVAILABLE
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast({
        title: 'Order Released',
        description: 'You have successfully released this order. It is now available for other writers.',
        variant: 'default',
      });
      
      // Navigate to writer dashboard
      navigate('/writer-dashboard');
    } catch (error) {
      console.error('Error releasing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to release order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleDownloadFile = async (file: OrderFile) => {
    try {
      // This is a placeholder - actual implementation depends on how
      // files are stored (e.g., Supabase Storage)
      toast({
        title: 'Downloading File',
        description: `Downloading ${file.file_name}...`,
      });
      
      // Example if using Supabase Storage:
      // const { data, error } = await supabase.storage
      //   .from('assignment-files')
      //   .download(file.file_path);
      
      // if (error) throw error;
      
      // const url = URL.createObjectURL(data);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.file_name;
      // document.body.appendChild(a);
      // a.click();
      // URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Order Not Found</h3>
        <p className="text-muted-foreground">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button 
          className="mt-4" 
          onClick={() => navigate(viewMode === 'available' ? '/writer-dashboard/available-orders' : '/writer-dashboard/orders')}
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Order #{order.assignment_code}</CardTitle>
              <CardDescription>
                Created on {format(new Date(order.created_at), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status) as any} className="ml-auto">
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Paper Type</h3>
              <p className="font-medium">{order.paper_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
              <p className="font-medium">{order.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Pages</h3>
              <p className="font-medium">{order.pages}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h3>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium mr-2">
                  {format(new Date(order.deadline), 'MMM d, yyyy')}
                </span>
                <DeadlineCountdown deadline={order.deadline} />
              </div>
            </div>
            {order.citation_style && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Citation Style</h3>
                <p className="font-medium">{order.citation_style}</p>
              </div>
            )}
            {order.sources !== null && order.sources !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Sources Required</h3>
                <p className="font-medium">{order.sources}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Topic</h3>
            <p className="p-3 bg-muted rounded-md">{order.topic || 'No topic provided'}</p>
          </div>
          
          {order.instructions && (
            <div>
              <h3 className="text-sm font-medium mb-2">Instructions</h3>
              <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                {order.instructions}
              </div>
            </div>
          )}
          
          {orderFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Attached Files</h3>
              <ul className="space-y-2">
                {orderFiles.map(file => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center">
                      <PaperClip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{file.file_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({(file.file_size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(viewMode === 'available' ? '/writer-dashboard/available-orders' : '/writer-dashboard/orders')}
          >
            Go Back
          </Button>
          
          {viewMode === 'available' ? (
            <Button
              disabled={isActionLoading}
              onClick={handleTakeOrder}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CircleCheck className="mr-2 h-4 w-4" />
                  Take Order
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="destructive"
              disabled={isActionLoading}
              onClick={handleReleaseOrder}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CircleX className="mr-2 h-4 w-4" />
                  Release Order
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
