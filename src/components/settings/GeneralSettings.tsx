import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import languages from '@/lib/languages';
import timezones from '@/lib/timezones';
import { useToast } from '@/hooks/use-toast';
import { usePlatformSettings } from '@/hooks/use-platform-settings';

const formSchema = z.object({
  siteName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  siteDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  contactEmail: z.string().email({ message: "Please enter a valid email" }),
  supportPhone: z.string().min(5, { message: "Please enter a valid phone number" }),
  defaultLanguage: z.string().min(2, { message: "Please select a language" }),
  timezone: z.string().min(2, { message: "Please select a timezone" }),
  metaDescription: z.string().min(10, { message: "Meta description must be at least 10 characters" }),
});

export function GeneralSettings() {
  const { toast } = useToast();
  const { settings, updateSettings, isLoadingSettings, uploadFile, isAdmin, initialLoad } = usePlatformSettings();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: settings.general.siteName,
      siteDescription: settings.general.siteDescription,
      contactEmail: settings.general.contactEmail,
      supportPhone: settings.general.supportPhone,
      defaultLanguage: settings.general.defaultLanguage || 'en',
      timezone: settings.general.timezone || 'UTC',
      metaDescription: settings.general.metaDescription || '',
    }
  });
  
  function onSubmit(data: z.infer<typeof formSchema>) {
    // Update general settings
    updateSettings({
      general: {
        ...settings.general,
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        supportPhone: data.supportPhone,
        defaultLanguage: data.defaultLanguage,
        timezone: data.timezone,
        metaDescription: data.metaDescription,
      }
    });
    
    toast({
      title: "Settings saved",
      description: "Your platform settings have been updated successfully."
    });
  }
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const logoUrl = await uploadFile(file);
        updateSettings({
          general: {
            ...settings.general,
            logoUrl
          }
        });
        toast({
          title: "Logo uploaded",
          description: "Your logo has been updated successfully."
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your logo.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const faviconUrl = await uploadFile(file);
        updateSettings({
          general: {
            ...settings.general,
            faviconUrl
          }
        });
        toast({
          title: "Favicon uploaded",
          description: "Your favicon has been updated successfully."
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your favicon.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure the basic settings for your platform.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>
                Basic information about your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Name</FormLabel>
                    <FormControl>
                      <Input placeholder="EssayPro" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name displayed throughout your platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Professional academic writing assistance" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How users can reach you for support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="support@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Primary contact email for your platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supportPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (800) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Phone number for customer support.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
