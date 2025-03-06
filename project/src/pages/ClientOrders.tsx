
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientOrdersList } from '@/components/client/ClientOrdersList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

const ClientOrders = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground">
              View and manage your academic orders
            </p>
          </div>
          <Button 
            onClick={() => navigate('/client-dashboard/order')}
            className="shrink-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <ClientOrdersList />
      </div>
    </DashboardLayout>
  );
};

export default ClientOrders;
