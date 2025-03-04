
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';
import { Phone, Mail, CalendarClock, Hash } from 'lucide-react';
import { format } from 'date-fns';

export const ProfileInfo = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  // Use the userId from params, or if not provided, use the current user's ID
  const profileId = userId || currentUser?.id;
  
  const { data: profile, isLoading, error } = useQuery({
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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-xl bg-primary/10">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={getRoleBadgeColor(profile.role as UserRole)}
              >
                {profile.role?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Account Details</h3>
          
          <div className="flex items-center space-x-3">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <span>Joined on {format(new Date(profile.created_at), 'PPP')}</span>
          </div>
          
          {/* Display reference number with icon */}
          {profile.reference_number && (
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span>Reference: <span className="font-mono">{profile.reference_number}</span></span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileSkeleton = () => (
  <Card className="w-full max-w-3xl mx-auto">
    <CardHeader className="text-center">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-6 w-24 mx-auto mt-2" />
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-6">
      <Separator />
      
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardContent>
  </Card>
);
