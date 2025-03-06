
import { Currency } from './currency';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto'
}

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  MANUAL = 'manual'
}

export interface PaymentGatewayConfig {
  id: PaymentGateway;
  name: string;
  enabled: boolean;
  testMode: boolean;
  credentials: {
    [key: string]: string;
  };
}

export interface PaymentGatewayCredentials {
  [PaymentGateway.STRIPE]: {
    publishableKey: string;
    secretKey: string;
  };
  [PaymentGateway.PAYPAL]: {
    clientId: string;
    clientSecret: string;
  };
  [PaymentGateway.MANUAL]: Record<string, never>;
}

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: string;
  enabled: boolean;
  gateway: PaymentGateway;
  surcharge?: number; // Percentage surcharge for using this method
  description?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  transactionId?: string; // External transaction ID from payment gateway
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: Currency['code'];
  status: PaymentStatus;
  clientSecret?: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentProcessor {
  createPaymentIntent(amount: number, currency: Currency['code'], metadata?: any): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<Transaction>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  processRefund(transactionId: string, amount?: number): Promise<boolean>;
}
