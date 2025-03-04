
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { DashboardSidebar } from './DashboardSidebar';
import { cn } from '@/lib/utils';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-background/95">
      <DashboardSidebar 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
        userRole={user.role as UserRole}
        onSignOut={signOut}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        collapsed ? "ml-[80px]" : "ml-[260px]"
      )}>
        {/* Top navigation bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <div className="hidden md:flex md:flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[300px]"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.fullName}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full border">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <div className="flex-1 space-y-4 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
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
