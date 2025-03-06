
import React from 'react';
import { WalletSettingsProps } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const GeneralWalletSettings: React.FC<WalletSettingsProps> = ({
  settings,
  isLoading,
  isSaving,
  handleInputChange,
  handleSaveSettings
}) => {
  if (!settings) return null;

  return (
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
  );
};
