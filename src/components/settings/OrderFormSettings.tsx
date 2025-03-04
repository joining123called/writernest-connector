import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import { paperTypes, subjects, deadlines, citationStyles } from '../order/PriceCalculator';

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

export function OrderFormSettings() {
  const { toast } = useToast();
  const { settings, updateSettings } = usePlatformSettings();
  
  const form = useForm<z.infer<typeof formSettingsSchema>>({
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
  
  function onSubmit(data: z.infer<typeof formSettingsSchema>) {
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
      general: settings.general, // Preserve existing general settings
      orderForm: {
        ...data,
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
            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                  <CardDescription>
                    Basic information about your writing service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="serviceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Essay Writing Service" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed at the top of the order form.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serviceDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your service..." 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your writing service.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Form Fields Configuration</CardTitle>
                  <CardDescription>
                    Choose which fields to show on the order form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="showSubjectFields"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Subject/Topic Fields</FormLabel>
                          <FormDescription>
                            Allow clients to specify subject area and topic
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showPageCount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Page Count</FormLabel>
                          <FormDescription>
                            Allow clients to select number of pages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showWordCount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Word Count</FormLabel>
                          <FormDescription>
                            Display estimated word count based on pages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showDeadlineOptions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Deadline Options</FormLabel>
                          <FormDescription>
                            Allow clients to select delivery timeframe
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showCitationStyles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Citation Styles</FormLabel>
                          <FormDescription>
                            Allow clients to select citation style (APA, MLA, etc.)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showInstructions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Instructions Field</FormLabel>
                          <FormDescription>
                            Allow clients to provide detailed instructions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>
                    Set up your pricing structure for orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="basePricePerPage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price Per Page</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="15.99" {...field} />
                        </FormControl>
                        <FormDescription>
                          The standard price per page in USD
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="wordsPerPage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Words Per Page</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="275" {...field} />
                        </FormControl>
                        <FormDescription>
                          Define how many words count as one page
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="urgentDeliveryMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgent Delivery Price Multiplier</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="1.5" {...field} />
                        </FormControl>
                        <FormDescription>
                          Price multiplier for urgent deliveries (e.g. 1.5 = 50% increase)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minimumHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Delivery Hours</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="6" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum hours for urgent delivery option
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="standardDeliveryDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standard Delivery Days</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="7" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of days for standard delivery option
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="display" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                  <CardDescription>
                    Configure how the order form displays to clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="priceDisplayMode"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Price Display Mode</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="perPage" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Per Page (e.g. $15.99 per page)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="total" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Total Only (e.g. $79.95 total)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          How prices are displayed to clients on the form
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="orderSummaryPosition"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Order Summary Position</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="right" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Right Side of Form
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="bottom" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Below Form
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Where the order summary appears relative to the form
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
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
