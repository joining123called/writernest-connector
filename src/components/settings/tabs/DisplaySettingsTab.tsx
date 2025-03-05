
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsFormValues } from '../OrderFormSettings';

type DisplaySettingsTabProps = {
  form: UseFormReturn<OrderFormSettingsFormValues>;
};

export function DisplaySettingsTab({ form }: DisplaySettingsTabProps) {
  return (
    <div className="space-y-4 pt-4">
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
                        Bottom of Form
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
    </div>
  );
}
