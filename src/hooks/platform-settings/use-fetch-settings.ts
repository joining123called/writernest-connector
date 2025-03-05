
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
          // Convert JSON value to the appropriate type based on the expected property type
          const key = setting.key as keyof PlatformSettings;
          
          if (key in defaultSettings) {
            const settingValue = setting.value as Json;
            const typedKey = key as keyof typeof defaultSettings;
            
            if (settingValue === null) {
              acc[typedKey] = null as any;
            } else if (typeof defaultSettings[typedKey] === 'string') {
              // For string properties, ensure we convert to string
              acc[typedKey] = String(settingValue) as any;
            } else {
              // For other types (like boolean values), use as is
              acc[typedKey] = settingValue as any;
            }
          }
          
          return acc;
        }, {} as Partial<PlatformSettings>);

        // Merge with default settings
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
