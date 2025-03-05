
import React from 'react';
import { PaymentMethodsTab } from './payment-methods/PaymentMethodsTab';
import { PaymentSystemCleanup } from './PaymentSystemCleanup';
import { Separator } from '@/components/ui/separator';

export const PaymentMethodsSettings = () => {
  return (
    <div className="space-y-8">
      <PaymentMethodsTab />
      <Separator className="my-8" />
      <div>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">Danger Zone</h2>
        <PaymentSystemCleanup />
      </div>
    </div>
  );
};
