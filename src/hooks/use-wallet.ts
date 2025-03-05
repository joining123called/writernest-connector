
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { WalletSettings } from '@/hooks/platform-settings/types';

export const useWallet = () => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeWalletSettings = async (): Promise<boolean> => {
    setIsInitializing(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to initialize wallet settings',
          variant: 'destructive'
        });
        return false;
      }
      
      const response = await fetch(`${window.location.origin}/.netlify/functions/init-wallet-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize wallet settings');
      }
      
      toast({
        title: 'Settings initialized',
        description: 'Wallet settings have been initialized successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing wallet settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize wallet settings. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  const getWalletSettings = async (): Promise<WalletSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'wallet_settings')
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && data.value) {
        return data.value as WalletSettings;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching wallet settings:', error);
      return null;
    }
  };

  return {
    initializeWalletSettings,
    getWalletSettings,
    isInitializing
  };
};
