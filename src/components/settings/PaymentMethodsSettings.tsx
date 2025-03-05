
import React from 'react';
import { PaymentMethodsTab } from './payment-methods/PaymentMethodsTab';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { Beaker } from 'lucide-react';

export const PaymentMethodsSettings = () => {
  const { settings } = usePlatformSettings();
  const isTestMode = settings?.testModeEnabled;
  
  return (
    <div className="space-y-6">
      {isTestMode && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
          <Beaker className="h-4 w-4" />
          <AlertTitle>Test Mode Active</AlertTitle>
          <AlertDescription>
            Payment processing is currently in test mode. No real payments will be processed.
          </AlertDescription>
        </Alert>
      )}
      <PaymentMethodsTab />
    </div>
  );
};
