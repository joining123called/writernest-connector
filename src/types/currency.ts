
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

// Default exchange rates against USD (in a real app, these would be fetched from an API)
export const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.91,
  GBP: 0.78,
  CAD: 1.35,
  AUD: 1.48,
  JPY: 149.58,
  CNY: 7.23,
  INR: 83.41,
  BRL: 5.05,
  ZAR: 18.23,
};
