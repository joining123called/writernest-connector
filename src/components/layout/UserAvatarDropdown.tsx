
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@/types';
import { User, Settings, LogOut, UserCog, Hash } from 'lucide-react';

interface UserAvatarDropdownProps {
  className?: string;
}

export const UserAvatarDropdown = ({ className }: UserAvatarDropdownProps) => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.WRITER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.CLIENT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative flex items-center focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-9 w-9 border border-border/40 bg-background/50">
          {user.avatarUrl ? (
            <AvatarImage 
              src={user.avatarUrl} 
              alt={user.fullName} 
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500">
          <span className="sr-only">Online</span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-card shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden"
          >
            {/* Header with user info */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border/30">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{user.fullName}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role as UserRole)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Reference Number */}
              {user.referenceNumber && (
                <div className="mt-3 flex items-center px-1 py-1.5 bg-muted/50 rounded text-xs text-muted-foreground">
                  <Hash className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
                  <span className="font-mono">{user.referenceNumber}</span>
                </div>
              )}
            </div>
            
            {/* Menu items */}
            <div className="p-1.5">
              <button
                onClick={() => navigateTo('/profile')}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 rounded-md transition-colors"
              >
                <UserCog className="mr-2.5 h-4 w-4 text-primary/70" />
                Profile Management
              </button>
              <button
                onClick={() => navigateTo(`/${user.role.toLowerCase()}-dashboard/settings`)}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 rounded-md transition-colors"
              >
                <Settings className="mr-2.5 h-4 w-4 text-primary/70" />
                Settings
              </button>
              <div className="h-px bg-border/50 my-1.5 mx-1"></div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="mr-2.5 h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
