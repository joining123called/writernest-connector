
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock } from 'lucide-react';
import { format, isToday, isTomorrow } from "date-fns";
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues, paperTypes, subjects, citationStyles } from './schema';
import { useCurrency } from '@/hooks/use-currency';

interface OrderSummaryProps {
  form: UseFormReturn<OrderFormValues>;
  orderSummary: {
    basePrice: number;
    pages: number;
    words: number;
    deadline: Date;
    deadlineText: string;
    pricePerPage: number;
    totalPrice: number;
    discount: number;
    finalPrice: number;
  };
  uploadedFiles: File[];
  isFormComplete: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
  settings: {
    showSubjectFields: boolean;
    showPageCount: boolean;
    showWordCount: boolean;
    showDeadlineOptions: boolean;
    showCitationStyles: boolean;
    showSources: boolean;
    priceDisplayMode: "perPage" | "total";
  };
}

export function OrderSummary({ 
  form, 
  orderSummary, 
  uploadedFiles, 
  isFormComplete, 
  onSubmit,
  isSubmitting = false,
  settings
}: OrderSummaryProps) {
  const { formatPrice, convertPrice } = useCurrency();
  
  const handleSubmit = () => {
    onSubmit();
  };
  
  return (
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
          {settings.showSubjectFields && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{form.watch('subject') ? 
                subjects.find(s => s.value === form.watch('subject'))?.label : 
                "Not selected"}</span>
            </div>
          )}
          {settings.showPageCount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">
                {orderSummary.pages} page{orderSummary.pages > 1 ? 's' : ''}
                {settings.showWordCount ? ` / ${orderSummary.words} words` : ''}
              </span>
            </div>
          )}
          {settings.showDeadlineOptions && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">{orderSummary.deadlineText}</span>
            </div>
          )}
          
          {settings.showCitationStyles && form.watch('citationStyle') && form.watch('citationStyle') !== "none" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Citation style:</span>
              <span className="font-medium">
                {citationStyles.find(s => s.value === form.watch('citationStyle'))?.label}
              </span>
            </div>
          )}
          
          {settings.showSources && form.watch('sources') && form.watch('sources') !== "0" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sources:</span>
              <span className="font-medium">{form.watch('sources')}</span>
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Files:</span>
              <Badge variant="outline" className="font-medium">
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="text-lg font-medium mb-2">Price Breakdown</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base price:</span>
              {settings.priceDisplayMode === 'perPage' ? (
                <span>{formatPrice(convertPrice(orderSummary.pricePerPage))} × {orderSummary.pages}</span>
              ) : (
                <span>{formatPrice(convertPrice(orderSummary.totalPrice))}</span>
              )}
            </div>
            
            {orderSummary.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount (15%):</span>
                <span>-{formatPrice(convertPrice(orderSummary.discount))}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{formatPrice(convertPrice(orderSummary.finalPrice))}</span>
          </div>
          
          {orderSummary.discount > 0 && (
            <div className="text-green-600 text-sm text-right mt-1">
              You save: {formatPrice(convertPrice(orderSummary.discount))}
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3 text-sm">
            <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Estimated delivery time</p>
              <p className="text-blue-600 dark:text-blue-400">
                {isToday(orderSummary.deadline) ? 
                  `Today at ${format(orderSummary.deadline, "h:mm a")}` : 
                  isTomorrow(orderSummary.deadline) ?
                  `Tomorrow at ${format(orderSummary.deadline, "h:mm a")}` :
                  `${format(orderSummary.deadline, "MMMM d, yyyy")} at ${format(orderSummary.deadline, "h:mm a")}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button 
          type="button" 
          className="w-full" 
          size="lg"
          disabled={!isFormComplete || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit Order"}
        </Button>
        <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          Protected by SSL encryption
        </div>
      </CardFooter>
    </Card>
  );
}
