
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { OrderFormSettings } from '@/components/settings/OrderFormSettings';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';

const AdminSettings = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  // Redirect if not admin
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ADMIN)) {
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

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'order-form':
        return <OrderFormSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
