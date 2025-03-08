
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PasswordChange } from '@/components/profile/PasswordChange';
import { Card } from '@/components/ui/card';
import { Loader2, UserCircle2, Settings, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto py-6 px-4 sm:px-6"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information and account settings
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="grid grid-cols-1 gap-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="bg-muted/30 backdrop-blur-sm p-1 rounded-xl border border-border/40 w-fit mx-auto md:mx-0">
                <TabsList className="grid md:w-[400px] grid-cols-3 bg-transparent">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-md flex gap-2 transition-all"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
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
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="space-y-6 mt-8">
                <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <ProfileInfo user={user} />
                </Card>
              </TabsContent>
              
              <TabsContent value="edit" className="space-y-6 mt-8">
                <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <ProfileEdit 
                    user={user} 
                    onSuccess={() => setActiveTab('overview')} 
                  />
                </Card>
                
                <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <AvatarUpload user={user} />
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6 mt-8">
                <Card className="shadow-md border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <PasswordChange />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-muted/30 p-6 mb-4">
              <UserCircle2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              Please sign in to view your profile.
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
