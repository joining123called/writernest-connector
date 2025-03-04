
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, XCircle } from 'lucide-react';

// Define schema for form validation
const formSchema = z.object({
  platformName: z.string().min(2, { message: "Platform name must be at least 2 characters." }),
  defaultLanguage: z.string(),
  timezone: z.string(),
});

// List of common languages
const languages = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' },
  { id: 'zh', name: 'Chinese' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ar', name: 'Arabic' },
  { id: 'ru', name: 'Russian' },
  { id: 'pt', name: 'Portuguese' },
  { id: 'hi', name: 'Hindi' },
];

// List of common timezones
const timezones = [
  { id: 'UTC', name: 'UTC (Coordinated Universal Time)' },
  { id: 'America/New_York', name: 'Eastern Time (US & Canada)' },
  { id: 'America/Chicago', name: 'Central Time (US & Canada)' },
  { id: 'America/Denver', name: 'Mountain Time (US & Canada)' },
  { id: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)' },
  { id: 'Europe/London', name: 'London' },
  { id: 'Europe/Paris', name: 'Paris' },
  { id: 'Asia/Tokyo', name: 'Tokyo' },
  { id: 'Asia/Shanghai', name: 'Shanghai' },
  { id: 'Australia/Sydney', name: 'Sydney' },
];

export const GeneralSettings = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platformName: "WritingService",
      defaultLanguage: "en",
      timezone: "UTC",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo image must be less than 2MB');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is an icon or image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file for the favicon');
        return;
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Favicon must be less than 1MB');
        return;
      }
      
      setFaviconFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const clearFaviconPreview = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // This would normally be an API call to save settings
      console.log('Form values:', values);
      console.log('Logo file:', logoFile);
      console.log('Favicon file:', faviconFile);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">
          Configure basic platform settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Platform Name */}
          <FormField
            control={form.control}
            name="platformName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter platform name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed throughout the application.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Logo Upload */}
          <div className="space-y-3">
            <FormLabel>Platform Logo</FormLabel>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="h-16 w-auto object-contain rounded border p-1"
                  />
                  <button
                    type="button"
                    onClick={clearLogoPreview}
                    className="absolute -top-2 -right-2 text-destructive hover:text-destructive/80 bg-background rounded-full"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-48 flex items-center justify-center border border-dashed rounded bg-muted/50">
                  <p className="text-sm text-muted-foreground">No logo uploaded</p>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </div>
            <FormDescription>
              Recommended size: 200x50 pixels. Max size: 2MB. Supported formats: PNG, JPG, SVG.
            </FormDescription>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-3">
            <FormLabel>Favicon</FormLabel>
            <div className="flex items-center gap-4">
              {faviconPreview ? (
                <div className="relative">
                  <img 
                    src={faviconPreview} 
                    alt="Favicon Preview" 
                    className="h-10 w-10 object-contain rounded border p-1"
                  />
                  <button
                    type="button"
                    onClick={clearFaviconPreview}
                    className="absolute -top-2 -right-2 text-destructive hover:text-destructive/80 bg-background rounded-full"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-10 w-10 flex items-center justify-center border border-dashed rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">None</p>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  id="favicon-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFaviconChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Favicon
                </Button>
              </div>
            </div>
            <FormDescription>
              Recommended size: 32x32 or 16x16 pixels. Max size: 1MB. Supported formats: ICO, PNG.
            </FormDescription>
          </div>

          {/* Default Language */}
          <FormField
            control={form.control}
            name="defaultLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Language</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.id} value={language.id}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The default language for new users on the platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Timezone</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.id} value={timezone.id}>
                        {timezone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The default timezone for displaying dates and times.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Server Time */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Current Server Time: {format(new Date(), 'PPpp')}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
