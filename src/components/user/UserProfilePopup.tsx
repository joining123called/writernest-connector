
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User as UserType, UserRole } from '@/types';

interface UserProfilePopupProps {
  user: UserType;
  onSignOut: () => Promise<void>;
}

export const UserProfilePopup = ({ user, onSignOut }: UserProfilePopupProps) => {
  // Get initials from user's full name
  const initials = user.fullName
    ?.split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const isAdmin = user.role === UserRole.ADMIN;
  const profilePath = isAdmin 
    ? '/admin-dashboard/profile' 
    : user.role === UserRole.WRITER
      ? '/writer-dashboard/settings'
      : '/client-dashboard/settings';

  const settingsPath = isAdmin 
    ? '/admin-dashboard/settings' 
    : user.role === UserRole.WRITER
      ? '/writer-dashboard/settings'
      : '/client-dashboard/settings';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 p-0">
          <Avatar className="h-9 w-9 border border-border/40 bg-background/50">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName || ''} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500">
            <span className="sr-only">Online</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 mr-4" 
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-2 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-border/40">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName || ''} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-base font-semibold leading-none">{user.fullName}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize mt-1">
                {user.role}
              </div>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
          )}
        </div>
        <Separator />
        <div className="p-2">
          <Link to={profilePath}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Button>
          </Link>
          <Link to={settingsPath}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
