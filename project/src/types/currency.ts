
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
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' }
];

// Updated exchange rates against USD (approximate as of recent data)
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
  CHF: 0.89,
  SGD: 1.34,
  NZD: 1.62,
  HKD: 7.82,
  SEK: 10.45,
  NOK: 10.55,
  DKK: 6.78,
  PLN: 3.97,
  MXN: 16.71,
  THB: 34.82,
  IDR: 15680,
  MYR: 4.39,
  PHP: 55.30,
  AED: 3.67,
  SAR: 3.75,
  RUB: 91.60,
  TRY: 32.25,
  ILS: 3.72
};
