
import React from 'react';
import { OrderForm } from '@/components/order/OrderForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { useToast } from '@/hooks/use-toast';

const ClientOrderPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();

  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.CLIENT)) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleOrderSubmit = (data) => {
    console.log("Order submitted:", data);
    
    if (data.files && data.files.length > 0) {
      console.log(`${data.files.length} files uploaded:`, 
        data.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      );
    }
    
    toast({
      title: "Order Submitted",
      description: `Your order has been successfully submitted with ${data.files?.length || 0} attached files.`,
    });
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{settings.serviceName}</h1>
          <p className="text-muted-foreground">
            {settings.serviceDescription}
          </p>
        </div>
        
        <OrderForm 
          onOrderSubmit={handleOrderSubmit}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default ClientOrderPage;
