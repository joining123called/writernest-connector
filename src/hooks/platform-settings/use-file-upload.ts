
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = (
  isAdmin: boolean,
  updateSettingMutation: any
) => {
  const { toast } = useToast();

  // Upload a file to Supabase storage
  const uploadFile = async (file: File, type: 'logo' | 'favicon'): Promise<string | null> => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only administrators can update platform assets.",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (!file) return null;

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('platform-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(filePath);

      // Update the setting in the database
      const settingKey = type === 'logo' ? 'logoUrl' : 'faviconUrl';
      await updateSettingMutation.mutateAsync({ 
        key: settingKey, 
        value: publicUrlData.publicUrl 
      });

      return publicUrlData.publicUrl;
    } catch (error: any) {
      toast({
        title: `Error uploading ${type}`,
        description: error.message || `An error occurred while uploading the ${type}`,
        variant: "destructive",
      });
      return null;
    }
  };

  return { uploadFile };
};
