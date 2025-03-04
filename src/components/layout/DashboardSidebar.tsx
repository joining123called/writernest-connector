
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  List, 
  RefreshCw, 
  AlertTriangle, 
  MessageSquare, 
  BarChart3, 
  DollarSign, 
  Users, 
  Settings, 
  LogOut, 
  Gavel, 
  ShoppingBag,
  UserCircle
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  userRole: UserRole;
  onSignOut: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const DashboardSidebar = ({ 
  collapsed, 
  toggleSidebar, 
  userRole, 
  onSignOut 
}: SidebarProps) => {
  const location = useLocation();
  
  // Define common menu items for all roles
  const commonMenuItems: MenuItem[] = [
    { label: 'Profile', path: '/profile', icon: UserCircle },
  ];
  
  // Define menu items for each role
  const clientMenuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/client-dashboard', icon: LayoutDashboard },
    { label: 'Order Now', path: '/client-dashboard/order', icon: ShoppingBag },
    { label: 'My Orders', path: '/client-dashboard/orders', icon: FileText },
    { label: 'Revisions', path: '/client-dashboard/revisions', icon: RefreshCw },
    { label: 'Disputes', path: '/client-dashboard/disputes', icon: AlertTriangle },
    { label: 'Messages', path: '/client-dashboard/messages', icon: MessageSquare },
    { label: 'Finance', path: '/client-dashboard/finance', icon: DollarSign },
    ...commonMenuItems,
  ];

  const writerMenuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/writer-dashboard', icon: LayoutDashboard },
    { label: 'Current Orders', path: '/writer-dashboard/orders', icon: FileText },
    { label: 'Bids', path: '/writer-dashboard/bids', icon: Gavel },
    { label: 'Revisions', path: '/writer-dashboard/revisions', icon: RefreshCw },
    { label: 'Disputes', path: '/writer-dashboard/disputes', icon: AlertTriangle },
    { label: 'Messages', path: '/writer-dashboard/messages', icon: MessageSquare },
    { label: 'Statistics', path: '/writer-dashboard/statistics', icon: BarChart3 },
    { label: 'Finance', path: '/writer-dashboard/finance', icon: DollarSign },
    ...commonMenuItems,
  ];

  const adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin-dashboard/users', icon: Users },
    { label: 'Order Management', path: '/admin-dashboard/orders', icon: FileText },
    { label: 'Bid Management', path: '/admin-dashboard/bids', icon: Gavel },
    { label: 'Dispute Resolution', path: '/admin-dashboard/disputes', icon: AlertTriangle },
    { label: 'Finance & Payments', path: '/admin-dashboard/finance', icon: DollarSign },
    { label: 'Messages', path: '/admin-dashboard/messages', icon: MessageSquare },
    { label: 'Statistics & Reports', path: '/admin-dashboard/statistics', icon: BarChart3 },
    { label: 'Settings', path: '/admin-dashboard/settings', icon: Settings },
    ...commonMenuItems,
  ];

  // Select menu items based on user role
  let menuItems: MenuItem[] = [];
  switch (userRole) {
    case UserRole.CLIENT:
      menuItems = clientMenuItems;
      break;
    case UserRole.WRITER:
      menuItems = writerMenuItems;
      break;
    case UserRole.ADMIN:
      menuItems = adminMenuItems;
      break;
    default:
      menuItems = clientMenuItems;
  }

  // Check if the path is active or partially active (for nested routes)
  const isActivePath = (path: string) => {
    return location.pathname === path || 
           (path !== `/${userRole.toLowerCase()}-dashboard` && location.pathname.startsWith(path));
  };

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
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/30 px-4">
        <div className="flex items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-md">
            <FileText className="h-5 w-5" />
          </span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 font-semibold text-lg tracking-tight text-sidebar-foreground"
            >
              AcademicOrder
            </motion.span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="rounded-full p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-auto py-4 scrollbar-none">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all relative overflow-hidden group",
                    isActive 
                      ? "text-sidebar-primary font-medium" 
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Background with gradient hover effect */}
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-lg transition-opacity duration-300 opacity-0 bg-gradient-to-r from-sidebar-accent/50 to-sidebar-accent/30",
                      isActive ? "opacity-100" : "group-hover:opacity-50"
                    )}
                  />

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-item"
                      className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full"
                      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon container */}
                  <div 
                    className={cn(
                      "relative z-10 flex h-9 w-9 items-center justify-center rounded-md transition-all duration-300 ease-out",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground group-hover:bg-sidebar-accent/20"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110")} />
                  </div>

                  {/* Label */}
                  {!collapsed && (
                    <span className="relative z-10 font-medium transition-colors">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="mt-auto border-t border-sidebar-border/30 p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm group relative overflow-hidden"
          aria-label="Sign out"
        >
          {/* Hover background */}
          <div className="absolute inset-0 rounded-lg bg-red-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Icon container */}
          <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground/70 group-hover:text-red-500 transition-all duration-300">
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
          
          {/* Label */}
          {!collapsed && (
            <span className="relative z-10 group-hover:text-red-500 transition-colors duration-300">Logout</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
