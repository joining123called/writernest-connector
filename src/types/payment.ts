
// This file can be kept as a placeholder for future payment implementations
// Currently empty since payment functionality has been removed

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
}
