
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { OrderFormSettings } from '@/components/settings/OrderFormSettings';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSettings = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/admin-login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated but not an admin
  if (user && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin settings area. 
              This section is restricted to administrators only.
            </AlertDescription>
          </Alert>
          
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Administrator Access Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            The platform settings can only be viewed and modified by users with administrator privileges.
          </p>
          
          <div className="flex gap-4">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign in as Admin
            </Button>
          </div>
        </div>
      </DashboardLayout>
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
