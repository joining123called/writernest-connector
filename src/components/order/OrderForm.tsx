
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { OrderFormFields } from './OrderFormFields';
import { OrderSummary } from './OrderSummary';
import { usePriceCalculator } from './PriceCalculator';

const orderFormSchema = z.object({
  paperType: z.string({
    required_error: "Please select a paper type",
  }),
  subject: z.string({
    required_error: "Please select a subject",
  }),
  pages: z.string({
    required_error: "Please select number of pages",
  }),
  deadline: z.string({
    required_error: "Please select a deadline",
  }),
  topic: z.string().optional(),
  instructions: z.string().optional(),
  citationStyle: z.string().optional(),
  sources: z.string().optional(),
});

type OrderFormProps = {
  onOrderSubmit?: (data: z.infer<typeof orderFormSchema>) => void;
};

export function OrderForm({ onOrderSubmit }: OrderFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paperType: "",
      subject: "",
      pages: "1",
      deadline: "7d",
      topic: "",
      instructions: "",
      citationStyle: "apa",
      sources: "0",
    },
  });
  
  const watchPages = form.watch('pages');
  const watchDeadline = form.watch('deadline');
  
  // Use the price calculator hook
  const orderSummary = usePriceCalculator(watchPages, watchDeadline);
  
  const onSubmit = (data: z.infer<typeof orderFormSchema>) => {
    console.log("Order submitted:", data, orderSummary);
    
    toast({
      title: "Order submitted successfully",
      description: "Your order has been received and is being processed.",
    });
    
    if (onOrderSubmit) {
      onOrderSubmit(data);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <OrderFormFields form={form} />
            </form>
          </Form>
        </div>
        
        <div className="w-full md:w-1/3">
          <OrderSummary 
            form={form} 
            orderSummary={orderSummary} 
            orderFormSchema={orderFormSchema}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
