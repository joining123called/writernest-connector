
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
  ShoppingBag
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
  
  // Define menu items for each role
  const clientMenuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/client-dashboard', icon: LayoutDashboard },
    { label: 'Order Now', path: '/client-dashboard/order', icon: ShoppingBag },
    { label: 'My Orders', path: '/client-dashboard/orders', icon: FileText },
    { label: 'Revisions', path: '/client-dashboard/revisions', icon: RefreshCw },
    { label: 'Disputes', path: '/client-dashboard/disputes', icon: AlertTriangle },
    { label: 'Messages', path: '/client-dashboard/messages', icon: MessageSquare },
    { label: 'Finance', path: '/client-dashboard/finance', icon: DollarSign },
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

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-card/50 backdrop-blur-lg transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
    >
      {/* Sidebar header with logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <FileText className="h-5 w-5" />
          </span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3 font-semibold text-lg"
            >
              AcademicOrder
            </motion.span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive 
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="mt-auto border-t p-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
