
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvailableOrdersList } from '@/components/writer/AvailableOrdersList';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

const WriterAvailableOrders = () => {
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
            <h1 className="text-3xl font-bold tracking-tight">Available Orders</h1>
            <p className="text-muted-foreground">
              Browse available assignments and select ones you'd like to work on.
            </p>
          </div>
        </div>
        
        <AvailableOrdersList />
      </div>
    </DashboardLayout>
  );
};

export default WriterAvailableOrders;
