
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormSettingsSchema } from './schema';

interface FieldsSettingsTabProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
}

export function FieldsSettingsTab({ form }: FieldsSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Fields Configuration</CardTitle>
        <CardDescription>
          Choose which fields to show on the order form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleField 
          form={form} 
          name="showSubjectFields" 
          label="Subject/Topic Fields" 
          description="Allow clients to specify subject area and topic" 
        />
        
        <ToggleField 
          form={form} 
          name="showPageCount" 
          label="Page Count" 
          description="Allow clients to select number of pages" 
        />
        
        <ToggleField 
          form={form} 
          name="showWordCount" 
          label="Word Count" 
          description="Display estimated word count based on pages" 
        />
        
        <ToggleField 
          form={form} 
          name="showDeadlineOptions" 
          label="Deadline Options" 
          description="Allow clients to select delivery timeframe" 
        />
        
        <ToggleField 
          form={form} 
          name="showCitationStyles" 
          label="Citation Styles" 
          description="Allow clients to select citation style (APA, MLA, etc.)" 
        />
        
        <ToggleField 
          form={form} 
          name="showInstructions" 
          label="Instructions Field" 
          description="Allow clients to provide detailed instructions" 
        />
        
        <ToggleField 
          form={form} 
          name="showPaperType" 
          label="Paper Type" 
          description="Allow clients to select document type (essay, research paper, etc.)" 
        />
        
        <ToggleField 
          form={form} 
          name="showSources" 
          label="Number of Sources" 
          description="Allow clients to specify how many sources are required" 
        />
      </CardContent>
    </Card>
  );
}

interface ToggleFieldProps {
  form: UseFormReturn<OrderFormSettingsSchema>;
  name: keyof OrderFormSettingsSchema;
  label: string;
  description: string;
}

function ToggleField({ form, name, label, description }: ToggleFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
