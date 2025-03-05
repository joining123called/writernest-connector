
import React from 'react';
import { usePaymentGateways } from '@/hooks/use-payment-gateways';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PayPalGatewayForm } from './payment/PayPalGatewayForm';
import { StripeGatewayForm } from './payment/StripeGatewayForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function PaymentGatewaySettings() {
  const { paymentGateways, isLoading, error } = usePaymentGateways();
  const { toast } = useToast();

  // Function to create missing payment gateway configs
  const createMissingGateways = async () => {
    try {
      // Check for PayPal
      if (!paymentGateways?.some(g => g.gateway_name === 'PayPal')) {
        await supabase.from('payment_gateways').insert({
          gateway_name: 'PayPal',
          is_enabled: false,
          is_test_mode: true,
          config: { client_id: '', client_secret: '', webhook_url: '' }
        });
      }
      
      // Check for Stripe
      if (!paymentGateways?.some(g => g.gateway_name === 'Stripe')) {
        await supabase.from('payment_gateways').insert({
          gateway_name: 'Stripe',
          is_enabled: false,
          is_test_mode: true,
          config: { publishable_key: '', secret_key: '', webhook_secret: '' }
        });
      }
      
      // Refresh the page to load the newly created gateways
      window.location.reload();
      
      toast({
        title: "Payment gateways initialized",
        description: "Default payment gateway configurations have been created.",
      });
    } catch (error) {
      console.error('Error creating payment gateways:', error);
      toast({
        title: "Error initializing gateways",
        description: "There was a problem creating the payment gateway configurations.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading payment gateways</AlertTitle>
        <AlertDescription>
          There was a problem loading the payment gateway settings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const paypalGateway = paymentGateways?.find(gateway => gateway.gateway_name === 'PayPal');
  const stripeGateway = paymentGateways?.find(gateway => gateway.gateway_name === 'Stripe');

  // If neither gateway exists, show option to initialize them
  if (!paypalGateway && !stripeGateway) {
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
              No payment gateway configurations found. Initialize default configurations to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Payment gateway configurations need to be initialized before you can accept payments.
              </AlertDescription>
            </Alert>
            
            <Button onClick={createMissingGateways}>
              Initialize Payment Gateways
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <div className="py-4 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-medium mb-2">PayPal gateway configuration not found.</p>
                  <Button onClick={createMissingGateways} variant="outline">
                    Create PayPal Configuration
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stripe" className="space-y-4 pt-4">
              {stripeGateway ? (
                <StripeGatewayForm gateway={stripeGateway} />
              ) : (
                <div className="py-4 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-medium mb-2">Stripe gateway configuration not found.</p>
                  <Button onClick={createMissingGateways} variant="outline">
                    Create Stripe Configuration
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
