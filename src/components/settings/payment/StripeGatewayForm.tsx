
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
import { Loader2, Info, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const stripeFormSchema = z.object({
  is_enabled: z.boolean(),
  is_test_mode: z.boolean(),
  config: z.object({
    publishable_key: z.string().min(1, 'Publishable Key is required'),
    secret_key: z.string().min(1, 'Secret Key is required'),
    webhook_secret: z.string().optional(),
  }),
});

type StripeFormValues = z.infer<typeof stripeFormSchema>;

interface StripeGatewayFormProps {
  gateway: PaymentGateway;
}

export function StripeGatewayForm({ gateway }: StripeGatewayFormProps) {
  const { updateGateway, isPending } = usePaymentGateways();

  const form = useForm<StripeFormValues>({
    resolver: zodResolver(stripeFormSchema),
    defaultValues: {
      is_enabled: gateway.is_enabled,
      is_test_mode: gateway.is_test_mode,
      config: {
        publishable_key: gateway.config.publishable_key || '',
        secret_key: gateway.config.secret_key || '',
        webhook_secret: gateway.config.webhook_secret || '',
      },
    },
  });

  function onSubmit(data: StripeFormValues) {
    updateGateway({
      id: gateway.id,
      ...data,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            To integrate Stripe, you need to create a Stripe account and obtain your API keys from the Stripe Dashboard.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Stripe Integration</h3>
              <p className="text-sm text-muted-foreground">
                Enable or disable Stripe as a payment method.
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
                      {field.value ? 'Stripe is enabled' : 'Stripe is disabled'}
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
                    {field.value ? 'Using Stripe Test Environment' : 'Using Stripe Live Environment'}
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
            <h4 className="text-base font-medium">API Keys</h4>
            <p className="text-sm text-muted-foreground">
              Enter your Stripe API keys. You can find these in your Stripe Dashboard.
            </p>

            <FormField
              control={form.control}
              name="config.publishable_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publishable Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Stripe Publishable Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Starts with 'pk_test_' in test mode or 'pk_live_' in production.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.secret_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Stripe Secret Key" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Starts with 'sk_test_' in test mode or 'sk_live_' in production.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.webhook_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Stripe Webhook Secret" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Used to verify webhook events from Stripe.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Alert className="bg-green-50 dark:bg-green-900/20">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Stripe integration complies with PCI-DSS standards when implemented correctly. Your customers' card details are handled securely by Stripe.
          </AlertDescription>
        </Alert>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Stripe Settings
        </Button>
      </form>
    </Form>
  );
}
