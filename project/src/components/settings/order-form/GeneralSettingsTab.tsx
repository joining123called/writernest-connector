
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsSchema } from './schema';

interface GeneralSettingsTabProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
}

export function GeneralSettingsTab({ form }: GeneralSettingsTabProps) {
  return (
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
  );
}
