
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

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled"
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
}
