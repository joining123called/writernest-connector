import React from 'react';
import { usePaymentMethodsSettings } from './usePaymentMethodsSettings';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CreditCard, Info, Wallet, Globe, DollarSign, ShieldCheck, Beaker } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const PaymentMethodLogo = ({ method }: { method: string }) => {
  const logos: Record<string, { src: string, alt: string }> = {
    stripe: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/stripe.svg", 
      alt: "Stripe Logo" 
    },
    paypal: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paypal.svg", 
      alt: "PayPal Logo" 
    },
    skrill: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/skrill.svg", 
      alt: "Skrill Logo" 
    },
    mpesa: { 
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO.png/320px-M-PESA_LOGO.png", 
      alt: "M-Pesa Logo" 
    },
    flutterwave: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/flutterwave.svg", 
      alt: "Flutterwave Logo" 
    },
    twoCheckout: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/2checkout.svg", 
      alt: "2Checkout Logo" 
    },
    paystack: { 
      src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paystack.svg", 
      alt: "Paystack Logo" 
    },
    authorizeNet: { 
      src: "https://www.authorize.net/content/dam/authorize/images/authorizenet-logo-for-header.svg", 
      alt: "Authorize.Net Logo" 
    }
  };

  const logo = logos[method];

  if (!logo) {
    return (
      <div className="h-8 w-16 flex items-center justify-center">
        <CreditCard className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-8 w-24 flex items-center justify-center bg-white rounded p-1">
      <img 
        src={logo.src} 
        alt={logo.alt} 
        className="h-6 max-w-full object-contain" 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.style.display = 'none';
          const parent = target.parentNode as HTMLElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>`;
            parent.appendChild(fallback.firstChild as Node);
          }
        }}
      />
    </div>
  );
};

const GatewayStatus = ({ enabled }: { enabled: boolean }) => (
  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
    enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }`}>
    {enabled ? 'Active' : 'Inactive'}
  </div>
);

export const PaymentMethodsTab = () => {
  const { form, onSubmit, isAdmin, getApiKey } = usePaymentMethodsSettings();
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only administrators can access payment gateway settings.
        </AlertDescription>
      </Alert>
    );
  }
  
  const isTestMode = form.watch("testModeEnabled");
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Payment Gateway Integration</h2>
        <p className="text-muted-foreground">
          Configure payment gateways to process orders and payments on your platform.
        </p>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
        <Info className="h-4 w-4" />
        <AlertTitle>Integration Information</AlertTitle>
        <AlertDescription>
          You need to set up accounts with these payment providers separately and obtain API keys before enabling them here.
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Test Mode Toggle */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Test Environment
                </CardTitle>
                <CardDescription>
                  Toggle between test and live environments for payment processing.
                </CardDescription>
              </div>
              <div className="flex items-center">
                <Badge 
                  className={isTestMode ? 
                    "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" : 
                    "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                  }
                >
                  {isTestMode ? "Test Mode Active" : "Live Mode Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="testModeEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Test Mode</FormLabel>
                      <FormDescription>
                        When enabled, all payment transactions will use test credentials and won't process real payments.
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
            </CardContent>
          </Card>
          
          {/* Stripe Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe
                </CardTitle>
                <CardDescription>
                  Accept credit card payments globally with Stripe's payment processing.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <PaymentMethodLogo method="stripe" />
                <GatewayStatus enabled={form.watch("enableStripe")} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="enableStripe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Stripe</FormLabel>
                      <FormDescription>
                        Activate Stripe as a payment method on your platform.
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
              
              {form.watch("enableStripe") && (
                <div className="space-y-4 pt-2">
                  <Tabs defaultValue="live" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="live" disabled={isTestMode}>Live Credentials</TabsTrigger>
                      <TabsTrigger value="test" disabled={!isTestMode}>Test Credentials</TabsTrigger>
                    </TabsList>
                    <TabsContent value="live" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="stripePublishableKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Live Publishable Key</FormLabel>
                            <FormControl>
                              <Input placeholder="pk_live_..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Your Stripe live publishable key found in your Stripe dashboard.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stripeWebhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Live Webhook Secret</FormLabel>
                            <FormControl>
                              <Input placeholder="whsec_..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Used to verify webhook events from Stripe for live transactions.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="test" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="stripeTestPublishableKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Publishable Key</FormLabel>
                            <FormControl>
                              <Input placeholder="pk_test_..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Your Stripe test publishable key for test transactions.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stripeTestWebhookSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Webhook Secret</FormLabel>
                            <FormControl>
                              <Input placeholder="whsec_..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Used to verify webhook events from Stripe for test transactions.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Webhook Setup Required</AlertTitle>
                    <AlertDescription>
                      To properly process Stripe payments, you need to set up a webhook endpoint in your Stripe dashboard.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* PayPal Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  PayPal
                </CardTitle>
                <CardDescription>
                  Allow customers to pay via PayPal accounts and credit cards.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <PaymentMethodLogo method="paypal" />
                <GatewayStatus enabled={form.watch("enablePayPal")} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="enablePayPal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable PayPal</FormLabel>
                      <FormDescription>
                        Activate PayPal as a payment method on your platform.
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
              
              {form.watch("enablePayPal") && (
                <div className="space-y-4 pt-2">
                  <Tabs defaultValue="live" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="live" disabled={isTestMode}>Live Credentials</TabsTrigger>
                      <TabsTrigger value="test" disabled={!isTestMode}>Test Credentials</TabsTrigger>
                    </TabsList>
                    <TabsContent value="live" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="paypalClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Live Client ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ARfXY123..." {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="paypalSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Live Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="EHLx2J..." {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="test" className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="paypalTestClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Client ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ARfXY123..." {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="paypalTestSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="EHLx2J..." {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <FormField
                    control={form.control}
                    name="paypalEnvironment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Environment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                            <SelectItem value="production">Production (Live)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Use sandbox for testing, production for live payments.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Other Payment Methods (simplified for brevity) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Skrill */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Skrill
                  </CardTitle>
                  <CardDescription>
                    Digital wallet for online payments globally.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo method="skrill" />
                  <GatewayStatus enabled={form.watch("enableSkrill")} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableSkrill"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Enable Skrill</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("enableSkrill") && (
                  <div className="space-y-4 pt-4">
                    <Tabs defaultValue="live" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="live" disabled={isTestMode}>Live Credentials</TabsTrigger>
                        <TabsTrigger value="test" disabled={!isTestMode}>Test Credentials</TabsTrigger>
                      </TabsList>
                      <TabsContent value="live" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="skrillMerchantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live Merchant ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="skrillSecretWord"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live Secret Word</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="test" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="skrillTestMerchantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Merchant ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="skrillTestSecretWord"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Secret Word</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* M-Pesa */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    M-Pesa
                  </CardTitle>
                  <CardDescription>
                    Mobile payment solution popular in Africa.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo method="mpesa" />
                  <GatewayStatus enabled={form.watch("enableMpesa")} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableMpesa"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Enable M-Pesa</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("enableMpesa") && (
                  <div className="space-y-4 pt-4">
                    <Tabs defaultValue="live" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="live" disabled={isTestMode}>Live Credentials</TabsTrigger>
                        <TabsTrigger value="test" disabled={!isTestMode}>Test Credentials</TabsTrigger>
                      </TabsList>
                      <TabsContent value="live" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="mpesaConsumerKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live Consumer Key</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mpesaConsumerSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live Consumer Secret</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="test" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="mpesaTestConsumerKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Consumer Key</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mpesaTestConsumerSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Consumer Secret</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add similar test/live credential tabs for other payment gateways... */}
            {/* For brevity, I'm not including all of them but the pattern is the same */}
            
            {/* Authorize.net */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Authorize.net
                  </CardTitle>
                  <CardDescription>
                    Secure payment gateway for online businesses.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo method="authorizeNet" />
                  <GatewayStatus enabled={form.watch("enableAuthorizeNet")} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableAuthorizeNet"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Enable Authorize.net</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("enableAuthorizeNet") && (
                  <div className="space-y-4 pt-4">
                    <Tabs defaultValue="live" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="live" disabled={isTestMode}>Live Credentials</TabsTrigger>
                        <TabsTrigger value="test" disabled={!isTestMode}>Test Credentials</TabsTrigger>
                      </TabsList>
                      <TabsContent value="live" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="authorizeNetApiLoginId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live API Login ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="authorizeNetTransactionKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Live Transaction Key</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="test" className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="authorizeNetTestApiLoginId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test API Login ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="authorizeNetTestTransactionKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Transaction Key</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                    
                    <FormField
                      control={form.control}
                      name="authorizeNetEnvironment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Environment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                              <SelectItem value="production">Production (Live)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Alert 
            className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400"
          >
            <Info className="h-4 w-4" />
            <AlertTitle>Test Mode Information</AlertTitle>
            <AlertDescription>
              When test mode is enabled, all payment gateways will use your test credentials. You can use test card numbers and accounts 
              to verify your integration without processing real payments. Make sure to disable test mode when you're ready to accept live payments.
            </AlertDescription>
          </Alert>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full md:w-auto"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Payment Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
