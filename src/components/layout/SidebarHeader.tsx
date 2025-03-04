
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/use-platform-settings';

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader = ({ collapsed, toggleSidebar }: SidebarHeaderProps) => {
  const { settings } = usePlatformSettings();
  const [platformName, setPlatformName] = useState('AcademicOrder');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.general.siteName);
      setLogoUrl(settings.general.logo);
    }
  }, [settings]);

  return (
    <div className="flex h-16 items-center justify-between border-b border-sidebar-border/30 px-4">
      <div className="flex items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-md overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 font-semibold text-lg tracking-tight text-sidebar-foreground"
          >
            {platformName}
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
  );
};
