
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface PayPalFormProps {
  onDataChange: (data: any) => void;
}

export function PayPalForm({ onDataChange }: PayPalFormProps) {
  // Initialize PayPal payment data
  React.useEffect(() => {
    onDataChange({
      type: 'paypal',
      data: { readyForPayment: true }
    });
  }, [onDataChange]);
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4 flex justify-center">
        <div className="flex flex-col items-center space-y-3 py-4">
          <img 
            src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paypal.svg" 
            alt="PayPal" 
            className="h-16 bg-white p-2 rounded-md shadow-sm"
          />
          
          <div className="text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Shield className="h-4 w-4" />
            <span>Buyer Protection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
