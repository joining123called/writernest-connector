
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminDashboard = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin-login');
    }
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.fullName}! Here's an overview of the platform.
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="mt-4 text-3xl font-bold">324</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +18 from last week
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Orders</span>
            </div>
            <div className="mt-4 text-3xl font-bold">42</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +7 from yesterday
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Open Disputes</span>
            </div>
            <div className="mt-4 text-3xl font-bold">5</div>
            <div className="mt-2 text-xs text-muted-foreground">
              -2 from last week
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="mt-4 text-3xl font-bold">$24,680</div>
            <div className="mt-2 text-xs text-muted-foreground">
              +$4,350 from last month
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Platform Activity</h2>
            <p className="text-muted-foreground">Platform activity overview will appear here.</p>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Disputes</h2>
            <p className="text-muted-foreground">Recent disputes will appear here.</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">New Users</h2>
            <p className="text-muted-foreground">New user registrations will appear here.</p>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
            <p className="text-muted-foreground">Financial metrics will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
