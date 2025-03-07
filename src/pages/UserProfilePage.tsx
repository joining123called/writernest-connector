
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      if (userId === user?.id) {
        setProfileUser(user);
        setIsLoading(false);
        return;
      }
      
      if (!isAdmin) {
        // Redirect non-admins trying to view other profiles
        navigate(`/${user?.role.toLowerCase()}-dashboard`);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const profileData: User = {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            phone: data.phone,
            role: data.role as UserRole,
            createdAt: data.created_at,
            referenceNumber: data.reference_number,
            avatarUrl: data.avatar_url
          };
          
          setProfileUser(profileData);
        } else {
          toast({
            title: "User not found",
            description: "The requested user profile could not be found.",
            variant: "destructive"
          });
          navigate(`/${user?.role.toLowerCase()}-dashboard`);
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: error.message || "An error occurred while fetching the user profile.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, user, isAdmin, navigate, toast]);

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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          profileUser && <ProfileInfo user={profileUser} />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
