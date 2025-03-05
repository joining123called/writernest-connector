
import React from 'react';
import { OrderSummaryData, paperTypes, subjects, citationStyles } from './PriceCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Shield, CreditCard, Calendar } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

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
      <Card className="border border-border/10 shadow-md overflow-hidden bg-gradient-to-br from-card/80 to-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border/10">
          <CardTitle className="text-xl font-semibold text-card-foreground/90">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
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
          
          <Separator className="my-4 bg-border/10" />
          
          <div>
            <div className="text-lg font-medium mb-3">Price</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base price:</span>
                <span>${orderSummary.pages} × ${orderSummary.pricePerPage.toFixed(2)}</span>
              </div>
              
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                  <span>Discount (15%):</span>
                  <span>-${orderSummary.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-primary/5 dark:bg-primary/10 -mx-6 px-6 py-4 border-t border-b border-border/10">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <motion.span
                key={orderSummary.finalPrice}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className="text-primary"
              >
                ${orderSummary.finalPrice.toFixed(2)}
              </motion.span>
            </div>
            
            {orderSummary.discount > 0 && (
              <div className="text-green-600 dark:text-green-500 text-sm text-right mt-1">
                You save: ${orderSummary.discount.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg flex items-start gap-3 text-sm">
            <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-400">Delivery Information</p>
              <p className="text-blue-600/90 dark:text-blue-400/90">
                {formatDeadline()}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-2 pb-6">
          <Button
            className="w-full h-12 font-medium text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
            onClick={form.handleSubmit(onSubmit)}
          >
            Complete Your Order
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield size={14} />
            <span>Secure payment & 100% confidential</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
