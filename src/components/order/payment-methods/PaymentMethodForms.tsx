
import React, { useEffect } from 'react';
import { CreditCardForm } from './CreditCardForm';
import { PayPalForm } from './PayPalForm';
import { GenericPaymentForm } from './GenericPaymentForm';
import { Loader2 } from 'lucide-react';

interface PaymentMethodFormsProps {
  selectedMethod: string | null;
  onPaymentDataChange: (data: any) => void;
  isProcessing?: boolean;
}

export function PaymentMethodForms({ 
  selectedMethod, 
  onPaymentDataChange,
  isProcessing = false 
}: PaymentMethodFormsProps) {
  useEffect(() => {
    if (!selectedMethod) {
      // Reset payment data when no method is selected
      onPaymentDataChange(null);
    }
  }, [selectedMethod, onPaymentDataChange]);
  
  if (!selectedMethod) return null;
  
  if (isProcessing) {
    return (
      <div className="mt-4 p-6 border rounded-md flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-center text-muted-foreground">
          Processing your payment...
        </p>
      </div>
    );
  }
  
  switch (selectedMethod) {
    case 'stripe':
      return <CreditCardForm onDataChange={onPaymentDataChange} />;
    case 'paypal':
      return <PayPalForm onDataChange={onPaymentDataChange} />;
    default:
      return <GenericPaymentForm methodId={selectedMethod} onDataChange={onPaymentDataChange} />;
  }
}
