
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';
import { Phone, Mail, CalendarClock, Hash, ChevronDown, Edit, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileEdit } from './ProfileEdit';
import { PasswordChange } from './PasswordChange';
import { AvatarUpload } from './AvatarUpload';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ProfileInfo = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use the userId from params, or if not provided, use the current user's ID
  const profileId = userId || currentUser?.id;
  
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('No profile ID provided');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  // Check if the profile being viewed is the current user's profile
  const isOwnProfile = currentUser?.id === profileId;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-red-500">Error Loading Profile</CardTitle>
          <CardDescription>
            {error?.message || 'Profile not found'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case UserRole.WRITER:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case UserRole.CLIENT:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // If editing, show the edit form
  if (isEditing) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEdit 
            profile={profile} 
            onSuccess={() => {
              setIsEditing(false);
              refetch();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="px-6 pt-6 pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}'s Profile</h1>
                <p className="text-muted-foreground">
                  {isOwnProfile ? 'Manage your account settings and preferences' : 'View user profile information'}
                </p>
              </div>
            </div>
            {isOwnProfile && (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {isOwnProfile ? (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left column - Avatar */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
                    <AvatarUpload 
                      avatarUrl={profile.avatar_url} 
                      fullName={profile.full_name}
                    />
                  </div>
                  
                  {/* Right column - Profile information */}
                  <div className="flex-grow space-y-6 w-full md:w-2/3">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p className="font-medium">{profile.full_name}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <p>{profile.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <p>{profile.phone}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Role</p>
                          <Badge 
                            variant="outline" 
                            className={getRoleBadgeColor(profile.role as UserRole)}
                          >
                            {profile.role?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                          <div className="flex items-center">
                            <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <p>{format(new Date(profile.created_at), 'PPP')}</p>
                          </div>
                        </div>
                        
                        {profile.reference_number && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                              <p className="font-mono">{profile.reference_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="animate-fade-in">
                <PasswordChange />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column - Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="mt-4 text-center">
                  <p className="text-xl font-semibold">{profile.full_name}</p>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${getRoleBadgeColor(profile.role as UserRole)}`}
                  >
                    {profile.role?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {/* Right column - Profile information */}
              <div className="flex-grow space-y-6 w-full md:w-2/3">
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span>{profile.phone}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <h3 className="text-lg font-medium">Account Details</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                        <div className="flex items-center space-x-3">
                          <CalendarClock className="h-5 w-5 text-muted-foreground" />
                          <span>Joined on {format(new Date(profile.created_at), 'PPP')}</span>
                        </div>
                        
                        {profile.reference_number && (
                          <div className="flex items-center space-x-3">
                            <Hash className="h-5 w-5 text-muted-foreground" />
                            <span>Reference: <span className="font-mono">{profile.reference_number}</span></span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileSkeleton = () => (
  <Card className="w-full max-w-4xl mx-auto">
    <CardHeader className="px-6 pt-6 pb-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </CardHeader>
    
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Avatar skeleton */}
        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        
        {/* Right column - Profile information skeleton */}
        <div className="flex-grow space-y-6 w-full md:w-2/3">
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
          
          <Skeleton className="h-px w-full" />
          
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
