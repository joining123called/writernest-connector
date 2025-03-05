
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues, citationStyles } from './schema';

interface CitationAndSourcesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  settings: {
    showCitationStyles: boolean;
    showSources: boolean;
  };
}

export function CitationAndSourcesFields({ form, settings }: CitationAndSourcesFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {settings.showCitationStyles && (
        <FormField
          control={form.control}
          name="citationStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Citation Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select citation style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {citationStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {settings.showSources && (
        <FormField
          control={form.control}
          name="sources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sources</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of sources" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[...Array(21)].map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i === 0 ? "No sources required" : `${i} source${i > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
