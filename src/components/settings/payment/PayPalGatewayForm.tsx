import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePaymentGateways } from '@/hooks/use-payment-gateways';
import { PaymentGateway } from '@/types/payment';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const paypalFormSchema = z.object({
  is_enabled: z.boolean(),
  is_test_mode: z.boolean(),
  config: z.object({
    client_id: z.string().min(1, 'Client ID is required'),
    client_secret: z.string().min(1, 'Client Secret is required'),
    webhook_url: z.string().optional(),
  }),
});

type PayPalFormValues = z.infer<typeof paypalFormSchema>;

interface PayPalGatewayFormProps {
  gateway: PaymentGateway;
}

export function PayPalGatewayForm({ gateway }: PayPalGatewayFormProps) {
  const { updateGateway, isPending } = usePaymentGateways();

  const form = useForm<PayPalFormValues>({
    resolver: zodResolver(paypalFormSchema),
    defaultValues: {
      is_enabled: gateway.is_enabled,
      is_test_mode: gateway.is_test_mode,
      config: {
        client_id: gateway.config.client_id || '',
        client_secret: gateway.config.client_secret || '',
        webhook_url: gateway.config.webhook_url || '',
      },
    },
  });

  function onSubmit(data: PayPalFormValues) {
    updateGateway({
      id: gateway.id,
      is_enabled: data.is_enabled,
      is_test_mode: data.is_test_mode,
      config: data.config,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            To integrate PayPal, you need to create a PayPal Developer account and generate API credentials.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">PayPal Integration</h3>
              <p className="text-sm text-muted-foreground">
                Enable or disable PayPal as a payment method.
              </p>
            </div>
            <FormField
              control={form.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      {field.value ? 'PayPal is enabled' : 'PayPal is disabled'}
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

          <FormField
            control={form.control}
            name="is_test_mode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Test Mode</FormLabel>
                  <FormDescription>
                    {field.value ? 'Using PayPal Sandbox' : 'Using PayPal Live Environment'}
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

          <div className="space-y-4">
            <h4 className="text-base font-medium">API Credentials</h4>
            <p className="text-sm text-muted-foreground">
              Enter your PayPal API credentials. You can find these in your PayPal Developer Dashboard.
            </p>

            <FormField
              control={form.control}
              name="config.client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="PayPal Client ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="PayPal Client Secret" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="PayPal Webhook URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    You'll need to configure this URL in your PayPal Developer Dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save PayPal Settings
        </Button>
      </form>
    </Form>
  );
}
