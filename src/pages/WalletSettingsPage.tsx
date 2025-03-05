
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { WalletSettings } from '@/components/settings/WalletSettings';
import { SettingsLayout } from '@/components/layout/SettingsLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';

const WalletSettingsPage = () => {
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
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Wallet Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure wallet settings, payment gateways, and manage transactions
          </p>
        </div>
        <Separator />
        <WalletSettings />
      </div>
    </SettingsLayout>
  );
};

export default WalletSettingsPage;
