
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminOrdersList } from '@/components/admin/AdminOrdersList';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

const AdminOrderManagement = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ADMIN)) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-2">
            View, assign and manage all orders in the system
          </p>
        </div>

        <AdminOrdersList />
      </div>
    </DashboardLayout>
  );
};

export default AdminOrderManagement;
