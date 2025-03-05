
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { PlatformSetting } from './types';

export const useUpdateSettings = (isAdmin: boolean) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: PlatformSetting) => {
      if (!isAdmin) {
        throw new Error('Only administrators can update platform settings');
      }

      // Important: Make sure the value is never null or undefined
      // If it is, replace with an empty string or appropriate default
      const safeValue = value === null || value === undefined ? 
        (typeof value === 'string' ? "" : {}) : value;

      // Check if setting exists
      const { data: existingData } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existingData) {
        // Update existing setting
        const { error } = await supabase
          .from('platform_settings')
          .update({ 
            value: safeValue, 
            updated_at: new Date().toISOString() 
          })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key, value: safeValue });

        if (error) throw error;
      }

      return { key, value: safeValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: "Setting updated",
        description: `${data.key} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update setting",
        description: error.message || "There was an error updating the setting.",
        variant: "destructive",
      });
    }
  });

  // Function to update multiple settings at once
  const updateSettings = async (newSettings: Record<string, any>) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only administrators can update platform settings.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Sanitize the settings object to ensure no null values
      const sanitizedSettings = Object.entries(newSettings).reduce((acc, [key, value]) => {
        // If the value is null or undefined, don't include it in the update
        // This prevents null value constraint violations
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Only proceed if there are settings to update
      if (Object.keys(sanitizedSettings).length === 0) {
        toast({
          title: "No changes to update",
          description: "No valid settings to update were provided.",
        });
        return true; // Return true as there was no error
      }

      // Update each setting in sequence
      for (const [key, value] of Object.entries(sanitizedSettings)) {
        await updateSettingMutation.mutateAsync({ key, value });
      }
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      return false;
    }
  };

  return {
    updateSettingMutation,
    updateSettings
  };
};
