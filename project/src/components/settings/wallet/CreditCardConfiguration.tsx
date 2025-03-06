
import React from 'react';
import { CreditCard } from 'lucide-react';

export const CreditCardConfiguration: React.FC = () => {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-500">Credit Card Integration</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Credit card integration coming soon. This will allow direct credit card payments for wallet deposits.
      </p>
    </div>
  );
};
