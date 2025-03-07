
import React from 'react';
import { User, UserRole } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Hash, Mail, Phone, User as UserIcon } from 'lucide-react';

interface ProfileInfoProps {
  user: User;
}

export const ProfileInfo = ({ user }: ProfileInfoProps) => {
  // Get the initials from the full name
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Define the role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case UserRole.WRITER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case UserRole.CLIENT:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  return (
    <Card className="shadow-md border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
        <CardDescription>
          Basic information about your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-2 border-background shadow-md">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{user.fullName}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              
              {user.referenceNumber && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Hash className="mr-2 h-4 w-4" />
                  <span className="font-mono">{user.referenceNumber}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 pt-1">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary/70" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary/70" />
                <span>{user.phone}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <UserIcon className="mr-2 h-4 w-4 text-primary/70" />
                <span>Account created on {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
