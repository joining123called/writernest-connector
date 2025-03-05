
import { usePlatformSettings } from '@/hooks/use-platform-settings';
import React from 'react';

export type PaymentMethod = {
  id: string;
  name: string;
  isEnabled: boolean;
  logo: string;
  description: string;
  component?: React.ComponentType<any>;
};

export function usePaymentMethods() {
  const { settings, isLoadingSettings } = usePlatformSettings();
  
  // Define all available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      isEnabled: Boolean(settings && (settings as any).enableStripe),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/stripe.svg",
      description: 'Pay securely with your credit or debit card via Stripe'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      isEnabled: Boolean(settings && (settings as any).enablePayPal),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paypal.svg",
      description: 'Pay with your PayPal account'
    },
    {
      id: 'skrill',
      name: 'Skrill',
      isEnabled: Boolean(settings && (settings as any).enableSkrill),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/skrill.svg",
      description: 'Pay with your Skrill digital wallet'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      isEnabled: Boolean(settings && (settings as any).enableMpesa),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO.png/320px-M-PESA_LOGO.png",
      description: 'Pay using M-Pesa mobile money service'
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      isEnabled: Boolean(settings && (settings as any).enableFlutterwave),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/flutterwave.svg",
      description: 'Pay with multiple payment options via Flutterwave'
    },
    {
      id: '2checkout',
      name: '2Checkout',
      isEnabled: Boolean(settings && (settings as any).enable2Checkout),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/2checkout.svg",
      description: 'Secure global payments with 2Checkout'
    },
    {
      id: 'paystack',
      name: 'Paystack',
      isEnabled: Boolean(settings && (settings as any).enablePaystack),
      logo: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/paystack.svg",
      description: 'Modern online and offline payments for Africa'
    },
    {
      id: 'authorizenet',
      name: 'Authorize.net',
      isEnabled: Boolean(settings && (settings as any).enableAuthorizeNet),
      logo: "https://www.authorize.net/content/dam/authorize/images/authorizenet-logo-for-header.svg",
      description: 'Secure payment processing by Authorize.net'
    }
  ];
  
  // Filter to get only enabled payment methods
  const enabledPaymentMethods = paymentMethods.filter(method => method.isEnabled);
  
  return {
    paymentMethods,
    enabledPaymentMethods,
    isLoading: isLoadingSettings,
    hasEnabledPaymentMethods: enabledPaymentMethods.length > 0
  };
}
