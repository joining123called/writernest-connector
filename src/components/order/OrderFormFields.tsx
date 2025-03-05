
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AssignmentDetailsSection } from './AssignmentDetailsSection';
import { PaperContentSection } from './PaperContentSection';

type OrderFormFieldsProps = {
  form: UseFormReturn<any>;
};

export function OrderFormFields({ form }: OrderFormFieldsProps) {
  return (
    <div className="space-y-8">
      <AssignmentDetailsSection form={form} />
      <PaperContentSection form={form} />
    </div>
  );
}
