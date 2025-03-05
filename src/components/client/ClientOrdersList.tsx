
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

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

        // Using 'any' as a temporary workaround for Supabase type issues
        const { data, error } = await (supabase as any)
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

  const determineLevel = (paperType: string): string => {
    // Map paper types to academic levels
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

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const days = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d ${date.getHours()}h`;
    } else {
      const hours = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      return `${hours}h`;
    }
  };

  const viewOrderDetails = (id: string) => {
    navigate(`/client-dashboard/orders/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full p-4">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card shadow-sm">
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
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Topic</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Level</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Deadline</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Number of pages</th>
              <th className="py-3 px-4 text-right font-medium text-muted-foreground">Salary</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => viewOrderDetails(order.id)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{order.topic || order.paper_type}</div>
                </td>
                <td className="py-3 px-4">
                  {determineLevel(order.paper_type)}
                </td>
                <td className="py-3 px-4">
                  {formatDeadline(order.deadline)}
                </td>
                <td className="py-3 px-4">
                  {order.pages}
                </td>
                <td className="py-3 px-4 text-right font-medium text-green-600">
                  ${order.final_price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
