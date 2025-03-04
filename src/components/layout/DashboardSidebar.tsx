
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarLogout } from './SidebarLogout';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  userRole: UserRole;
  onSignOut: () => void;
}

export const DashboardSidebar = ({ 
  collapsed, 
  toggleSidebar, 
  userRole, 
  onSignOut 
}: SidebarProps) => {
  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[260px]",
        "bg-gradient-to-b from-sidebar/95 to-sidebar/98 backdrop-blur-xl",
        "border-sidebar-border/40 shadow-sm"
      )}
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Sidebar header with logo */}
      <SidebarHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />

      {/* Menu items */}
      <SidebarNavigation userRole={userRole} collapsed={collapsed} />

      {/* Logout button */}
      <SidebarLogout onSignOut={onSignOut} collapsed={collapsed} />
    </motion.aside>
  );
};
