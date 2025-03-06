
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarMenuItemProps {
  label: string;
  path: string;
  icon: React.ElementType;
  collapsed: boolean;
}

export const SidebarMenuItem = ({ 
  label, 
  path, 
  icon: Icon, 
  collapsed 
}: SidebarMenuItemProps) => {
  const location = useLocation();
  
  // Check if the path is active or partially active (for nested routes)
  const isActive = location.pathname === path || 
                  (path !== location.pathname.split('/').slice(0, 3).join('/') && 
                   location.pathname.startsWith(path));

  return (
    <li>
      <Link
        to={path}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all relative overflow-hidden group",
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
            "relative z-10 flex h-8 w-8 items-center justify-center rounded-md transition-all duration-300 ease-out",
            isActive 
              ? "bg-primary/10 text-primary" 
              : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground group-hover:bg-sidebar-accent/20"
          )}
        >
          <Icon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110")} />
        </div>

        {/* Label */}
        {!collapsed && (
          <span className="relative z-10 font-medium transition-colors">{label}</span>
        )}
      </Link>
    </li>
  );
};
