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
import { Loader2 } from 'lucide-react';

interface WalletSettings {
  id: string;
  min_deposit_amount: number;
  max_deposit_amount: number;
  allow_withdrawals: boolean;
  withdrawal_fee_percentage: number;
  enable_wallet_system: boolean;
}

export const WalletSettings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<WalletSettings | null>(null);
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
          setSettings(data.value as unknown as WalletSettings);
        } else {
          // Create default wallet settings if they don't exist
          const defaultSettings: WalletSettings = {
            id: 'wallet_settings',
            min_deposit_amount: 5,
            max_deposit_amount: 1000,
            allow_withdrawals: true,
            withdrawal_fee_percentage: 2.5,
            enable_wallet_system: true
          };
          
          const { error: createError } = await supabase
            .from('platform_settings')
            .insert({ 
              key: 'wallet_settings',
              value: defaultSettings
            });

          if (createError) throw createError;
          
          setSettings(defaultSettings);
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

  const handleInputChange = (field: keyof WalletSettings, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: value
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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">General Settings</TabsTrigger>
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
      
      <TabsContent value="transactions">
        <AdminWalletTransactions />
      </TabsContent>
    </Tabs>
  );
};
