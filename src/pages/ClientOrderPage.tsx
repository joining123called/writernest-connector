
import React from 'react';
import { OrderForm } from '@/components/order/OrderForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { FileText, CalendarClock } from 'lucide-react';

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
        className="pb-12"
      >
        <div className="mb-8 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Place Your Order</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Fill out the form below with your paper details. Our expert writers will deliver high-quality, 
            original content tailored to your requirements and deadline.
          </p>
          
          <div className="flex items-center mt-3 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 mr-1.5 text-primary" />
            <span>Fast turnaround times available - as quick as 6 hours for urgent papers!</span>
          </div>
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
