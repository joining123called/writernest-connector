
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { DashboardSidebar } from './DashboardSidebar';
import { cn } from '@/lib/utils';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Get initials from user's full name
  const initials = user.fullName
    ?.split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-background/95">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Sidebar - desktop: visible, mobile: hidden + overlay */}
      <div className={cn(
        "md:block",
        mobileOpen ? "block" : "hidden"
      )}>
        <DashboardSidebar 
          collapsed={collapsed} 
          toggleSidebar={toggleSidebar} 
          userRole={user.role as UserRole}
          onSignOut={signOut}
        />
      </div>
      
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        collapsed ? "md:ml-[80px]" : "md:ml-[260px]"
      )}>
        {/* Top navigation bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-4">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSidebar}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
            
            <div className="flex flex-1 items-center">
              <div className="relative w-full md:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-full bg-background/50 border-border/30 focus-visible:bg-background/80"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.fullName}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
              <div className="relative">
                <Avatar className="h-9 w-9 border border-border/40 bg-background/50">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName || ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500">
                  <span className="sr-only">Online</span>
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="flex-1 space-y-4 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
