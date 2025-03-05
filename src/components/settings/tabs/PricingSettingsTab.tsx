
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsFormValues } from '../OrderFormSettings';

type PricingSettingsTabProps = {
  form: UseFormReturn<OrderFormSettingsFormValues>;
};

export function PricingSettingsTab({ form }: PricingSettingsTabProps) {
  return (
    <div className="space-y-4 pt-4">
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
    </div>
  );
}
