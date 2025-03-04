
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Palette, 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  CreditCard,
  FileText,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isImplemented?: boolean;
}

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SettingsSidebar = ({ activeTab, setActiveTab }: SettingsSidebarProps) => {
  const navItems: SettingsNavItem[] = [
    { id: 'general', label: 'General', icon: Settings, isImplemented: true },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  ];

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-card border rounded-lg shadow-sm p-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal",
                activeTab === item.id 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "hover:bg-accent/50",
                !item.isImplemented && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => item.isImplemented && setActiveTab(item.id)}
              disabled={!item.isImplemented}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {!item.isImplemented && (
                <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};
