
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Define the form schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(5, { message: 'Please enter a valid phone number' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditProps {
  profile: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ 
  profile, 
  onSuccess, 
  onCancel 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Invalidate the profile query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="US"
                  value={field.value}
                  onChange={field.onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
