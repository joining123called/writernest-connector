
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Upload, ImageIcon, Loader2, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import timezones from '@/lib/timezones';
import languages from '@/lib/languages';
import { supabase } from '@/lib/supabase';

// Define the schema for general settings
const generalSettingsSchema = z.object({
  platformName: z.string().min(2, {
    message: "Platform name must be at least 2 characters."
  }),
  defaultLanguage: z.string(),
  timezone: z.string(),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

// This would typically come from your API or backend
const fetchSettings = async (): Promise<GeneralSettingsValues> => {
  // In a real app, we would fetch from the backend
  // For now, we're using local storage as a demo
  const savedSettings = localStorage.getItem('platformSettings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  
  return {
    platformName: "Essay Writing Service",
    defaultLanguage: "en",
    timezone: "UTC",
  };
};

// This would typically save to your API or backend
const saveSettings = async (settings: GeneralSettingsValues): Promise<void> => {
  // In a real app, we would POST to the backend
  // For now, we're using local storage as a demo
  localStorage.setItem('platformSettings', JSON.stringify(settings));
  
  // Simulate an API delay
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export const GeneralSettings = () => {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isFaviconUploading, setIsFaviconUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load saved logo and favicon on initial render
  useEffect(() => {
    const savedLogo = localStorage.getItem('platformLogo');
    const savedFavicon = localStorage.getItem('platformFavicon');
    
    if (savedLogo) setLogoPreview(savedLogo);
    if (savedFavicon) setFaviconPreview(savedFavicon);
    
    // Also load settings into the form
    const loadSettings = async () => {
      const settings = await fetchSettings();
      form.reset(settings);
      setInitialLoad(false);
    };
    
    loadSettings();
  }, []);

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platformName: "Essay Writing Service",
      defaultLanguage: "en",
      timezone: "UTC",
    },
  });

  const onSubmit = async (data: GeneralSettingsValues) => {
    setIsSubmitting(true);
    try {
      await saveSettings(data);
      
      // Update document title as an example of real-time changes
      document.title = data.platformName;
      
      toast({
        title: "Settings updated",
        description: "Your platform settings have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Failed to update settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLogoUploading(true);
      
      // Here we would normally upload the file to a server
      // For now, we'll just create a preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setIsLogoUploading(false);
        
        // Save to localStorage for demo purposes
        localStorage.setItem('platformLogo', result);
        
        // Also update favicon in browser (demo effect)
        if (result) {
          const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (link) link.href = result;
        }
        
        toast({
          title: "Logo uploaded",
          description: "Your platform logo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsFaviconUploading(true);
      
      // Here we would normally upload the file to a server
      // For now, we'll just create a preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFaviconPreview(result);
        setIsFaviconUploading(false);
        
        // Save to localStorage for demo purposes
        localStorage.setItem('platformFavicon', result);
        
        // Actually update favicon in browser (demo effect)
        if (result) {
          const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (link) link.href = result;
        }
        
        toast({
          title: "Favicon uploaded",
          description: "Your platform favicon has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('platformLogo');
    toast({
      title: "Logo removed",
      description: "Your platform logo has been removed.",
    });
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview(null);
    localStorage.removeItem('platformFavicon');
    toast({
      title: "Favicon removed",
      description: "Your platform favicon has been removed.",
    });
  };

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic settings for your platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      This is the name that will appear throughout the platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default language for the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default timezone for the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo & Favicon</CardTitle>
          <CardDescription>
            Upload your platform logo and favicon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logo" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="favicon">Favicon</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logo" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="border rounded-md h-28 w-28 flex items-center justify-center bg-muted/30">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Platform Logo Preview" 
                      className="max-h-full max-w-full p-2" 
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo-upload" className="block">Upload Logo</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={isLogoUploading}
                      className="relative"
                    >
                      {isLogoUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </>
                      )}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </Button>
                    {logoPreview && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveLogo}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 200x200px. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="favicon" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="border rounded-md h-16 w-16 flex items-center justify-center bg-muted/30">
                  {faviconPreview ? (
                    <img 
                      src={faviconPreview} 
                      alt="Platform Favicon Preview" 
                      className="max-h-full max-w-full p-1" 
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon-upload" className="block">Upload Favicon</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      disabled={isFaviconUploading}
                    >
                      {isFaviconUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </>
                      )}
                      <input
                        id="favicon-upload"
                        type="file"
                        accept="image/x-icon,image/png,image/svg+xml"
                        className="hidden"
                        onChange={handleFaviconUpload}
                      />
                    </Button>
                    {faviconPreview && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveFavicon}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 32x32px. Max file size: 1MB. Accepted formats: .ico, .png, .svg
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            These images will be used throughout the platform and in browser tabs.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
