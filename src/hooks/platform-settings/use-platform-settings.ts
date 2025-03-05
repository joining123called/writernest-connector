
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { PlatformSettings, defaultSettings, PlatformSetting } from './types';
import { fetchPlatformSettings, updatePlatformSetting, uploadPlatformFile } from './platform-settings-api';

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
        return await fetchPlatformSettings();
      } catch (error) {
        console.error('Error processing settings:', error);
        return defaultSettings;
      }
    },
    retry: 1,
    enabled: !!user
  });

  const updateSettingMutation = useMutation({
    mutationFn: updatePlatformSetting,
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
      const publicUrl = await uploadPlatformFile(file, type);
      
      if (publicUrl) {
        const settingKey = type === 'logo' ? 'logoUrl' : 'faviconUrl';
        await updateSettingMutation.mutateAsync({ 
          key: settingKey, 
          value: publicUrl 
        });
      }
      
      return publicUrl;
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
