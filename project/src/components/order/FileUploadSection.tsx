
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface FileUploadSectionProps {
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadSection({ 
  uploadedFiles, 
  setUploadedFiles, 
  onFileUpload 
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  return (
    <div className="border-t pt-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileUpload}
        multiple
      />
      <Button 
        type="button" 
        variant="outline" 
        className="flex gap-2 mb-4"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} />
        Upload Additional Files
      </Button>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
