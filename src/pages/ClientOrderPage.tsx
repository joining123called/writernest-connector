
import React from 'react';
import { OrderForm } from '@/components/order/OrderForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';

const ClientOrderPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a client
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Place Your Order</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit your writing request.
          </p>
        </div>
        
        <OrderForm 
          onOrderSubmit={(data) => {
            console.log("Order submitted:", data);
            // Here you'd typically handle the order submission
            // For now, we'll just log it
          }}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default ClientOrderPage;
