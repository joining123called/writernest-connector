
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AdminWalletTransactions } from './AdminWalletTransactions';
import { Loader2, Paypal, CreditCard, AlertCircle } from 'lucide-react';
import { defaultWalletSettings, WalletSettings as WalletSettingsType } from '@/hooks/platform-settings/types';
import { Json } from '@/types/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const WalletSettings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WalletSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          setSettings(data.value as WalletSettingsType);
        } else {
          // Create default wallet settings if they don't exist
          const { error: createError } = await supabase
            .from('platform_settings')
            .insert({ 
              key: 'wallet_settings',
              value: defaultWalletSettings as unknown as Json
            });

          if (createError) throw createError;
          
          setSettings(defaultWalletSettings);
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
      const { error } = await supabase
        .from('platform_settings')
        .update({ 
          value: settings as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'wallet_settings');
        
      if (error) throw error;
      
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
    
    setSettings({
      ...settings,
      payment_methods: {
        ...settings.payment_methods,
        paypal: {
          ...settings.payment_methods.paypal,
          [field]: value
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p>Unable to load wallet settings.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        <TabsTrigger value="transactions">Transaction Management</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Wallet System Configuration</CardTitle>
            <CardDescription>
              Configure global settings for the client wallet system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable-wallet" className="flex flex-col space-y-1">
                <span>Enable Wallet System</span>
                <span className="font-normal text-sm text-muted-foreground">
                  When disabled, clients won't be able to see or use their wallets
                </span>
              </Label>
              <Switch
                id="enable-wallet"
                checked={settings.enable_wallet_system}
                onCheckedChange={(checked) => handleInputChange('enable_wallet_system', checked)}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Deposit Settings</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-deposit">Minimum Deposit Amount ($)</Label>
                  <Input
                    id="min-deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.min_deposit_amount}
                    onChange={(e) => handleInputChange('min_deposit_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-deposit">Maximum Deposit Amount ($)</Label>
                  <Input
                    id="max-deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.max_deposit_amount}
                    onChange={(e) => handleInputChange('max_deposit_amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Withdrawal Settings</h3>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="allow-withdrawals" className="flex flex-col space-y-1">
                  <span>Allow Withdrawals</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    When enabled, clients can withdraw funds from their wallet
                  </span>
                </Label>
                <Switch
                  id="allow-withdrawals"
                  checked={settings.allow_withdrawals}
                  onCheckedChange={(checked) => handleInputChange('allow_withdrawals', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="withdrawal-fee">Withdrawal Fee Percentage (%)</Label>
                <Input
                  id="withdrawal-fee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.withdrawal_fee_percentage}
                  onChange={(e) => handleInputChange('withdrawal_fee_percentage', parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Fee charged when clients withdraw funds from their wallet
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="payment-methods" className="space-y-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Configuration</CardTitle>
            <CardDescription>
              Configure payment gateways for deposits and withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paypal className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">PayPal Integration</h3>
                </div>
                <Switch
                  id="enable-paypal"
                  checked={settings.payment_methods.paypal.enabled}
                  onCheckedChange={(checked) => handlePayPalChange('enabled', checked)}
                />
              </div>
              
              {settings.payment_methods.paypal.enabled && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                    <Input
                      id="paypal-client-id"
                      type="text"
                      placeholder="Enter your PayPal Client ID"
                      value={settings.payment_methods.paypal.client_id || ''}
                      onChange={(e) => handlePayPalChange('client_id', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      You can find your Client ID in the PayPal Developer Dashboard
                    </p>
                  </div>
                  
                  <Alert variant="info" className="bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription>
                      To use PayPal integration, you need to create a PayPal Developer account and set up an app to get your Client ID.
                      For complete integration, a server-side component would also be needed in a production environment.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
            
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-500">Credit Card Integration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Credit card integration coming soon. This will allow direct credit card payments for wallet deposits.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="transactions">
        <AdminWalletTransactions />
      </TabsContent>
    </Tabs>
  );
};
