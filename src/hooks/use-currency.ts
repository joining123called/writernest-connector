
import { useState, useEffect } from 'react';
import { currencies, exchangeRates, Currency } from '@/types/currency';

export function useCurrency() {
  // Always use USD
  const selectedCurrency = 'USD';
  
  const [currencyData, setCurrencyData] = useState<Currency>(
    currencies.find(c => c.code === selectedCurrency) || currencies[0]
  );

  useEffect(() => {
    const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0];
    setCurrencyData(currency);
  }, []);

  const convertPrice = (amountInUSD: number): number => {
    // No conversion needed since we only use USD
    return amountInUSD;
  };

  const formatPrice = (amount: number): string => {
    // USD formatting
    return `${currencyData.symbol}${amount.toFixed(2)}`;
  };
  
  return {
    currency: currencyData,
    selectedCurrency,
    currencies,
    convertPrice,
    formatPrice
  };
}
