
export interface PayPalGatewayConfig {
  id: string;
  name: string;
  gateway_name?: string;
  is_active: boolean;
  is_enabled?: boolean;
  is_sandbox: boolean;
  is_test_mode?: boolean;
  config: {
    client_id: string;
    client_secret: string;
    webhook_id?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// Add PayPal button types
declare global {
  interface Window {
    paypal: {
      Buttons: (config: any) => {
        render: (container: HTMLElement) => void;
      };
    };
  }
}

// No need for CaptureOrderResponse, removing it
