
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, UserCircle2, Settings, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PasswordChange } from '@/components/profile/PasswordChange';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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

  const isOwnProfile = userId === user?.id;

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
            className="mb-4 hover:bg-background/80 group"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {isAdmin && userId && userId !== user?.id 
              ? "User Profile"
              : "Your Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin && userId && userId !== user?.id 
              ? "View user profile information"
              : "Your profile information"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          profileUser && (
            <div className="grid grid-cols-1 gap-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-muted/30 backdrop-blur-sm p-1 rounded-xl border border-border/40 w-fit mx-auto md:mx-0">
                  <TabsList className={`grid ${isOwnProfile ? 'md:w-[400px] grid-cols-3' : 'w-[150px] grid-cols-1'} bg-transparent`}>
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-background data-[state=active]:shadow-md flex gap-2 transition-all"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    {isOwnProfile && (
                      <>
                        <TabsTrigger 
                          value="edit" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-md flex gap-2 transition-all"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit Profile</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="security" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-md flex gap-2 transition-all"
                        >
                          <Shield className="h-4 w-4" />
                          <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <ProfileInfo user={profileUser} />
                  </Card>
                </TabsContent>
                
                {isOwnProfile && (
                  <>
                    <TabsContent value="edit" className="space-y-6 mt-6">
                      <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <ProfileEdit 
                          user={profileUser} 
                          onSuccess={() => setActiveTab('overview')} 
                        />
                      </Card>
                      
                      <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <AvatarUpload user={profileUser} />
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="security" className="space-y-6 mt-6">
                      <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <PasswordChange />
                      </Card>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
          )
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
