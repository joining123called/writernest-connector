
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const WriterDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.WRITER)) {
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
            <h1 className="text-3xl font-bold tracking-tight">Writer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.fullName}! Here's an overview of your writing assignments.
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">5</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +1 from yesterday
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available Bids</span>
            </div>
            <div className="mt-4 text-3xl font-bold">8</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +3 from yesterday
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">27</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +5 from last week
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Earnings</span>
            </div>
            <div className="mt-4 text-3xl font-bold">$2,450</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +$750 from last month
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Current Orders</h2>
            <p className="text-muted-foreground">Your current orders will appear here.</p>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Bids</h2>
            <p className="text-muted-foreground">Your recent bids will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WriterDashboard;
