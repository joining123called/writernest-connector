
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
import { Loader2 } from 'lucide-react';

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
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information and account settings
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid md:w-[400px] grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <ProfileInfo user={user} />
              </Card>
            </TabsContent>
            
            <TabsContent value="edit" className="space-y-6">
              <Card className="p-6">
                <ProfileEdit 
                  user={user} 
                  onSuccess={() => setActiveTab('overview')} 
                />
              </Card>
              
              <Card className="p-6">
                <AvatarUpload user={user} />
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="p-6">
                <PasswordChange />
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
