
import { WalletSettings as WalletSettingsType } from '@/hooks/platform-settings/types';

export interface WalletSettingsProps {
  settings: WalletSettingsType | null;
  isLoading: boolean;
  isSaving: boolean;
  handleInputChange: (field: keyof WalletSettingsType, value: any) => void;
  handlePayPalChange: (field: string, value: any) => void;
  handleSaveSettings: () => Promise<void>;
}

export interface PayPalConfigProps {
  clientId: string;
  clientSecret: string;
  isSandbox: boolean;
  setClientId: (value: string) => void;
  setClientSecret: (value: string) => void;
  setIsSandbox: (value: boolean) => void;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
}
