
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, Calendar, Clock, FileSymlink, Book, Hash, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface OrderFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

interface OrderDetails {
  id: string;
  assignment_code: string;
  paper_type: string;
  subject: string;
  topic: string | null;
  pages: number;
  deadline: string;
  instructions: string | null;
  citation_style: string | null;
  sources: number | null;
  final_price: number;
  status: string;
  created_at: string;
}

const ClientOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = React.useState<OrderDetails | null>(null);
  const [files, setFiles] = React.useState<OrderFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== UserRole.CLIENT)) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;

      try {
        setIsLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('assignment_details')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (orderError) {
          throw orderError;
        }

        if (!orderData) {
          toast({
            title: "Order not found",
            description: "The requested order does not exist or you don't have access to it.",
            variant: "destructive",
          });
          navigate('/client-dashboard/orders');
          return;
        }

        setOrder(orderData as OrderDetails);

        // Fetch files associated with this order
        const { data: filesData, error: filesError } = await supabase
          .from('assignment_files')
          .select('*')
          .eq('assignment_id', orderId);

        if (filesError) {
          console.error("Error fetching files:", filesError);
        } else {
          setFiles(filesData as OrderFile[]);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, user, isAuthLoading, navigate, toast]);

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignment_files')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create a download link for the file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">
              View the details of your academic order
            </p>
          </div>
          <Button 
            onClick={() => navigate('/client-dashboard/orders')}
            variant="outline"
          >
            Back to Orders
          </Button>
        </div>

        {order ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.topic || order.paper_type}</CardTitle>
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4 mr-1" />
                      Assignment Code: {order.assignment_code}
                    </div>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <FileSymlink className="h-4 w-4 mr-2" />
                      Type
                    </h3>
                    <p>{order.paper_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <Book className="h-4 w-4 mr-2" />
                      Subject
                    </h3>
                    <p>{order.subject}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Deadline
                    </h3>
                    <p>{format(new Date(order.deadline), 'PPP p')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Order Date
                    </h3>
                    <p>{format(new Date(order.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Pages
                    </h3>
                    <p>{order.pages} page{order.pages !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center mb-2 text-sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price
                    </h3>
                    <p className="text-green-600 font-medium">${order.final_price}</p>
                  </div>
                </div>

                {order.instructions && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <p className="text-sm whitespace-pre-line">{order.instructions}</p>
                  </div>
                )}

                {order.citation_style && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Citation Style</h3>
                    <p className="text-sm">{order.citation_style.toUpperCase()}</p>
                  </div>
                )}

                {order.sources !== null && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Required Sources</h3>
                    <p className="text-sm">{order.sources}</p>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Attached Files</h3>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{file.file_name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadFile(file.file_path, file.file_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button 
                className="mt-6" 
                onClick={() => navigate('/client-dashboard/orders')}
              >
                Go to My Orders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientOrderDetails;
