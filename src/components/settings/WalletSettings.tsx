
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdminWalletTransactions } from './AdminWalletTransactions';
import { defaultWalletSettings, WalletSettings as WalletSettingsType } from '@/hooks/platform-settings/types';
import { Json } from '@/types/supabase';
import { PayPalGatewayConfig } from '@/types/paypal';
import { GeneralWalletSettings } from './wallet/GeneralWalletSettings';
import { PaymentMethodsTab } from './wallet/PaymentMethodsTab';
import { LoadingState } from './wallet/LoadingState';
import { ErrorState } from './wallet/ErrorState';

export const WalletSettings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WalletSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);

  useEffect(() => {
    const fetchWalletSettings = async () => {
      setIsLoading(true);
      
      try {
        // Check if wallet settings exist
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('key', 'wallet_settings')
          .maybeSingle();

        if (error) throw error;

        if (data && data.value) {
          console.log('Loaded wallet settings:', data.value);
          
          // Ensure the settings object has the expected structure
          const loadedSettings = data.value as WalletSettingsType;
          
          // Make sure payment_methods structure exists
          if (!loadedSettings.payment_methods) {
            loadedSettings.payment_methods = {
              paypal: {
                enabled: false
              }
            };
          } else if (!loadedSettings.payment_methods.paypal) {
            loadedSettings.payment_methods.paypal = {
              enabled: false
            };
          }
          
          setSettings(loadedSettings);
        } else {
          console.log('No wallet settings found, creating defaults');
          // Create default wallet settings if they don't exist
          const { error: createError } = await supabase
            .from('platform_settings')
            .insert({ 
              key: 'wallet_settings',
              value: defaultWalletSettings as Json
            });

          if (createError) throw createError;
          
          setSettings(defaultWalletSettings);
        }

        // Also fetch the payment gateway configuration
        const { data: paypalConfig, error: configError } = await supabase
          .from('payment_gateways')
          .select('*')
          .eq('gateway_name', 'paypal')
          .maybeSingle();

        if (!configError && paypalConfig) {
          console.log('Found PayPal gateway config:', paypalConfig);
          
          // Map the database fields to our interface
          const config = {
            ...paypalConfig,
            is_active: paypalConfig.is_enabled,
            is_sandbox: paypalConfig.is_test_mode,
            name: paypalConfig.gateway_name
          } as unknown as PayPalGatewayConfig;
          
          setClientId(config.config.client_id || '');
          setClientSecret(config.config.client_secret || '');
          setIsSandbox(config.is_sandbox || config.is_test_mode || true);
        } else {
          console.log('No PayPal config found');
        }
      } catch (error) {
        console.error('Error fetching wallet settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wallet settings. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchWalletSettings();
    }
  }, [isAdmin, toast]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    
    try {
      console.log('Saving wallet settings:', settings);
      
      // Update platform settings for wallet
      const { error } = await supabase
        .from('platform_settings')
        .update({ 
          value: settings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'wallet_settings');
        
      if (error) throw error;
      
      // Also update payment gateway configuration via the edge function
      const response = await fetch(`${window.location.origin}/.netlify/functions/admin-paypal-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          isSandbox,
          isActive: settings.payment_methods?.paypal?.enabled || false
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update PayPal configuration');
      }
      
      toast({
        title: 'Settings saved',
        description: 'Wallet settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving wallet settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save wallet settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof WalletSettingsType, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handlePayPalChange = (field: string, value: any) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings };
    
    // Ensure payment_methods structure exists
    if (!updatedSettings.payment_methods) {
      updatedSettings.payment_methods = { paypal: { enabled: false } };
    }
    
    // Ensure paypal object exists
    if (!updatedSettings.payment_methods.paypal) {
      updatedSettings.payment_methods.paypal = { enabled: false };
    }
    
    // Update the specific field
    updatedSettings.payment_methods.paypal = {
      ...updatedSettings.payment_methods.paypal,
      [field]: value
    };
    
    console.log('Updated PayPal settings:', updatedSettings.payment_methods.paypal);
    setSettings(updatedSettings);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!settings) {
    return <ErrorState />;
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        <TabsTrigger value="transactions">Transaction Management</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 py-4">
        <GeneralWalletSettings 
          settings={settings}
          isLoading={isLoading}
          isSaving={isSaving}
          handleInputChange={handleInputChange}
          handlePayPalChange={handlePayPalChange}
          handleSaveSettings={handleSaveSettings}
        />
      </TabsContent>
      
      <TabsContent value="payment-methods" className="space-y-4 py-4">
        <PaymentMethodsTab 
          settings={settings}
          isLoading={isLoading}
          isSaving={isSaving}
          handleInputChange={handleInputChange}
          handlePayPalChange={handlePayPalChange}
          handleSaveSettings={handleSaveSettings}
          clientId={clientId}
          clientSecret={clientSecret}
          isSandbox={isSandbox}
          setClientId={setClientId}
          setClientSecret={setClientSecret}
          setIsSandbox={setIsSandbox}
        />
      </TabsContent>
      
      <TabsContent value="transactions">
        <AdminWalletTransactions />
      </TabsContent>
    </Tabs>
  );
};
