
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WriterOrdersList } from '@/components/writer/WriterOrdersList';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

const WriterOrders = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Current Orders</h1>
            <p className="text-muted-foreground">
              Manage your assigned writing tasks
            </p>
          </div>
        </div>

        <WriterOrdersList />
      </div>
    </DashboardLayout>
  );
};

export default WriterOrders;
