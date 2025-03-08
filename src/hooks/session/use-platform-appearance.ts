
import { useCallback } from 'react';

export const usePlatformAppearance = () => {
  const applyStoredSettings = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem('platformSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        
        if (settings.platformName) {
          document.title = settings.platformName;
        }
        
        if (settings.faviconUrl) {
          const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (link) link.href = settings.faviconUrl;
        }
      }
    } catch (error) {
      console.error('Error applying stored settings:', error);
    }
  }, []);

  return { applyStoredSettings };
};
