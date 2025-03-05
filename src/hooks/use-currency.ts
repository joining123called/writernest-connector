
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { currencies, exchangeRates, Currency } from '@/types/currency';
import { useOrderFormSettings } from './use-order-form-settings';

export function useCurrency() {
  const { settings } = useOrderFormSettings();
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage<string>(
    'selectedCurrency', 
    settings.defaultCurrency || 'USD'
  );

  const [currencyData, setCurrencyData] = useState<Currency>(
    currencies.find(c => c.code === selectedCurrency) || currencies[0]
  );

  useEffect(() => {
    const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0];
    setCurrencyData(currency);
  }, [selectedCurrency]);

  const convertPrice = (amountInUSD: number): number => {
    const rate = exchangeRates[selectedCurrency] || 1;
    return amountInUSD * rate;
  };

  const formatPrice = (amount: number): string => {
    // If JPY or similar currencies without decimals
    if (selectedCurrency === 'JPY' || selectedCurrency === 'KRW') {
      return `${currencyData.symbol}${Math.round(amount)}`;
    }
    
    return `${currencyData.symbol}${amount.toFixed(2)}`;
  };
  
  return {
    currency: currencyData,
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    convertPrice,
    formatPrice
  };
}
