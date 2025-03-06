
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues, paperTypes, subjects, citationStyles } from './schema';

interface PaperDetailsFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  settings: {
    showPaperType: boolean;
    showSubjectFields: boolean;
    showPageCount: boolean;
    showWordCount: boolean;
    showCitationStyles: boolean;
    showInstructions: boolean;
    showSources: boolean;
  };
}

export function PaperDetailsFields({ form, settings }: PaperDetailsFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.showPaperType && (
          <FormField
            control={form.control}
            name="paperType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paperTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {settings.showSubjectFields && (
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Area</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
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
      
      {settings.showSubjectFields && (
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic / Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter your paper topic or title" {...field} />
              </FormControl>
              <FormDescription>
                Enter a specific topic or leave blank if you want the writer to choose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {settings.showInstructions && (
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paper Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter detailed instructions for your paper..." 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Include any specific requirements, grading rubric, or sample material
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
