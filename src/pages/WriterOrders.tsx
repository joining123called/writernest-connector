
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

const WriterOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <p>Please login to view your orders.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your current writing assignments
            </p>
          </div>
          <Button
            onClick={() => navigate('/writer-dashboard/available-orders')}
            className="mt-4 md:mt-0"
          >
            Browse Available Orders
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <p className="text-center text-muted-foreground py-8">
            You haven't taken any orders yet. Browse available orders to start earning.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default WriterOrders;
