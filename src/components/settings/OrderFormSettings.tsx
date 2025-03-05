
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { paperTypes, subjects } from '../order/PriceCalculator';

// Import the tab components
import { GeneralSettingsTab } from './tabs/GeneralSettingsTab';
import { FieldsSettingsTab } from './tabs/FieldsSettingsTab';
import { PricingSettingsTab } from './tabs/PricingSettingsTab';
import { DisplaySettingsTab } from './tabs/DisplaySettingsTab';

const formSettingsSchema = z.object({
  // General settings
  serviceName: z.string().min(2, { message: "Service name must be at least 2 characters" }),
  serviceDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  
  // Fields settings
  showSubjectFields: z.boolean().default(true),
  showPageCount: z.boolean().default(true),
  showWordCount: z.boolean().default(true),
  showDeadlineOptions: z.boolean().default(true),
  showCitationStyles: z.boolean().default(true),
  showInstructions: z.boolean().default(true),
  
  // Pricing settings
  basePricePerPage: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid price" }),
  urgentDeliveryMultiplier: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Must be a valid multiplier" }),
  
  // Deadline options
  minimumHours: z.string().min(1, { message: "Required" }),
  standardDeliveryDays: z.string().min(1, { message: "Required" }),
  
  // Display settings
  priceDisplayMode: z.enum(["perPage", "total"]),
  orderSummaryPosition: z.enum(["right", "bottom"]),
  
  // Paper types and subjects customization
  enabledPaperTypes: z.array(z.string()).default([]),
  enabledSubjects: z.array(z.string()).default([]),
  
  // Custom words per page
  wordsPerPage: z.string().regex(/^\d+$/, { message: "Must be a valid number" }),
});

// Export the form values type for use in tab components
export type OrderFormSettingsFormValues = z.infer<typeof formSettingsSchema>;

export function OrderFormSettings() {
  const { toast } = useToast();
  const { settings, updateSettings } = usePlatformSettings();
  
  const form = useForm<OrderFormSettingsFormValues>({
    resolver: zodResolver(formSettingsSchema),
    defaultValues: {
      serviceName: settings.orderForm.serviceName,
      serviceDescription: settings.orderForm.serviceDescription,
      showSubjectFields: settings.orderForm.showSubjectFields,
      showPageCount: settings.orderForm.showPageCount,
      showWordCount: settings.orderForm.showWordCount,
      showDeadlineOptions: settings.orderForm.showDeadlineOptions,
      showCitationStyles: settings.orderForm.showCitationStyles,
      showInstructions: settings.orderForm.showInstructions,
      basePricePerPage: settings.orderForm.basePricePerPage,
      urgentDeliveryMultiplier: settings.orderForm.urgentDeliveryMultiplier,
      minimumHours: settings.orderForm.minimumHours,
      standardDeliveryDays: settings.orderForm.standardDeliveryDays,
      priceDisplayMode: settings.orderForm.priceDisplayMode,
      orderSummaryPosition: settings.orderForm.orderSummaryPosition,
      enabledPaperTypes: settings.orderForm.enabledPaperTypes.length > 0 
        ? settings.orderForm.enabledPaperTypes 
        : paperTypes.map(type => type.value),
      enabledSubjects: settings.orderForm.enabledSubjects.length > 0 
        ? settings.orderForm.enabledSubjects 
        : subjects.map(subject => subject.value),
      wordsPerPage: settings.orderForm.wordsPerPage,
    }
  });
  
  function onSubmit(data: OrderFormSettingsFormValues) {
    console.log("Form settings updated:", data);
    
    // Save pricing settings to be used by PriceCalculator
    const pricingSettings = {
      basePricePerPage: parseFloat(data.basePricePerPage),
      urgentDeliveryMultiplier: parseFloat(data.urgentDeliveryMultiplier),
      wordsPerPage: parseInt(data.wordsPerPage),
      minimumHours: parseInt(data.minimumHours),
      standardDeliveryDays: parseInt(data.standardDeliveryDays),
    };
    
    // Save display settings to control OrderForm layout
    const displaySettings = {
      orderSummaryPosition: data.orderSummaryPosition,
      priceDisplayMode: data.priceDisplayMode,
    };
    
    // Save field visibility settings to control OrderFormFields
    const fieldSettings = {
      showSubjectFields: data.showSubjectFields,
      showPageCount: data.showPageCount,
      showWordCount: data.showWordCount,
      showDeadlineOptions: data.showDeadlineOptions,
      showCitationStyles: data.showCitationStyles,
      showInstructions: data.showInstructions,
      enabledPaperTypes: data.enabledPaperTypes,
      enabledSubjects: data.enabledSubjects,
    };
    
    // Update the platform settings
    updateSettings({
      orderForm: {
        serviceName: data.serviceName,
        serviceDescription: data.serviceDescription,
        showSubjectFields: data.showSubjectFields,
        showPageCount: data.showPageCount,
        showWordCount: data.showWordCount,
        showDeadlineOptions: data.showDeadlineOptions,
        showCitationStyles: data.showCitationStyles,
        showInstructions: data.showInstructions,
        basePricePerPage: data.basePricePerPage,
        urgentDeliveryMultiplier: data.urgentDeliveryMultiplier,
        minimumHours: data.minimumHours,
        standardDeliveryDays: data.standardDeliveryDays,
        priceDisplayMode: data.priceDisplayMode,
        orderSummaryPosition: data.orderSummaryPosition,
        enabledPaperTypes: data.enabledPaperTypes,
        enabledSubjects: data.enabledSubjects,
        wordsPerPage: data.wordsPerPage,
        pricing: pricingSettings,
        display: displaySettings,
        fields: fieldSettings,
      }
    });
    
    toast({
      title: "Settings saved",
      description: "Order form settings have been updated successfully."
    });
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Order Form Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how your order form appears and functions for clients.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fields">Form Fields</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <GeneralSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="fields">
              <FieldsSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="pricing">
              <PricingSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="display">
              <DisplaySettingsTab form={form} />
            </TabsContent>
            
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
