
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { Json } from '@/types/supabase';

export interface PlatformSetting {
  key: string;
  value: any;
}

export interface PlatformSettings {
  platformName: string;
  defaultLanguage: string;
  timezone: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaDescription: string;
  testModeEnabled?: boolean;
}

// Default settings
const defaultSettings: PlatformSettings = {
  platformName: "Essay Writing Service",
  defaultLanguage: "en",
  timezone: "UTC",
  logoUrl: null,
  faviconUrl: null,
  metaDescription: "Lovable Generated Project",
  testModeEnabled: true
};

export const usePlatformSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch settings from Supabase
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
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
            const expectedType = typeof defaultSettings[key as keyof typeof defaultSettings];
            const value = setting.value as Json;
            
            if (value === null) {
              acc[key] = null as any;
            } else if (expectedType === 'string') {
              // For string properties, ensure we convert to string
              acc[key] = String(value) as any;
            } else {
              // For other types (like null values), use as is
              acc[key] = value as any;
            }
          }
          
          return acc;
        }, {});

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

  // Update a setting in Supabase
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: PlatformSetting) => {
      if (!isAdmin) {
        throw new Error('Only administrators can update platform settings');
      }

      // Important: Make sure the value is never null or undefined
      // If it is, replace with an empty string or appropriate default
      const safeValue = value === null || value === undefined ? 
        (typeof value === 'string' ? "" : {}) : value;

      // Check if setting exists
      const { data: existingData } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existingData) {
        // Update existing setting
        const { error } = await supabase
          .from('platform_settings')
          .update({ 
            value: safeValue, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key, value: safeValue });

        if (error) throw error;
      }

      return { key, value: safeValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: "Setting updated",
        description: `${data.key} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update setting",
        description: error.message || "There was an error updating the setting.",
        variant: "destructive",
      });
    }
  });

  // Update multiple settings at once
  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only administrators can update platform settings.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Sanitize the settings object to ensure no null values
      const sanitizedSettings = Object.entries(newSettings).reduce((acc, [key, value]) => {
        // If the value is null or undefined, don't include it in the update
        // This prevents null value constraint violations
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Only proceed if there are settings to update
      if (Object.keys(sanitizedSettings).length === 0) {
        toast({
          title: "No changes to update",
          description: "No valid settings to update were provided.",
        });
        return true; // Return true as there was no error
      }

      // Update each setting in sequence
      for (const [key, value] of Object.entries(sanitizedSettings)) {
        await updateSettingMutation.mutateAsync({ key, value });
      }
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      return false;
    }
  };

  // Upload a file to Supabase storage
  const uploadFile = async (file: File, type: 'logo' | 'favicon'): Promise<string | null> => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only administrators can update platform assets.",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (!file) return null;

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('platform-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(filePath);

      // Update the setting in the database
      const settingKey = type === 'logo' ? 'logoUrl' : 'faviconUrl';
      await updateSettingMutation.mutateAsync({ 
        key: settingKey, 
        value: publicUrlData.publicUrl 
      });

      return publicUrlData.publicUrl;
    } catch (error: any) {
      toast({
        title: `Error uploading ${type}`,
        description: error.message || `An error occurred while uploading the ${type}`,
        variant: "destructive",
      });
      return null;
    }
  };

  // Once settings are loaded, set initialLoad to false and update document
  useEffect(() => {
    if (!isLoadingSettings && settings) {
      setInitialLoad(false);
      
      // Update document title and meta tags
      document.title = settings.platformName;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.metaDescription);
      }
    }
  }, [isLoadingSettings, settings]);

  return {
    settings: settings || defaultSettings,
    isLoadingSettings,
    settingsError,
    updateSettings,
    uploadFile,
    isAdmin,
    initialLoad,
    updateSettingMutation
  };
};
