
import React from 'react';
import { UserRole } from '@/types';
import { 
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
  Gavel, 
  ShoppingBag,
  UserCircle,
  ClipboardList,
  BookOpen
} from 'lucide-react';
import { SidebarMenuItem } from './SidebarMenuItem';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarNavigationProps {
  userRole: UserRole;
  collapsed: boolean;
}

export const SidebarNavigation = ({ userRole, collapsed }: SidebarNavigationProps) => {
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
    { label: 'Available Orders', path: '/writer-dashboard/available-orders', icon: ClipboardList },
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
    { label: 'Order Management', path: '/admin-dashboard/orders', icon: ClipboardList },
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

  return (
    <nav className="flex-1 overflow-auto py-3 scrollbar-none">
      <ul className="space-y-0.5 px-2">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </ul>
    </nav>
  );
};
