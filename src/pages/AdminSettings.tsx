
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SettingsSidebar } from '@/components/admin/settings/SettingsSidebar';
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';
import { Card } from "@/components/ui/card";

const AdminSettings = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('general');

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure and manage system-wide settings
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 w-full">
            <Card className="p-4">
              <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </Card>
          </div>
          
          <div className="flex-1">
            <Card className="p-6">
              {renderActiveSection()}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
