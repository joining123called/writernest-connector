
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { paymentMethodsSchema, PaymentMethodsSchema } from "./schema";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { useToast } from "@/hooks/use-toast";

// Default payment method settings
const defaultPaymentSettings: PaymentMethodsSchema = {
  enableStripe: false,
  enablePayPal: false,
  enableSkrill: false,
  enableMpesa: false,
  enableFlutterwave: false,
  enable2Checkout: false,
  enablePaystack: false,
  enableAuthorizeNet: false,
  paypalEnvironment: "sandbox",
  authorizeNetEnvironment: "sandbox"
};

export const usePaymentMethodsSettings = () => {
  const { toast } = useToast();
  const { settings, updateSettings, isAdmin } = usePlatformSettings();
  
  // Extract payment settings from platform settings
  const paymentSettings: PaymentMethodsSchema = {
    ...defaultPaymentSettings,
    ...(settings ? 
      Object.entries(settings)
        .filter(([key]) => key in defaultPaymentSettings)
        .reduce((acc, [key, value]) => {
          // Safely cast key to a valid key of PaymentMethodsSchema
          const paymentKey = key as keyof PaymentMethodsSchema;
          
          // Only include if the key is valid for PaymentMethodsSchema
          if (paymentKey in defaultPaymentSettings) {
            // Ensure proper type casting based on the default values
            if (typeof defaultPaymentSettings[paymentKey] === 'boolean') {
              // Cast explicitly to the correct type
              (acc as any)[paymentKey] = Boolean(value);
            } else if (typeof defaultPaymentSettings[paymentKey] === 'string') {
              // Cast explicitly to the correct type
              (acc as any)[paymentKey] = String(value);
            }
            // Add more conditions if there are other types in PaymentMethodsSchema
          }
          
          return acc;
        }, {} as Record<string, string | boolean>) 
      : {})
  };
  
  const form = useForm<PaymentMethodsSchema>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: paymentSettings,
  });
  
  // Update form when settings change
  useEffect(() => {
    if (settings) {
      // Only update fields that exist in the settings object
      Object.keys(paymentMethodsSchema.shape).forEach((key) => {
        if (key in settings) {
          const value = settings[key as keyof typeof settings];
          // Only set the value if it's defined or it's a boolean (including false)
          if (value !== undefined || typeof value === 'boolean') {
            form.setValue(key as keyof PaymentMethodsSchema, value as any);
          }
        }
      });
    }
  }, [settings, form]);
  
  const onSubmit = async (data: PaymentMethodsSchema) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only administrators can update payment settings.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Submitting payment settings:", data);
      
      // Ensure boolean fields are properly handled
      const processedData = Object.keys(data).reduce((acc, key) => {
        const fieldKey = key as keyof PaymentMethodsSchema;
        const value = data[fieldKey];
        
        // Convert undefined to default values for boolean fields
        if (typeof defaultPaymentSettings[fieldKey] === 'boolean') {
          // Use type assertion to avoid TypeScript errors
          (acc as any)[fieldKey] = value === undefined ? false : Boolean(value);
        } else {
          // Handle non-boolean fields
          if (value === undefined || value === null) {
            (acc as any)[fieldKey] = defaultPaymentSettings[fieldKey];
          } else if (typeof defaultPaymentSettings[fieldKey] === 'string') {
            (acc as any)[fieldKey] = String(value);
          } else {
            (acc as any)[fieldKey] = value;
          }
        }
        
        return acc;
      }, {} as Record<string, string | boolean>);
      
      console.log("Processed payment settings for update:", processedData);
      
      const success = await updateSettings(processedData);
      
      if (success) {
        toast({
          title: "Payment settings updated",
          description: "Your payment gateway settings have been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to update payment settings:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your payment settings.",
        variant: "destructive",
      });
    }
  };
  
  return {
    form,
    onSubmit,
    isAdmin
  };
};
