
import { Json } from '@/types/supabase';

export interface PlatformSetting {
  key: string;
  value: any;
}

export interface PlatformSettings {
  platformName: string;
  defaultLanguage: string;
  timezone: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaDescription: string;
  [key: string]: string | boolean | null | undefined;
}

export const defaultSettings: PlatformSettings = {
  platformName: "Essay Writing Service",
  defaultLanguage: "en",
  timezone: "UTC",
  logoUrl: null,
  faviconUrl: null,
  metaDescription: "Lovable Generated Project"
};

export interface WalletSettings {
  id: string;
  min_deposit_amount: number;
  max_deposit_amount: number;
  allow_withdrawals: boolean;
  withdrawal_fee_percentage: number;
  enable_wallet_system: boolean;
  payment_methods: {
    paypal: {
      enabled: boolean;
      client_id?: string;
      client_secret?: string;
      webhook_id?: string;
    };
  };
  [key: string]: string | number | boolean | { [key: string]: any } | undefined;
}

export const defaultWalletSettings: WalletSettings = {
  id: 'wallet_settings',
  min_deposit_amount: 5,
  max_deposit_amount: 1000,
  allow_withdrawals: true,
  withdrawal_fee_percentage: 2.5,
  enable_wallet_system: true,
  payment_methods: {
    paypal: {
      enabled: true,
      client_id: '',
      client_secret: '',
      webhook_id: ''
    }
  }
};

export interface PaymentGateway {
  id: string;
  name: string;
  is_active: boolean;
  is_sandbox: boolean;
  config: {
    client_id: string;
    client_secret: string;
    webhook_id?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}
