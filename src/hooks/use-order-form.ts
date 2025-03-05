
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { addHours, isToday, isTomorrow } from "date-fns";
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { OrderFormValues, orderFormSchema } from '@/components/order/schema';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

// Maximum file size: 2GB in bytes
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

export function useOrderForm(onOrderSubmit?: (data: OrderFormValues & { files: File[] }) => void) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [orderSummary, setOrderSummary] = useState({
    basePrice: 15.99,
    pages: 1,
    words: 275,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deadlineText: '7 days',
    pricePerPage: 15.99,
    totalPrice: 15.99,
    discount: 0,
    finalPrice: 15.99,
  });
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paperType: "",
      subject: "",
      pages: "1",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      topic: "",
      instructions: "",
      citationStyle: "apa",
      sources: "0",
    },
  });
  
  // Update the deadline when settings load
  useEffect(() => {
    if (!isLoadingSettings) {
      form.reset({
        ...form.getValues(),
        deadline: new Date(Date.now() + settings.standardDeliveryDays * 24 * 60 * 60 * 1000),
      });
    }
  }, [isLoadingSettings, settings, form]);

  const watchPages = form.watch('pages');
  const watchDeadline = form.watch('deadline');
  
  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = ['paperType', 'subject', 'pages', 'deadline'];
    const isComplete = requiredFields.every(field => !!form.getValues(field as any));
    setIsFormComplete(isComplete);
  }, [form.watch()]);
  
  // Calculate price based on pages and deadline
  useEffect(() => {
    if (isLoadingSettings) return;
    
    const pages = parseInt(watchPages || "1");
    const now = new Date();
    const selectedDate = watchDeadline || now;
    
    const diffTime = Math.abs(selectedDate.getTime() - now.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let multiplier = 1.0;
    const minHours = settings.minimumHours;
    
    // Apply the appropriate multiplier based on the deadline
    if (diffHours <= minHours) {
      multiplier = settings.urgentDeliveryMultiplier;
    } else if (diffHours <= 12) {
      multiplier = settings.urgent12HoursMultiplier;
    } else if (diffHours <= 24) {
      multiplier = settings.urgent24HoursMultiplier;
    } else if (diffHours <= 48) {
      multiplier = settings.urgent48HoursMultiplier;
    } else if (diffDays <= settings.standardDeliveryDays) {
      multiplier = 1.0;
    } else {
      multiplier = 0.9;
    }
    
    let deadlineText = '';
    if (isToday(selectedDate)) {
      deadlineText = `Today at ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(selectedDate)}`;
    } else if (isTomorrow(selectedDate)) {
      deadlineText = `Tomorrow at ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(selectedDate)}`;
    } else if (diffDays <= 7) {
      deadlineText = `${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(selectedDate)} at ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(selectedDate)}`;
    } else {
      deadlineText = new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(selectedDate);
    }
    
    if (diffHours <= 12) {
      deadlineText += " (Very Urgent)";
    } else if (diffHours <= 24) {
      deadlineText += " (Urgent)";
    } else if (diffHours <= 48) {
      deadlineText += " (Express)";
    }
    
    const basePrice = settings.basePricePerPage;
    const pricePerPage = basePrice * multiplier;
    const totalPrice = pricePerPage * pages;
    
    let discount = 0;
    if (pages >= 3) {
      discount = totalPrice * 0.15;
    }
    
    const finalPrice = totalPrice - discount;
    
    setOrderSummary({
      basePrice,
      pages,
      words: pages * 275,
      deadline: selectedDate,
      deadlineText,
      pricePerPage,
      totalPrice,
      discount,
      finalPrice
    });
  }, [watchPages, watchDeadline, settings, isLoadingSettings]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 2GB limit`);
        return;
      }
      
      newFiles.push(file);
    });
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: "File upload error",
          description: error,
          variant: "destructive",
        });
      });
    }
    
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) ready to be submitted with your order`,
      });
    }
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const createTransaction = async (paymentMethod: string | null, amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit an order",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Create a new transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          order_id: crypto.randomUUID(), // This would normally be an actual order ID
          gateway: paymentMethod || 'manual',
          amount,
          currency: 'USD',
          status: 'pending',
          gateway_transaction_id: null,
          gateway_response: null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Payment processing error",
        description: "Failed to initialize payment process. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const handleSubmit = async (paymentMethod: string | null = null) => {
    const values = form.getValues();
    
    if (paymentMethod) {
      setIsProcessingPayment(true);
      
      try {
        // Create a transaction record
        const transaction = await createTransaction(paymentMethod, orderSummary.finalPrice);
        
        if (!transaction) {
          setIsProcessingPayment(false);
          return;
        }
        
        // For demonstration purposes, we're simulating a successful payment
        // In a real application, this would redirect to PayPal or use Stripe Elements
        setTimeout(() => {
          toast({
            title: "Payment Successful",
            description: `Your payment of $${orderSummary.finalPrice.toFixed(2)} has been processed successfully.`,
          });
          
          if (onOrderSubmit) {
            onOrderSubmit({...values, files: uploadedFiles});
          }
          
          setIsProcessingPayment(false);
        }, 1500);
      } catch (error) {
        console.error("Payment processing error:", error);
        toast({
          title: "Payment failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } else {
      // If no payment method is required or available
      toast({
        title: "Order submitted successfully",
        description: "Your order has been received and is being processed.",
      });
      
      if (onOrderSubmit) {
        onOrderSubmit({...values, files: uploadedFiles});
      }
    }
  };
  
  return {
    form,
    orderSummary,
    uploadedFiles,
    setUploadedFiles,
    isFormComplete,
    isLoading: isLoadingSettings,
    isProcessingPayment,
    handleFileUpload,
    handleSubmit
  };
}
