
import React from 'react';
import { LogOut } from 'lucide-react';

interface SidebarLogoutProps {
  onSignOut: () => void;
  collapsed: boolean;
}

export const SidebarLogout = ({ onSignOut, collapsed }: SidebarLogoutProps) => {
  return (
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
  );
};
