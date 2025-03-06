
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Calendar, LockKeyhole } from 'lucide-react';

const creditCardSchema = z.object({
  cardNumber: z.string().min(15).max(19),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Must be in MM/YY format"),
  cvv: z.string().min(3).max(4).regex(/^[0-9]+$/, "CVV must contain only numbers")
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  onDataChange: (data: any) => void;
}

export function CreditCardForm({ onDataChange }: CreditCardFormProps) {
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
    }
  });
  
  // Format card number as user types
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date as user types
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2)}`;
    }
    
    return value;
  };
  
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onDataChange({
        type: 'card',
        data: value
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Card Number</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expiry Date</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/YY"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <LockKeyhole className="h-4 w-4" />
                      <span>CVV</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} maxLength={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p className="flex items-center gap-1">
                <LockKeyhole className="h-3 w-3" />
                Your payment information is encrypted and secure
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
