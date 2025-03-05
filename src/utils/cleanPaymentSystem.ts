
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export async function cleanPaymentSystem() {
  try {
    console.log("Starting payment system cleanup...");
    
    // Update platform settings to disable all payment methods
    const paymentSettings = {
      enableStripe: false,
      enablePayPal: false,
      enableSkrill: false,
      enableMpesa: false,
      enableFlutterwave: false,
      enable2Checkout: false,
      enablePaystack: false,
      enableAuthorizeNet: false,
      // Remove all API keys and credentials
      stripePublishableKey: null,
      stripeWebhookSecret: null,
      paypalClientId: null,
      paypalSecret: null,
      paypalEnvironment: "sandbox",
      skrillMerchantId: null,
      skrillSecretWord: null,
      mpesaConsumerKey: null,
      mpesaConsumerSecret: null,
      mpesaPasskey: null,
      mpesaShortcode: null,
      flutterwavePublicKey: null,
      flutterwaveSecretKey: null,
      twoCheckoutSellerId: null,
      twoCheckoutPublishableKey: null,
      twoCheckoutPrivateKey: null,
      paystackPublicKey: null,
      paystackSecretKey: null,
      authorizeNetApiLoginId: null,
      authorizeNetTransactionKey: null,
      authorizeNetEnvironment: "sandbox"
    };

    // Update each payment setting key in the database
    for (const [key, value] of Object.entries(paymentSettings)) {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ 
          key, 
          value,
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'key'
        });
      
      if (error) {
        console.error(`Error updating ${key}:`, error);
      }
    }
    
    console.log("Payment system cleanup completed successfully");
    return { success: true, message: "All payment configurations have been removed" };
  } catch (error) {
    console.error("Error during payment system cleanup:", error);
    return { success: false, message: "Failed to clean payment system" };
  }
}
