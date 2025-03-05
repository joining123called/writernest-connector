
import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { OrderFormFields } from './OrderFormFields';
import { OrderSummary } from './OrderSummary';
import { usePriceCalculator } from './PriceCalculator';
import { add } from 'date-fns';
import { motion } from 'framer-motion';

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
  deadlineDate: z.date({
    required_error: "Please select a deadline date",
  }),
  deadlineTime: z.string({
    required_error: "Please select a deadline time",
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
  
  // Set default deadline date to 7 days from now at 11:59 PM
  const defaultDeadlineDate = add(new Date(), { days: 7 });
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paperType: "",
      subject: "",
      pages: "1",
      deadlineDate: defaultDeadlineDate,
      deadlineTime: "11:59 PM",
      topic: "",
      instructions: "",
      citationStyle: "apa",
      sources: "0",
    },
  });
  
  const watchPages = form.watch('pages');
  
  // Calculate the deadline in days based on the selected date and time
  const [calculatedDeadlineDays, setCalculatedDeadlineDays] = React.useState("7d");
  const watchDeadlineDate = form.watch('deadlineDate');
  const watchDeadlineTime = form.watch('deadlineTime');
  
  useEffect(() => {
    if (watchDeadlineDate) {
      const now = new Date();
      const deadlineDate = new Date(watchDeadlineDate);
      
      // Parse time string to add hours and minutes
      if (watchDeadlineTime) {
        const [timeStr, period] = watchDeadlineTime.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        let hour = hours;
        if (period === 'PM' && hours < 12) hour += 12;
        if (period === 'AM' && hours === 12) hour = 0;
        
        deadlineDate.setHours(hour, minutes, 0);
      }
      
      // Calculate the difference in hours
      const diffHours = Math.round((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      // Convert to appropriate deadline format
      let deadlineCode = '';
      if (diffHours <= 6) deadlineCode = '6h';
      else if (diffHours <= 12) deadlineCode = '12h';
      else if (diffHours <= 24) deadlineCode = '24h';
      else if (diffHours <= 48) deadlineCode = '48h';
      else if (diffHours <= 72) deadlineCode = '72h';
      else if (diffHours <= 120) deadlineCode = '5d';
      else if (diffHours <= 168) deadlineCode = '7d';
      else if (diffHours <= 240) deadlineCode = '10d';
      else if (diffHours <= 336) deadlineCode = '14d';
      else if (diffHours <= 480) deadlineCode = '20d';
      else deadlineCode = '30d';
      
      setCalculatedDeadlineDays(deadlineCode);
    }
  }, [watchDeadlineDate, watchDeadlineTime]);
  
  // Use the price calculator hook with the calculated deadline
  const orderSummary = usePriceCalculator(watchPages, calculatedDeadlineDays);
  
  const onSubmit = (data: z.infer<typeof orderFormSchema>) => {
    console.log("Order submitted:", data, orderSummary);
    
    // Format the complete deadline for display
    const deadlineDate = new Date(data.deadlineDate);
    const [timeStr, period] = data.deadlineTime.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let hour = hours;
    if (period === 'PM' && hours < 12) hour += 12;
    if (period === 'AM' && hours === 12) hour = 0;
    
    deadlineDate.setHours(hour, minutes, 0);
    
    const completeData = {
      ...data,
      formattedDeadline: deadlineDate.toLocaleString(),
      calculatedDeadlineBracket: calculatedDeadlineDays
    };
    
    toast({
      title: "Order submitted successfully",
      description: "Your order has been received and is being processed.",
    });
    
    if (onOrderSubmit) {
      onOrderSubmit(completeData);
    }
  };
  
  return (
    <div className="container px-0 mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div 
          className="w-full lg:w-2/3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <OrderFormFields form={form} />
            </form>
          </Form>
        </motion.div>
        
        <motion.div 
          className="w-full lg:w-1/3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <OrderSummary 
            form={form} 
            orderSummary={orderSummary} 
            orderFormSchema={orderFormSchema}
            onSubmit={onSubmit}
          />
        </motion.div>
      </div>
    </div>
  );
}
