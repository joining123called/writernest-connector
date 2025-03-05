
import React from 'react';
import { usePaymentGateways } from '@/hooks/use-payment-gateways';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PayPalGatewayForm } from './payment/PayPalGatewayForm';
import { StripeGatewayForm } from './payment/StripeGatewayForm';
import { Loader2 } from 'lucide-react';

export function PaymentGatewaySettings() {
  const { paymentGateways, isLoading } = usePaymentGateways();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paypalGateway = paymentGateways?.find(gateway => gateway.gateway_name === 'PayPal');
  const stripeGateway = paymentGateways?.find(gateway => gateway.gateway_name === 'Stripe');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payment Gateway Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your payment gateway integrations and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure and manage payment methods for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paypal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>

            <TabsContent value="paypal" className="space-y-4 pt-4">
              {paypalGateway ? (
                <PayPalGatewayForm gateway={paypalGateway} />
              ) : (
                <p>PayPal gateway configuration not found.</p>
              )}
            </TabsContent>

            <TabsContent value="stripe" className="space-y-4 pt-4">
              {stripeGateway ? (
                <StripeGatewayForm gateway={stripeGateway} />
              ) : (
                <p>Stripe gateway configuration not found.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
