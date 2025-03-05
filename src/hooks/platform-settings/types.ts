
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
