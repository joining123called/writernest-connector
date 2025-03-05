
import React from 'react';
import { CreditCardForm } from './CreditCardForm';
import { PayPalForm } from './PayPalForm';
import { GenericPaymentForm } from './GenericPaymentForm';

interface PaymentMethodFormsProps {
  selectedMethod: string | null;
  onPaymentDataChange: (data: any) => void;
}

export function PaymentMethodForms({ selectedMethod, onPaymentDataChange }: PaymentMethodFormsProps) {
  if (!selectedMethod) return null;
  
  switch (selectedMethod) {
    case 'stripe':
      return <CreditCardForm onDataChange={onPaymentDataChange} />;
    case 'paypal':
      return <PayPalForm onDataChange={onPaymentDataChange} />;
    default:
      return <GenericPaymentForm methodId={selectedMethod} onDataChange={onPaymentDataChange} />;
  }
}
