
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface PayPalFormProps {
  onDataChange: (data: any) => void;
}

export function PayPalForm({ onDataChange }: PayPalFormProps) {
  // In a real implementation, this would initialize the PayPal SDK
  React.useEffect(() => {
    onDataChange({
      type: 'paypal',
      data: { readyForPayment: true }
    });
  }, [onDataChange]);
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4 text-center">
        <div className="p-4 flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground">
            You'll be redirected to PayPal to complete your payment after submitting your order.
          </p>
          
          <img 
            src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paypal.svg" 
            alt="PayPal Logo" 
            className="h-14 bg-white p-2 rounded-md"
          />
          
          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3 text-blue-800 dark:text-blue-300">
            <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-left">
              PayPal provides buyer protection and allows you to pay using your PayPal balance, bank account, or credit card.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
