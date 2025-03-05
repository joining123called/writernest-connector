
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { PlatformSettings, defaultSettings } from './platform-settings/types';
import { useFetchSettings } from './platform-settings/use-fetch-settings';
import { useUpdateSettings } from './platform-settings/use-update-settings';
import { useFileUpload } from './platform-settings/use-file-upload';

export type { PlatformSettings, PlatformSetting } from './platform-settings/types';
export { defaultSettings } from './platform-settings/types';

export const usePlatformSettings = () => {
  const { isAdmin, user } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch settings from Supabase
  const { 
    data: settings, 
    isLoading: isLoadingSettings, 
    error: settingsError 
  } = useFetchSettings(user);

  // Update settings mutation
  const { 
    updateSettingMutation, 
    updateSettings 
  } = useUpdateSettings(isAdmin);

  // File upload functionality
  const { uploadFile } = useFileUpload(isAdmin, updateSettingMutation);

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
