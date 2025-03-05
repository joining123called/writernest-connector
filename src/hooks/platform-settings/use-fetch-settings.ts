
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PlatformSettings, defaultSettings } from './types';
import { Json } from '@/types/supabase';

export const useFetchSettings = (user: any | null) => {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async (): Promise<PlatformSettings> => {
      if (!user) {
        // If not authenticated, return default settings
        return defaultSettings;
      }

      try {
        // Get all settings from the platform_settings table
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*');

        if (error) {
          console.error('Error fetching platform settings:', error.message);
          throw error;
        }

        // Convert the array of settings to an object
        const settingsObject = data.reduce((acc: Partial<PlatformSettings>, setting) => {
          // Get the key from the setting
          const key = setting.key as keyof PlatformSettings;
          
          // Only process keys that exist in defaultSettings
          if (key in defaultSettings) {
            const settingValue = setting.value as Json;
            const typedKey = key as keyof typeof defaultSettings;
            
            if (settingValue === null) {
              // Handle null values explicitly
              acc[typedKey] = null as any;
            } else if (typeof defaultSettings[typedKey] === 'string') {
              // For string properties, ensure we convert to string
              acc[typedKey] = String(settingValue) as any;
            } else if (typeof defaultSettings[typedKey] === 'boolean') {
              // For boolean properties, ensure we convert to boolean
              acc[typedKey] = Boolean(settingValue) as any;
            } else {
              // For other types, use as is with proper typing
              acc[typedKey] = settingValue as any;
            }
          }
          
          return acc;
        }, {} as Partial<PlatformSettings>);

        // Merge with default settings and return
        return {
          ...defaultSettings,
          ...settingsObject
        };
      } catch (error) {
        console.error('Error processing settings:', error);
        return defaultSettings;
      }
    },
    retry: 1,
    enabled: !!user, // Only run query when user is authenticated
  });
};
