
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsSchema } from './schema';

interface DisplaySettingsTabProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
}

export function DisplaySettingsTab({ form }: DisplaySettingsTabProps) {
  return (
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
                  value={field.value}
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
                  value={field.value}
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
  );
}
