
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
}
