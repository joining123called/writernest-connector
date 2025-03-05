
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { GeneralSettingsTab } from './order-form/GeneralSettingsTab';
import { FieldsSettingsTab } from './order-form/FieldsSettingsTab';
import { PricingSettingsTab } from './order-form/PricingSettingsTab';
import { DisplaySettingsTab } from './order-form/DisplaySettingsTab';
import { useOrderFormSettings } from './order-form/useOrderFormSettings';

export function OrderFormSettings() {
  const { form, onSubmit, isLoading, isPending } = useOrderFormSettings();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
              <GeneralSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4 pt-4">
              <FieldsSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4 pt-4">
              <PricingSettingsTab form={form} />
            </TabsContent>
            
            <TabsContent value="display" className="space-y-4 pt-4">
              <DisplaySettingsTab form={form} />
            </TabsContent>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
