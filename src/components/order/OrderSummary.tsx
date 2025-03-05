
import React from 'react';
import { OrderSummaryData, paperTypes, subjects, citationStyles } from './PriceCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Calendar } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

type OrderSummaryProps = {
  form: UseFormReturn<any>;
  orderSummary: OrderSummaryData;
  orderFormSchema: z.ZodObject<any>;
  onSubmit: (data: z.infer<z.ZodObject<any>>) => void;
};

export function OrderSummary({ form, orderSummary, orderFormSchema, onSubmit }: OrderSummaryProps) {
  // Format the deadline for display
  const formatDeadline = () => {
    const deadlineDate = form.watch('deadlineDate');
    const deadlineTime = form.watch('deadlineTime');
    
    if (!deadlineDate || !deadlineTime) return "Not specified";
    
    const formattedDate = format(deadlineDate, 'MMM d, yyyy');
    return `${formattedDate} at ${deadlineTime}`;
  };
  
  return (
    <div className="sticky top-6">
      <Card className="bg-gray-50 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paper type:</span>
              <span className="font-medium">{form.watch('paperType') ? 
                paperTypes.find(t => t.value === form.watch('paperType'))?.label : 
                "Not selected"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{form.watch('subject') ? 
                subjects.find(s => s.value === form.watch('subject'))?.label : 
                "Not selected"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Length:</span>
              <span className="font-medium">{orderSummary.pages} page{orderSummary.pages > 1 ? 's' : ''} / {orderSummary.words} words</span>
            </div>
            <div className="flex justify-between text-sm items-start">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium text-right">{formatDeadline()}</span>
            </div>
            
            {form.watch('citationStyle') && form.watch('citationStyle') !== "none" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Citation style:</span>
                <span className="font-medium">
                  {citationStyles.find(s => s.value === form.watch('citationStyle'))?.label}
                </span>
              </div>
            )}
            
            {form.watch('sources') && form.watch('sources') !== "0" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sources:</span>
                <span className="font-medium">{form.watch('sources')}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-border pt-4">
            <div className="text-lg font-medium mb-2">Price Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price:</span>
                <span>${orderSummary.pages} × ${orderSummary.pricePerPage.toFixed(2)}</span>
              </div>
              
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (15%):</span>
                  <span>-${orderSummary.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${orderSummary.finalPrice.toFixed(2)}</span>
            </div>
            
            {orderSummary.discount > 0 && (
              <div className="text-green-600 text-sm text-right mt-1">
                You save: ${orderSummary.discount.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3 text-sm">
              <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">Delivery Information</p>
                <p className="text-blue-600 dark:text-blue-400">
                  {formatDeadline()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            className="w-full"
            size="lg"
            variant="premium"
            onClick={form.handleSubmit(onSubmit)}
          >
            Complete Your Order
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Protected by SSL encryption
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
