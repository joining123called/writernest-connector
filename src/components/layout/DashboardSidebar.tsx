
import React from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
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
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
    >
      {/* Sidebar header with logo */}
      <div className="flex h-16 items-center border-b border-border/40 px-4">
        <div className="flex items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-md">
            <FileText className="h-5 w-5" />
          </span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3 font-semibold text-lg tracking-tight"
            >
              AcademicOrder
            </motion.span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group relative",
                    isActive 
                      ? "bg-accent text-accent-foreground font-medium" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-item"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    <item.icon 
                      className={cn(
                        "h-5 w-5 transition-colors", 
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                      )} 
                    />
                  </span>
                  {!collapsed && <span className="relative z-10">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="mt-auto border-t border-border/40 p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
