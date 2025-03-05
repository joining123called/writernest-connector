
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference_id?: string;
  payment_method?: string;
  payment_id?: string;
  payment_status?: string;
  payment_data?: any;
  payment_error?: string;
  created_at: string;
}

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
  gateway_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  config: Record<string, string>;
  created_at: string;
  updated_at: string;
}
