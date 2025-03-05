
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
    ...(settings || {})
  };
  
  const form = useForm<PaymentMethodsSchema>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: paymentSettings,
  });
  
  // Update form when settings change
  useEffect(() => {
    if (settings) {
      // Only update fields that exist in the settings object
      Object.keys(paymentSettings).forEach((key) => {
        if (key in settings) {
          form.setValue(key as keyof PaymentMethodsSchema, (settings as any)[key]);
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
      // Convert any undefined or null values to their default values to prevent null value errors
      const sanitizedData = Object.keys(data).reduce((acc, key) => {
        const fieldKey = key as keyof PaymentMethodsSchema;
        const value = data[fieldKey];
        
        // Replace null/undefined with default values to avoid not-null constraint violations
        if (value === null || value === undefined) {
          // Get default from schema's default values
          acc[fieldKey] = defaultPaymentSettings[fieldKey];
        } else {
          acc[fieldKey] = value;
        }
        
        return acc;
      }, {} as Record<keyof PaymentMethodsSchema, string | boolean>);
      
      // Cast the sanitized data to any to avoid type errors when passing to updateSettings
      const success = await updateSettings(sanitizedData as any);
      
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
