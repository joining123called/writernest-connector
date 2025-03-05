
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AssignmentDetailsSection } from './AssignmentDetailsSection';
import { PaperContentSection } from './PaperContentSection';
import { usePlatformSettings } from '@/hooks/use-platform-settings';

type OrderFormFieldsProps = {
  form: UseFormReturn<any>;
};

export function OrderFormFields({ form }: OrderFormFieldsProps) {
  const { settings } = usePlatformSettings();
  const orderFormSettings = settings.orderForm;

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AssignmentDetailsSection form={form} settings={orderFormSettings} />
      <PaperContentSection form={form} settings={orderFormSettings} />
    </motion.div>
  );
}
