
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useOrderFormSettings as useOrderFormSettingsData } from '@/hooks/use-order-form-settings';
import { formSettingsSchema, type OrderFormSettingsSchema } from './schema';
import { useEffect } from 'react';

export function useOrderFormSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, isLoading } = useOrderFormSettingsData();
  
  const form = useForm<OrderFormSettingsSchema>({
    resolver: zodResolver(formSettingsSchema),
    defaultValues: {
      serviceName: '',
      serviceDescription: '',
      showSubjectFields: true,
      showPageCount: true,
      showWordCount: true,
      showDeadlineOptions: true,
      showCitationStyles: true,
      showInstructions: true,
      showPaperType: true,
      showSources: true,
      basePricePerPage: '',
      urgentDeliveryMultiplier: '',
      urgent12HoursMultiplier: '',
      urgent24HoursMultiplier: '',
      urgent48HoursMultiplier: '',
      minimumHours: '',
      standardDeliveryDays: '',
      priceDisplayMode: 'total',
      orderSummaryPosition: 'right'
    }
  });
  
  useEffect(() => {
    if (!isLoading) {
      form.reset({
        serviceName: settings.serviceName,
        serviceDescription: settings.serviceDescription,
        showSubjectFields: settings.showSubjectFields,
        showPageCount: settings.showPageCount,
        showWordCount: settings.showWordCount,
        showDeadlineOptions: settings.showDeadlineOptions,
        showCitationStyles: settings.showCitationStyles,
        showInstructions: settings.showInstructions,
        showPaperType: settings.showPaperType,
        showSources: settings.showSources,
        basePricePerPage: settings.basePricePerPage.toString(),
        urgentDeliveryMultiplier: settings.urgentDeliveryMultiplier.toString(),
        urgent12HoursMultiplier: settings.urgent12HoursMultiplier.toString(),
        urgent24HoursMultiplier: settings.urgent24HoursMultiplier.toString(),
        urgent48HoursMultiplier: settings.urgent48HoursMultiplier.toString(),
        minimumHours: settings.minimumHours.toString(),
        standardDeliveryDays: settings.standardDeliveryDays.toString(),
        priceDisplayMode: settings.priceDisplayMode,
        orderSummaryPosition: settings.orderSummaryPosition
      });
    }
  }, [isLoading, settings, form]);
  
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: OrderFormSettingsSchema) => {
      const { error } = await supabase
        .from('platform_settings')
        .upsert(
          { 
            key: 'orderFormSettings', 
            value: data,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-form-settings'] });
      toast({
        title: "Settings saved",
        description: "Order form settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message || "There was an error saving the settings.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: OrderFormSettingsSchema) => {
    saveSettingsMutation.mutate(data);
  };
  
  return {
    form,
    onSubmit,
    isLoading,
    isPending: saveSettingsMutation.isPending
  };
}
