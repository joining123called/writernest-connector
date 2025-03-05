
import React from 'react';
import { OrderSummaryData, paperTypes, subjects, citationStyles } from './PriceCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Calendar, Shield, CheckCircle2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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
      <Card className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90 rounded-2xl border shadow-md overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600"></div>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Paper type:</span>
              <span className="font-medium">{form.watch('paperType') ? 
                paperTypes.find(t => t.value === form.watch('paperType'))?.label : 
                "Not selected"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{form.watch('subject') ? 
                subjects.find(s => s.value === form.watch('subject'))?.label : 
                "Not selected"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Length:</span>
              <span className="font-medium">{orderSummary.pages} page{orderSummary.pages > 1 ? 's' : ''} / {orderSummary.words} words</span>
            </div>
            
            <div className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground pt-0.5">Deadline:</span>
              <span className="font-medium text-right">{formatDeadline()}</span>
            </div>
            
            {form.watch('citationStyle') && form.watch('citationStyle') !== "none" && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Citation:</span>
                <span className="font-medium">
                  {citationStyles.find(s => s.value === form.watch('citationStyle'))?.label}
                </span>
              </div>
            )}
            
            {form.watch('sources') && form.watch('sources') !== "0" && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sources:</span>
                <span className="font-medium">{form.watch('sources')}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <div className="text-base font-medium mb-3">Price Breakdown</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Base price:</span>
                <span>${orderSummary.pages} × ${orderSummary.pricePerPage.toFixed(2)}</span>
              </div>
              
              {orderSummary.discount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-500">
                  <span>Discount (15%):</span>
                  <span>-${orderSummary.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${orderSummary.finalPrice.toFixed(2)}</span>
            </div>
            
            {orderSummary.discount > 0 && (
              <div className="text-green-600 dark:text-green-500 text-sm text-right mt-1">
                You save: ${orderSummary.discount.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50/70 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300 text-sm">Delivery Guarantee</p>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                {formatDeadline()}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>100% Original Content</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>Free Revisions Within 10 Days</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>Secure & Confidential</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-2 pb-6">
          <Button
            className="w-full"
            size="lg"
            variant="premium"
            onClick={form.handleSubmit(onSubmit)}
          >
            Complete Your Order
          </Button>
          
          <div className="flex justify-center items-center text-xs text-muted-foreground gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>Protected by SSL encryption</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
