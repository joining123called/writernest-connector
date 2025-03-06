
import { supabase } from '@/lib/supabase';
import { PlatformSettings, defaultSettings, PlatformSetting } from './types';

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*');

  if (error) {
    console.error('Error fetching platform settings:', error.message);
    throw error;
  }

  const settingsObject = data.reduce((acc: Partial<PlatformSettings>, setting) => {
    const key = setting.key as keyof PlatformSettings;
    
    if (key in defaultSettings || typeof key === 'string') {
      const expectedType = typeof defaultSettings[key as keyof typeof defaultSettings];
      const value = setting.value;
      
      if (value === null) {
        acc[key] = null;
      } else if (expectedType === 'string') {
        // Convert to string regardless of the source type
        acc[key] = String(value);
      } else if (expectedType === 'boolean') {
        // Convert to boolean regardless of the source type
        acc[key] = Boolean(value);
      } else {
        // For any other type, attempt sensible conversion based on source type
        if (typeof value === 'number') {
          acc[key] = String(value);
        } else if (Array.isArray(value)) {
          // Since our index signature only accepts string | boolean | null | undefined,
          // we need to convert arrays to strings
          acc[key] = JSON.stringify(value);
        } else if (typeof value === 'object' && value !== null) {
          // Convert objects to strings as well
          acc[key] = JSON.stringify(value);
        } else {
          acc[key] = String(value);
        }
      }
    }
    
    return acc;
  }, {});

  return {
    ...defaultSettings,
    ...settingsObject
  };
}

export async function updatePlatformSetting({ key, value }: PlatformSetting) {
  const safeValue = value === null || value === undefined ? 
    (typeof value === 'string' ? "" : (typeof value === 'boolean' ? false : {})) : value;

  console.log(`Updating setting: ${key} with value:`, safeValue);

  const { data: existingData } = await supabase
    .from('platform_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existingData) {
    const { error } = await supabase
      .from('platform_settings')
      .update({ 
        value: safeValue, 
        updated_at: new Date().toISOString() 
      })
      .eq('key', key);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('platform_settings')
      .insert({ key, value: safeValue });

    if (error) throw error;
  }

  return { key, value: safeValue };
}

export async function uploadPlatformFile(file: File, type: 'logo' | 'favicon'): Promise<string | null> {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${type}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('platform-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('platform-assets')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
