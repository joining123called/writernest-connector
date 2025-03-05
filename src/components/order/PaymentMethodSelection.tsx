
import React from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PaymentMethod, usePaymentMethods } from '@/hooks/use-payment-methods';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CreditCard } from 'lucide-react';

interface PaymentMethodSelectionProps {
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (methodId: string) => void;
}

export function PaymentMethodSelection({ 
  selectedPaymentMethod, 
  onSelectPaymentMethod 
}: PaymentMethodSelectionProps) {
  const { enabledPaymentMethods, isLoading, hasEnabledPaymentMethods } = usePaymentMethods();
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  
  if (!hasEnabledPaymentMethods) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No payment methods available</AlertTitle>
        <AlertDescription>
          Contact the administrator to set up payment methods.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>
      <RadioGroup 
        value={selectedPaymentMethod || undefined} 
        onValueChange={onSelectPaymentMethod}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {enabledPaymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <RadioGroupItem
              value={method.id}
              id={`payment-${method.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`payment-${method.id}`}
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
            >
              <div className="h-12 w-full overflow-hidden flex items-center justify-center bg-white rounded p-1 mb-2">
                <img 
                  src={method.logo} 
                  alt={`${method.name}`} 
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    const parent = target.parentNode as HTMLElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>`;
                      parent.appendChild(fallback.firstChild as Node);
                    }
                  }}
                />
              </div>
              <p className="text-sm font-medium text-center">{method.name}</p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
