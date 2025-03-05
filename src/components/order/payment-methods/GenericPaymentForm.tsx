
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/use-payment-methods';

interface GenericPaymentFormProps {
  methodId: string;
  onDataChange: (data: any) => void;
}

export function GenericPaymentForm({ methodId, onDataChange }: GenericPaymentFormProps) {
  const { paymentMethods } = usePaymentMethods();
  const method = paymentMethods.find(m => m.id === methodId);
  
  React.useEffect(() => {
    onDataChange({
      type: methodId,
      data: { readyForPayment: true }
    });
  }, [methodId, onDataChange]);
  
  if (!method) return null;
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4 text-center">
        <div className="p-4 flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground">
            You'll be redirected to {method.name} to complete your payment after submitting your order.
          </p>
          
          <div className="h-16 w-32 overflow-hidden bg-white rounded p-2 flex items-center justify-center">
            <img 
              src={method.logo} 
              alt={`${method.name} Logo`} 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                const parent = target.parentNode as HTMLElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>`;
                  parent.appendChild(fallback.firstChild as Node);
                }
              }}
            />
          </div>
          
          <Alert className="text-sm bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              Complete your order to proceed to the {method.name} payment page.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
