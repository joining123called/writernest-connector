
import React from 'react';
import { WalletSettingsProps } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PayPalConfiguration } from './PayPalConfiguration';
import { CreditCardConfiguration } from './CreditCardConfiguration';

interface PaymentMethodsTabProps extends WalletSettingsProps {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  isSandbox: boolean;
  setClientId: (value: string) => void;
  setClientSecret: (value: string) => void;
  setWebhookId: (value: string) => void;
  setIsSandbox: (value: boolean) => void;
}

export const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
  settings,
  isSaving,
  handlePayPalChange,
  handleSaveSettings,
  clientId,
  clientSecret,
  webhookId,
  isSandbox,
  setClientId,
  setClientSecret,
  setWebhookId,
  setIsSandbox
}) => {
  if (!settings) return null;

  // Make sure the payment_methods structure exists even if it's empty in the database
  const paypalEnabled = settings.payment_methods?.paypal?.enabled || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method Configuration</CardTitle>
        <CardDescription>
          Configure payment gateways for deposits and withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PayPalConfiguration
          clientId={clientId}
          clientSecret={clientSecret}
          webhookId={webhookId}
          isSandbox={isSandbox}
          setClientId={setClientId}
          setClientSecret={setClientSecret}
          setWebhookId={setWebhookId}
          setIsSandbox={setIsSandbox}
          enabled={paypalEnabled}
          onEnabledChange={(checked) => handlePayPalChange('enabled', checked)}
        />
        
        <CreditCardConfiguration />
        
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
