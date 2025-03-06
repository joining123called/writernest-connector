
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileIcon, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';

interface OrderDetails {
  id: string;
  assignment_code: string;
  paper_type: string;
  subject: string;
  topic: string | null;
  pages: number;
  status: string;
  deadline: string;
  instructions: string | null;
  citation_style: string | null;
  sources: number | null;
  final_price: number;
  created_at: string;
}

interface OrderFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

const ClientOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = React.useState<OrderDetails | null>(null);
  const [orderFiles, setOrderFiles] = React.useState<OrderFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setIsLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Using 'any' as a temporary workaround for Supabase type issues
        const { data, error } = await (supabase as any)
          .from('assignment_details')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', currentUser.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          navigate('/client-dashboard/orders');
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist or you don't have permission to view it.",
            variant: "destructive",
          });
          return;
        }
        
        setOrderDetails(data as OrderDetails);
        
        // Fetch associated files
        const { data: fileData, error: fileError } = await (supabase as any)
          .from('assignment_files')
          .select('*')
          .eq('assignment_id', orderId);
          
        if (fileError) {
          console.error('Error fetching files:', fileError);
        } else {
          setOrderFiles(fileData || []);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate, toast]);

  const determineLevel = (paperType: string): string => {
    const levelMap: Record<string, string> = {
      'research_paper': 'Undergraduate',
      'essay': 'High School',
      'thesis': 'Master',
      'dissertation': 'Ph.D.',
      'case_study': 'Undergraduate',
      'term_paper': 'Undergraduate',
      'book_review': 'High School',
      'article_review': 'Undergraduate',
      'annotated_bibliography': 'Master',
      'reaction_paper': 'High School',
      'lab_report': 'Ph.D.',
    };
    
    return levelMap[paperType] || 'Undergraduate';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'revision': { color: 'bg-purple-100 text-purple-800', label: 'Revision' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <Badge variant="outline" className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignment_files')
        .download(filePath);
        
      if (error) {
        throw error;
      }
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!orderDetails) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/client-dashboard/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-3 h-8"
              onClick={() => navigate('/client-dashboard/orders')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {orderDetails.topic || orderDetails.paper_type}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Assignment #{orderDetails.assignment_code}
              </p>
              {getStatusBadge(orderDetails.status)}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-3xl font-bold text-green-600">${orderDetails.final_price}</div>
            <p className="text-sm text-muted-foreground">
              Created on {format(new Date(orderDetails.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Assignment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{orderDetails.paper_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-medium">{orderDetails.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Academic Level</p>
                      <p className="font-medium">{determineLevel(orderDetails.paper_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Citation Style</p>
                      <p className="font-medium">{orderDetails.citation_style || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sources</p>
                      <p className="font-medium">{orderDetails.sources || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Size & Deadline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Pages</p>
                      <p className="font-medium">{orderDetails.pages}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Word Count</p>
                      <p className="font-medium">{orderDetails.pages * 275} words</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{format(new Date(orderDetails.deadline), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {orderDetails.topic && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Topic</h3>
                  <p className="text-base">{orderDetails.topic}</p>
                </div>
              )}
              
              {orderDetails.instructions && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Instructions</h3>
                  <p className="text-base whitespace-pre-line">{orderDetails.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Attached Files</h2>
              
              {orderFiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No files attached to this order</p>
              ) : (
                <div className="space-y-3">
                  {orderFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileIcon className="h-5 w-5 text-blue-500" />
                        <div className="truncate max-w-[200px]">
                          <p className="font-medium text-sm truncate">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => downloadFile(file.file_path, file.file_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientOrderDetails;
