
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ClientDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.CLIENT)) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

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
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">3</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +2 from last week
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">12</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +5 from last month
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Revisions</span>
            </div>
            <div className="mt-4 text-3xl font-bold">1</div>
            <div className="mt-2 text-xs text-muted-foreground">
              -2 from last week
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Spent</span>
            </div>
            <div className="mt-4 text-3xl font-bold">$1,240</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +$345 from last month
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <p className="text-muted-foreground">Your recent orders will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
