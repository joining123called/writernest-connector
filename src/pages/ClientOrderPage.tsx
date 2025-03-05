
import React, { useState } from 'react';
import { OrderForm } from '@/components/order/OrderForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods } from '@/hooks/use-payment-methods';

const ClientOrderPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  const { hasEnabledPaymentMethods } = usePaymentMethods();
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Redirect if not a client
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
    
    // Log uploaded files if any
    if (data.files && data.files.length > 0) {
      console.log(`${data.files.length} files uploaded:`, 
        data.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      );
    }
    
    // Process payment if enabled, otherwise just confirm order
    if (hasEnabledPaymentMethods && data.paymentData) {
      setPaymentProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setPaymentProcessing(false);
        toast({
          title: "Payment Successful",
          description: `Your payment was processed and your order has been submitted.`,
        });
      }, 1500);
      
      console.log("Payment data:", data.paymentData);
    } else {
      toast({
        title: "Order Submitted",
        description: `Your order has been successfully submitted with ${data.files?.length || 0} attached files.`,
      });
    }
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
          isProcessingPayment={paymentProcessing}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default ClientOrderPage;
