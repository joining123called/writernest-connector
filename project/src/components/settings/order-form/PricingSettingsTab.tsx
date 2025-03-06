
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsSchema } from './schema';

interface PricingSettingsTabProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
}

export function PricingSettingsTab({ form }: PricingSettingsTabProps) {
  return (
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
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-2">Urgent Delivery Pricing</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set different price multipliers for various urgent delivery timeframes
          </p>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="urgent12HoursMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>12 Hours or Less</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="2.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Price multiplier for orders due within 12 hours (e.g. 2.0 = 100% increase)
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="urgent24HoursMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>24 Hours or Less</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="1.8" {...field} />
                  </FormControl>
                  <FormDescription>
                    Price multiplier for orders due within 24 hours (e.g. 1.8 = 80% increase)
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="urgent48HoursMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>48 Hours or Less</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="1.5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Price multiplier for orders due within 48 hours (e.g. 1.5 = 50% increase)
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="urgentDeliveryMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Hours Multiplier</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="1.5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Fallback multiplier for orders at minimum delivery time
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>
        
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
  );
}
