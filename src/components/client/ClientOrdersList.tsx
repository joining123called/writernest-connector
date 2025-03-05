
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  assignment_code: string;
  topic: string | null;
  paper_type: string;
  subject: string;
  deadline: string;
  pages: number;
  final_price: number;
  status: string;
}

export const ClientOrdersList: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

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

    fetchOrders();
  }, [toast]);

  const getDeadlineText = (deadlineDate: string) => {
    const date = new Date(deadlineDate);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const determineLevel = (paperType: string): string => {
    // Map paper types to academic levels (this is a simplified example)
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

  const viewOrderDetails = (id: string) => {
    navigate(`/client-dashboard/orders/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No orders yet</h3>
          <p className="text-muted-foreground">
            You haven't placed any orders yet. Get started by creating your first order.
          </p>
          <Button onClick={() => navigate('/client-dashboard/order')} className="mt-2">
            Create New Order
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg line-clamp-1">
                    {order.topic || order.paper_type}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assignment #{order.assignment_code}
                  </p>
                </div>
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/90"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{determineLevel(order.paper_type)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1 inline" />
                    {getDeadlineText(order.deadline)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Number of pages</p>
                  <p className="font-medium">{order.pages}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Salary</p>
                  <p className="font-medium text-green-600">${order.final_price}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {order.status === 'pending' ? 'Awaiting Writer' : 
                   order.status === 'in_progress' ? 'In Progress' : 
                   order.status === 'completed' ? 'Completed' : 
                   order.status}
                </div>
                <div className="text-xs">
                  Due: {format(new Date(order.deadline), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
