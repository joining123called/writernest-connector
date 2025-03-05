
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { PaymentSystemCleanup } from './PaymentSystemCleanup';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const PaymentMethodsSettings = () => {
  return (
    <div className="space-y-8">
      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
        <Info className="h-4 w-4" />
        <AlertTitle>Payment Methods Disabled</AlertTitle>
        <AlertDescription>
          Payment method settings have been removed from the application. 
          If you need to implement payment functionality, please contact your administrator.
        </AlertDescription>
      </Alert>
      
      <Separator className="my-8" />
      
      <div>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">Danger Zone</h2>
        <PaymentSystemCleanup />
      </div>
    </div>
  );
};
