
interface PayPalButtonsComponentOptions {
  createOrder: (data: any, actions: any) => Promise<string>;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError?: (err: any) => void;
  onCancel?: (data: any) => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    height?: number;
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
  };
}

interface PayPalButtonsComponent {
  render: (container: HTMLElement) => void;
}

interface PayPalNamespace {
  Buttons: (options: PayPalButtonsComponentOptions) => PayPalButtonsComponent;
}

interface Window {
  paypal?: PayPalNamespace;
}
