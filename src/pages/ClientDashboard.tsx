
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FileText, PlusCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface OrderSummary {
  id: string;
  assignment_code: string;
  topic: string | null;
  paper_type: string;
  deadline: string;
  final_price: number;
  status: string;
}

const ClientDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [orderStats, setOrderStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    pendingRevisions: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.CLIENT)) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!user) return;

      try {
        // Fetch recent orders
        const { data: orders, error: ordersError } = await supabase
          .from('assignment_details')
          .select('id, assignment_code, topic, paper_type, deadline, final_price, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          console.error("Error fetching recent orders:", ordersError);
        } else {
          setRecentOrders(orders);
        }

        // Fetch order statistics
        const { data: activeOrdersData } = await supabase
          .from('assignment_details')
          .select('count')
          .eq('user_id', user.id)
          .in('status', ['pending', 'in_progress'])
          .single();

        const { data: completedOrdersData } = await supabase
          .from('assignment_details')
          .select('count')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .single();

        const { data: pendingRevisionsData } = await supabase
          .from('assignment_details')
          .select('count')
          .eq('user_id', user.id)
          .eq('status', 'revision')
          .single();

        const { data: totalSpentData } = await supabase
          .from('assignment_details')
          .select('final_price')
          .eq('user_id', user.id);

        const totalSpent = totalSpentData?.reduce((sum, order) => sum + order.final_price, 0) || 0;

        setOrderStats({
          activeOrders: activeOrdersData?.count || 0,
          completedOrders: completedOrdersData?.count || 0,
          pendingRevisions: pendingRevisionsData?.count || 0,
          totalSpent
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (user) {
      fetchOrderData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.fullName}! Here's an overview of your academic orders.
            </p>
          </div>
          <Button onClick={() => navigate('/client-dashboard/order')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">{orderStats.activeOrders}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">{orderStats.completedOrders}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Revisions</span>
            </div>
            <div className="mt-4 text-3xl font-bold">{orderStats.pendingRevisions}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Spent</span>
            </div>
            <div className="mt-4 text-3xl font-bold">${orderStats.totalSpent.toFixed(2)}</div>
          </motion.div>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" onClick={() => navigate('/client-dashboard/orders')}>View All</Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer"
                    onClick={() => navigate(`/client-dashboard/orders/${order.id}`)}
                  >
                    <div className="mb-2 sm:mb-0">
                      <div className="font-medium">{order.topic || order.paper_type}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        #{order.assignment_code} • {order.status}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="text-green-600 font-medium">${order.final_price}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(order.deadline), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/client-dashboard/order')}
                >
                  Create Your First Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
