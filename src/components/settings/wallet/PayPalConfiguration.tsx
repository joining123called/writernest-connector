
import React from 'react';
import { PayPalConfigProps } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PayPalConfiguration: React.FC<PayPalConfigProps> = ({
  clientId,
  clientSecret,
  isSandbox,
  setClientId,
  setClientSecret,
  setIsSandbox,
  enabled,
  onEnabledChange
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">PayPal Integration</h3>
        </div>
        <Switch
          id="enable-paypal"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {enabled && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
            <Input
              id="paypal-client-id"
              type="text"
              placeholder="Enter your PayPal Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              You can find your Client ID in the PayPal Developer Dashboard
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paypal-client-secret">PayPal Client Secret</Label>
            <Input
              id="paypal-client-secret"
              type="password"
              placeholder="Enter your PayPal Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your Client Secret is used server-side to authenticate with PayPal
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="paypal-sandbox"
              checked={isSandbox}
              onCheckedChange={setIsSandbox}
            />
            <Label htmlFor="paypal-sandbox" className="flex flex-col">
              <span>Use Sandbox Mode</span>
              <span className="font-normal text-sm text-muted-foreground">
                Enable for testing with PayPal sandbox accounts
              </span>
            </Label>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This integration uses direct PayPal API calls for payment processing without requiring webhooks.
              All payment status updates will be handled in real-time during the payment flow.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
