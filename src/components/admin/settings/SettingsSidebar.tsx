
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Globe, 
  FileText, 
  Image, 
  Clock, 
  CreditCard, 
  Mail, 
  Shield, 
  Users, 
  BellRing 
} from 'lucide-react';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

type SettingsSection = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
};

export const SettingsSidebar = ({ 
  activeSection, 
  onSectionChange 
}: SettingsSidebarProps) => {
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      name: 'General Settings',
      icon: Settings,
      description: 'Platform name, logo, language, timezone'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Image,
      description: 'Theme, colors, and visual preferences'
    },
    {
      id: 'localization',
      name: 'Localization',
      icon: Globe,
      description: 'Language and regional settings'
    },
    {
      id: 'email',
      name: 'Email Templates',
      icon: Mail,
      description: 'Customize email notifications'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security settings and policies'
    },
    {
      id: 'payments',
      name: 'Payment Settings',
      icon: CreditCard,
      description: 'Payment gateways and options'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'User roles and permissions'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellRing,
      description: 'System notification settings'
    }
  ];

  return (
    <nav className="space-y-1">
      <div className="mb-4">
        <h3 className="px-2 font-semibold text-md">Settings</h3>
      </div>
      {settingsSections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-200",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => onSectionChange(section.id)}
          >
            <section.icon className={cn(
              "h-4 w-4",
              isActive ? "text-primary" : "text-foreground/70"
            )} />
            <span>{section.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
