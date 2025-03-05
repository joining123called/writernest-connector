
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
  [key: string]: string | boolean | null | undefined;
}

const defaultSettings: PlatformSettings = {
  platformName: "Essay Writing Service",
  defaultLanguage: "en",
  timezone: "UTC",
  logoUrl: null,
  faviconUrl: null,
  metaDescription: "Lovable Generated Project"
};

export const usePlatformSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async (): Promise<PlatformSettings> => {
      if (!user) {
        return defaultSettings;
      }

      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*');

        if (error) {
          console.error('Error fetching platform settings:', error.message);
          throw error;
        }

        const settingsObject = data.reduce((acc: Partial<PlatformSettings>, setting) => {
          const key = setting.key as keyof PlatformSettings;
          
          if (key in defaultSettings || typeof key === 'string') {
            const expectedType = typeof defaultSettings[key as keyof typeof defaultSettings];
            const value = setting.value;
            
            if (value === null) {
              acc[key] = null;
            } else if (expectedType === 'string') {
              // Convert to string regardless of the source type
              acc[key] = String(value);
            } else if (expectedType === 'boolean') {
              // Convert to boolean regardless of the source type
              acc[key] = Boolean(value);
            } else {
              // For any other type, attempt sensible conversion based on source type
              if (typeof value === 'number') {
                acc[key] = String(value);
              } else if (Array.isArray(value)) {
                // Since our index signature only accepts string | boolean | null | undefined,
                // we need to convert arrays to strings
                acc[key] = JSON.stringify(value);
              } else if (typeof value === 'object' && value !== null) {
                // Convert objects to strings as well
                acc[key] = JSON.stringify(value);
              } else {
                acc[key] = String(value);
              }
            }
          }
          
          return acc;
        }, {});

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
    enabled: !!user
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: PlatformSetting) => {
      if (!isAdmin) {
        throw new Error('Only administrators can update platform settings');
      }

      const safeValue = value === null || value === undefined ? 
        (typeof value === 'string' ? "" : (typeof value === 'boolean' ? false : {})) : value;

      console.log(`Updating setting: ${key} with value:`, safeValue);

      const { data: existingData } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ 
            value: safeValue, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', key);

        if (error) throw error;
      } else {
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
      console.error("Update setting error:", error);
      toast({
        title: "Failed to update setting",
        description: error.message || "There was an error updating the setting.",
        variant: "destructive",
      });
    }
  });

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
      console.log("Updating settings:", newSettings);
      
      const sanitizedSettings = Object.entries(newSettings).reduce((acc, [key, value]) => {
        const fieldKey = key as keyof PlatformSettings;
        
        if (typeof value === 'boolean') {
          acc[fieldKey] = value;
        } else if (value === null || value === undefined) {
          if (fieldKey in defaultSettings) {
            acc[fieldKey] = defaultSettings[fieldKey];
          }
        } else {
          acc[fieldKey] = value;
        }
        
        return acc;
      }, {} as Record<keyof PlatformSettings, any>);
      
      if (Object.keys(sanitizedSettings).length === 0) {
        toast({
          title: "No changes to update",
          description: "No valid settings to update were provided.",
        });
        return true;
      }

      console.log("Sanitized settings for update:", sanitizedSettings);
      
      for (const [key, value] of Object.entries(sanitizedSettings)) {
        await updateSettingMutation.mutateAsync({ key, value });
      }
      
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your settings.",
        variant: "destructive",
      });
      return false;
    }
  };

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('platform-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(filePath);

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

  useEffect(() => {
    if (!isLoadingSettings && settings) {
      setInitialLoad(false);
      
      document.title = settings.platformName;
      
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
