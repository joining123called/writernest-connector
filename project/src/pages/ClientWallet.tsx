
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DollarSign } from 'lucide-react';

const ClientWallet = () => {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Finance
          </h1>
          <p className="text-muted-foreground">
            Manage your wallet, payments, and view transaction history.
          </p>
        </div>
        
        <WalletDashboard />
      </div>
    </DashboardLayout>
  );
};

export default ClientWallet;
