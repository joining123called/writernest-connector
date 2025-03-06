
// PayPal types
export interface PayPalGatewayConfig {
  id: string;
  name: string;
  is_active: boolean;
  is_enabled?: boolean;
  is_sandbox: boolean;
  is_test_mode?: boolean;
  config: {
    client_id: string;
    client_secret: string;
  };
}

declare global {
  interface Window {
    paypal: {
      Buttons: (config: any) => {
        render: (element: HTMLElement) => void;
      };
    };
  }
}
