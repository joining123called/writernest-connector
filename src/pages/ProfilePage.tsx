
import React from 'react';
import { motion } from 'framer-motion';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const ProfilePage = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-6"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">View and manage user profile information</p>
        </div>

        <ProfileInfo />
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
