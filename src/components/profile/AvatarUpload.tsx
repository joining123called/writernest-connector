
import React, { useState } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload, Trash2, Camera, Image } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AvatarUploadProps {
  user: User;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ user }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { fetchCurrentUser } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, GIF, or WebP image',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path for the user's avatar
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's avatar URL in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refetch user to update context with new avatar
      await fetchCurrentUser();

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading your avatar',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!user.avatarUrl) return;

    setIsDeleting(true);

    try {
      // Delete the avatar from profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refetch user to update context
      await fetchCurrentUser();

      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed',
      });
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Remove failed',
        description: error.message || 'An error occurred while removing your avatar',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Profile Picture</CardTitle>
        <CardDescription>
          Update your profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          <div className="flex-shrink-0 relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl transition-all duration-300 group-hover:shadow-2xl">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
              <label htmlFor="avatar-upload" className="cursor-pointer p-2 rounded-full bg-background/80 hover:bg-background transition-colors">
                <Camera className="h-6 w-6 text-primary" />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="sr-only"
                  onChange={uploadAvatar}
                  disabled={isUploading || isDeleting}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col space-y-4 w-full max-w-md">
            <div className="bg-muted/40 rounded-xl p-4">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Image className="h-4 w-4 mr-2 text-primary" />
                Avatar Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Recommended size: 400x400 pixels</li>
                <li>Maximum file size: 2MB</li>
                <li>Accepted formats: JPEG, PNG, GIF, WEBP</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="file"
                  id="avatar-upload-btn"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={uploadAvatar}
                  disabled={isUploading || isDeleting}
                />
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  disabled={isUploading || isDeleting}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload new picture'}
                </Button>
              </div>

              {user.avatarUrl && (
                <Button
                  variant="destructive"
                  onClick={deleteAvatar}
                  disabled={isUploading || isDeleting}
                  className="justify-center"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {isDeleting ? 'Removing...' : 'Remove picture'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};
