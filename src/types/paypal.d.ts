
declare global {
  interface Window {
    paypal: any;
  }
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  payment_source: any;
  purchase_units: any[];
  payer: any;
  links: any[];
  [key: string]: any;
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  links: any[];
  [key: string]: any;
}

export interface PayPalGatewayConfig {
  id?: string;
  name?: string;
  gateway_name?: string;
  is_active?: boolean;
  is_enabled?: boolean;
  is_sandbox?: boolean;
  is_test_mode?: boolean;
  config: {
    client_id: string;
    client_secret: string;
    webhook_id?: string;
    [key: string]: string | undefined;
  };
  created_at?: string;
  updated_at?: string;
}
