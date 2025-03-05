
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsSchema } from './schema';
import { currencies } from '@/types/currency';

interface DisplaySettingsTabProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
}

export function DisplaySettingsTab({ form }: DisplaySettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>
          Configure how prices and the order form are displayed to clients
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
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="perPage" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Show per-page price (e.g. $15.99 × 5 pages)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="total" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Show total price only (e.g. $79.95)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
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
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="right" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Right sidebar (on desktop)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="bottom" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Below form (stacked layout)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-2">Currency Settings</h3>
          
          <FormField
            control={form.control}
            name="defaultCurrency"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Default Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This is the default currency shown to new clients
                </FormDescription>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="showCurrencySelector"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Allow Currency Selection</FormLabel>
                  <FormDescription>
                    When enabled, clients can choose their preferred currency
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
        </div>
      </CardContent>
    </Card>
  );
}
