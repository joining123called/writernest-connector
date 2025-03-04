
import React, { useState } from 'react';
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
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import timezones from '@/lib/timezones';
import languages from '@/lib/languages';

const generalSettingsSchema = z.object({
  platformName: z.string().min(2, {
    message: "Platform name must be at least 2 characters."
  }),
  defaultLanguage: z.string(),
  timezone: z.string(),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export const GeneralSettings = () => {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isFaviconUploading, setIsFaviconUploading] = useState(false);

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platformName: "Essay Writing Service",
      defaultLanguage: "en",
      timezone: "UTC",
    },
  });

  const onSubmit = (data: GeneralSettingsValues) => {
    // In a real app, we would save these settings to the database
    console.log('Saving general settings:', data);
    
    toast({
      title: "Settings updated",
      description: "Your platform settings have been updated successfully.",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLogoUploading(true);
      
      // Here we would normally upload the file to a server
      // For now, we'll just create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
        setIsLogoUploading(false);
        
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
        setFaviconPreview(reader.result as string);
        setIsFaviconUploading(false);
        
        toast({
          title: "Favicon uploaded",
          description: "Your platform favicon has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

              <Button type="submit">Save Changes</Button>
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
                        onClick={() => setLogoPreview(null)}
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
                        onClick={() => setFaviconPreview(null)}
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
