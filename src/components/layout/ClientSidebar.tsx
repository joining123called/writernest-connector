
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  MessageSquare,
  User,
  Settings,
  LogOut,
  BookOpen,
  FilePlus,
  History,
  Wallet
} from 'lucide-react';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ClientSidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/client',
      active: pathname === '/client',
    },
    {
      label: 'My Assignments',
      icon: FileText,
      href: '/client/assignments',
      active: pathname === '/client/assignments' || pathname.startsWith('/client/assignments/'),
    },
    {
      label: 'New Assignment',
      icon: FilePlus,
      href: '/client/new-assignment',
      active: pathname === '/client/new-assignment',
    },
    {
      label: 'Order History',
      icon: History,
      href: '/client/order-history',
      active: pathname === '/client/order-history',
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      href: '/client/messages',
      active: pathname === '/client/messages',
    },
    {
      label: 'Resources',
      icon: BookOpen,
      href: '/client/resources',
      active: pathname === '/client/resources',
    },
    {
      label: 'Wallet',
      icon: Wallet,
      href: '/client/wallet',
      active: pathname === '/client/wallet',
    },
    {
      label: 'Account',
      icon: User,
      href: '/client/account',
      active: pathname === '/client/account',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/client/settings',
      active: pathname === '/client/settings',
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Client Portal
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  route.active ? "bg-primary/10" : ""
                )}
                asChild
              >
                <Link to={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
