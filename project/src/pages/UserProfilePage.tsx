
import React from 'react';
import { motion } from 'framer-motion';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, isAdmin } = useAuth();
  
  // If not admin and trying to view someone else's profile, redirect to dashboard
  React.useEffect(() => {
    if (userId && userId !== user?.id && !isAdmin) {
      navigate(`/${user?.role.toLowerCase()}-dashboard`);
    }
  }, [userId, user, isAdmin, navigate]);

  const goBack = () => {
    if (isAdmin) {
      navigate('/admin-dashboard/users');
    } else {
      navigate(`/${user?.role.toLowerCase()}-dashboard`);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-6"
      >
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">
            {isAdmin && userId && userId !== user?.id 
              ? "View user profile information"
              : "Your profile information"}
          </p>
        </div>

        <ProfileInfo />
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
