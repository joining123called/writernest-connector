
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { addHours, isToday, isTomorrow } from "date-fns";
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { OrderFormValues, orderFormSchema } from './schema';
import { supabase } from '@/lib/supabase';

// Maximum file size: 2GB in bytes
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

export function useOrderForm(onOrderSubmit?: (data: OrderFormValues & { files: File[] }) => void) {
  const { toast } = useToast();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const values = form.getValues();
      console.log("Order submitted:", values, orderSummary, uploadedFiles);
      
      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to submit an order",
          variant: "destructive",
        });
        return;
      }
      
      // Use type assertion to properly handle Supabase typing
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignment_details')
        .insert({
          user_id: user.id,
          paper_type: values.paperType,
          subject: values.subject,
          pages: parseInt(values.pages),
          deadline: values.deadline.toISOString(),
          topic: values.topic || null,
          instructions: values.instructions || null,
          citation_style: values.citationStyle || null,
          sources: parseInt(values.sources || "0"),
          price_per_page: orderSummary.pricePerPage,
          total_price: orderSummary.totalPrice,
          discount: orderSummary.discount,
          final_price: orderSummary.finalPrice
        })
        .select()
        .single();
      
      if (assignmentError) {
        console.error("Error saving assignment:", assignmentError);
        toast({
          title: "Error saving assignment",
          description: assignmentError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          // Upload to storage bucket with user ID as folder name
          const filePath = `${user.id}/${assignmentData.id}/${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('assignment_files')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            continue;
          }
          
          // Use type assertion for assignment_files table
          await supabase.from('assignment_files').insert({
            assignment_id: assignmentData.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type
          });
        }
      }
      
      toast({
        title: "Order submitted successfully",
        description: `Your order has been received with assignment code: ${assignmentData.assignment_code}`,
      });
      
      if (onOrderSubmit) {
        onOrderSubmit({...values, files: uploadedFiles});
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Order submission failed",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    orderSummary,
    uploadedFiles,
    setUploadedFiles,
    isFormComplete,
    isLoading: isLoadingSettings || isSubmitting,
    handleFileUpload,
    handleSubmit
  };
}
