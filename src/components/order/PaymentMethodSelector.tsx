
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PaymentMethod } from '@/types/payment';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string | null;
  onSelectMethod: (methodId: string) => void;
}

export function PaymentMethodSelector({ 
  paymentMethods, 
  selectedMethod, 
  onSelectMethod 
}: PaymentMethodSelectorProps) {
  const enabledMethods = paymentMethods.filter(method => method.isEnabled);

  if (enabledMethods.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No payment methods are currently available. Please contact the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Select Payment Method</h3>
      
      <RadioGroup 
        value={selectedMethod || undefined} 
        onValueChange={onSelectMethod}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {enabledMethods.map((method) => (
          <div key={method.id} className="relative">
            <RadioGroupItem
              value={method.id}
              id={`payment-${method.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`payment-${method.id}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="flex w-full items-center space-x-3">
                <div className="text-primary">{method.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-none">{method.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{method.description}</div>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
