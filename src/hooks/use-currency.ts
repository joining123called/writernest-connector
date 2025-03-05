
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

  // Update selected currency when defaultCurrency setting changes
  useEffect(() => {
    if (settings.defaultCurrency && !localStorage.getItem('selectedCurrency')) {
      setSelectedCurrency(settings.defaultCurrency);
    }
  }, [settings.defaultCurrency, setSelectedCurrency]);

  const convertPrice = (amountInUSD: number): number => {
    const rate = exchangeRates[selectedCurrency] || 1;
    return amountInUSD * rate;
  };

  const formatPrice = (amount: number): string => {
    // Currency-specific formatting
    switch (selectedCurrency) {
      // Currencies with no decimal places
      case 'JPY':
      case 'KRW':
      case 'IDR':
        return `${currencyData.symbol}${Math.round(amount)}`;
      
      // Currencies where symbol follows the amount
      case 'SEK':
      case 'NOK':
      case 'DKK':
        return `${amount.toFixed(2)} ${currencyData.symbol}`;
      
      // Currencies with special spacing
      case 'EUR':
        return `${currencyData.symbol} ${amount.toFixed(2)}`;
      
      // High-value currencies that might need different formatting
      case 'IDR':
      case 'INR':
        // Format with thousands separators
        return `${currencyData.symbol}${amount.toLocaleString('en-US', { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        })}`;
      
      // Default formatting (symbol followed by amount with 2 decimal places)
      default:
        return `${currencyData.symbol}${amount.toFixed(2)}`;
    }
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
