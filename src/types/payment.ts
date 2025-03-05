
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
}

export interface PaymentGateway {
  id: string;
  gateway_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  config: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayFormValues {
  is_enabled: boolean;
  is_test_mode: boolean;
  config: Record<string, string>;
}

export interface Transaction {
  id: string;
  order_id: string;
  user_id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'canceled';

// Payment processor integration types
export interface PaymentProcessorConfig {
  gatewayName: string;
  apiCredentials: Record<string, string>;
  isTestMode: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  gatewayResponse?: Record<string, any>;
}
