
import React from 'react';
import ReactPhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
  disabled = false,
  required = false,
  error = false,
  className = "",
}: PhoneInputProps) {
  return (
    <ReactPhoneInput
      international
      defaultCountry="US"
      value={value}
      onChange={onChange as any}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? 'border-destructive focus-visible:ring-destructive' : ''
      } ${className}`}
    />
  );
}
