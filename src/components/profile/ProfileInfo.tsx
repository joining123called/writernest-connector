
import React from 'react';
import { User, UserRole } from '@/types';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BadgeCheck,
  Calendar,
  Hash, 
  Mail, 
  Phone, 
  User as UserIcon,
  Shield
} from 'lucide-react';

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

  // Format date to be more human readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Define the role badge color and icon
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          icon: <Shield className="h-3.5 w-3.5" />,
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          label: 'Administrator'
        };
      case UserRole.WRITER:
        return {
          icon: <BadgeCheck className="h-3.5 w-3.5" />,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          label: 'Writer'
        };
      case UserRole.CLIENT:
        return {
          icon: <UserIcon className="h-3.5 w-3.5" />,
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          label: 'Client'
        };
      default:
        return {
          icon: <UserIcon className="h-3.5 w-3.5" />,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
          label: role
        };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
            <CardDescription>
              Basic information about your account
            </CardDescription>
          </div>
          <div className="hidden md:flex md:items-center md:justify-end">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
              {roleBadge.icon}
              <span className="ml-1.5">{roleBadge.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start gap-6 pt-4">
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:block">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="md:hidden mt-2 flex justify-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                  {roleBadge.icon}
                  <span className="ml-1.5">{roleBadge.label}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{user.fullName || "No name provided"}</h3>
              {user.referenceNumber && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Hash className="mr-2 h-4 w-4 text-primary/70" />
                  <span className="font-mono">{user.referenceNumber}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/40 rounded-xl p-4 flex items-start">
                <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Email</p>
                  <p className="font-medium">{user.email || "No email provided"}</p>
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-xl p-4 flex items-start">
                <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Phone</p>
                  <p className="font-medium">{user.phone || "No phone provided"}</p>
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-xl p-4 flex items-start md:col-span-2">
                <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Account created</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
