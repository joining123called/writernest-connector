import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Added the import

interface AvatarUploadProps {
  user: User;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        throw storageError;
      }

      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicURL?.publicUrl) {
        throw new Error('Failed to retrieve public URL');
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', user.id);

      if (dbError) {
        throw dbError;
      }

      onAvatarUpdate(publicURL.publicUrl);

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Failed to update avatar",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
        <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
        <AvatarFallback>{user.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" onClick={handleAvatarClick} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Update Avatar
            </>
          )}
        </Button>
        {user.avatarUrl && (
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              setIsUploading(true);
              try {
                const { error: storageError } = await supabase.storage
                  .from('avatars')
                  .remove([user.avatarUrl.split('/').pop() as string]);

                if (storageError) {
                  throw storageError;
                }

                const { error: dbError } = await supabase
                  .from('profiles')
                  .update({ avatar_url: null })
                  .eq('id', user.id);

                if (dbError) {
                  throw dbError;
                }

                onAvatarUpdate(null);

                toast({
                  title: "Avatar removed",
                  description: "Your avatar has been removed successfully.",
                });
              } catch (error: any) {
                console.error("Avatar removal error:", error);
                toast({
                  title: "Failed to remove avatar",
                  description: error.message || "An unexpected error occurred.",
                  variant: "destructive",
                });
              } finally {
                setIsUploading(false);
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
