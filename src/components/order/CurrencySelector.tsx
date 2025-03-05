
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();
  const { settings } = useOrderFormSettings();
  
  if (!settings.showCurrencySelector) {
    return null;
  }
  
  return (
    <div className="flex items-center">
      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
