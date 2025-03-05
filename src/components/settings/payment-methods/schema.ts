
import * as z from 'zod';

export const paymentMethodsSchema = z.object({
  // Payment gateway enablement
  enableStripe: z.boolean().default(false),
  enablePayPal: z.boolean().default(false),
  enableSkrill: z.boolean().default(false),
  enableMpesa: z.boolean().default(false),
  enableFlutterwave: z.boolean().default(false),
  enable2Checkout: z.boolean().default(false),
  enablePaystack: z.boolean().default(false),
  enableAuthorizeNet: z.boolean().default(false),
  
  // Test mode settings
  testModeEnabled: z.boolean().default(true),
  
  // Stripe settings
  stripePublishableKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  stripeTestPublishableKey: z.string().optional(),
  stripeTestWebhookSecret: z.string().optional(),
  
  // PayPal settings
  paypalClientId: z.string().optional(),
  paypalSecret: z.string().optional(),
  paypalEnvironment: z.enum(["sandbox", "production"]).default("sandbox"),
  paypalTestClientId: z.string().optional(),
  paypalTestSecret: z.string().optional(),
  
  // Skrill settings
  skrillMerchantId: z.string().optional(),
  skrillSecretWord: z.string().optional(),
  skrillTestMerchantId: z.string().optional(),
  skrillTestSecretWord: z.string().optional(),
  
  // M-Pesa settings
  mpesaConsumerKey: z.string().optional(),
  mpesaConsumerSecret: z.string().optional(),
  mpesaPasskey: z.string().optional(),
  mpesaShortcode: z.string().optional(),
  mpesaTestConsumerKey: z.string().optional(),
  mpesaTestConsumerSecret: z.string().optional(),
  mpesaTestPasskey: z.string().optional(),
  mpesaTestShortcode: z.string().optional(),
  
  // Flutterwave settings
  flutterwavePublicKey: z.string().optional(),
  flutterwaveSecretKey: z.string().optional(),
  flutterwaveTestPublicKey: z.string().optional(),
  flutterwaveTestSecretKey: z.string().optional(),
  
  // 2Checkout settings
  twoCheckoutSellerId: z.string().optional(),
  twoCheckoutPublishableKey: z.string().optional(),
  twoCheckoutPrivateKey: z.string().optional(),
  twoCheckoutTestSellerId: z.string().optional(),
  twoCheckoutTestPublishableKey: z.string().optional(),
  twoCheckoutTestPrivateKey: z.string().optional(),
  
  // Paystack settings
  paystackPublicKey: z.string().optional(),
  paystackSecretKey: z.string().optional(),
  paystackTestPublicKey: z.string().optional(),
  paystackTestSecretKey: z.string().optional(),
  
  // Authorize.net settings
  authorizeNetApiLoginId: z.string().optional(),
  authorizeNetTransactionKey: z.string().optional(),
  authorizeNetEnvironment: z.enum(["sandbox", "production"]).default("sandbox"),
  authorizeNetTestApiLoginId: z.string().optional(),
  authorizeNetTestTransactionKey: z.string().optional(),
});

export type PaymentMethodsSchema = z.infer<typeof paymentMethodsSchema>;
