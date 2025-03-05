
import React from 'react';
import { OrderForm } from '@/components/order/OrderForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 p-2.5 rounded-full">
              <PenLine className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Place Your Order</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Complete the form below to submit your writing request. Our experienced writers will start working on your paper as soon as the order is confirmed.
          </p>
        </motion.div>
        
        <OrderForm 
          onOrderSubmit={(data) => {
            console.log("Order submitted:", data);
            // Here you'd typically handle the order submission
            // For now, we'll just log it
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientOrderPage;
