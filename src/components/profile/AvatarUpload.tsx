
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, X, User, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl: string | null;
  fullName: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatarUrl, fullName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleRemovePreview = () => {
    setFile(null);
    setPreview(avatarUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatar = async () => {
    if (!user || !file) return;

    setIsUploading(true);
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // First, check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarBucket) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's avatar URL in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Invalidate the profile query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading profile picture",
        description: error.message || "An error occurred while uploading your profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          {preview ? (
            <div className="h-full w-full overflow-hidden rounded-full">
              <img 
                src={preview} 
                alt={fullName} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <AvatarFallback className="text-3xl bg-primary/10">
              {getInitials(fullName)}
            </AvatarFallback>
          )}
        </Avatar>
        
        {file && (
          <button
            onClick={handleRemovePreview}
            className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90 transition-colors"
            title="Remove selected image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Image
        </Button>
        
        {file && (
          <Button 
            type="button" 
            size="sm"
            onClick={uploadAvatar}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG. Max size: 2MB
      </p>
    </div>
  );
};
