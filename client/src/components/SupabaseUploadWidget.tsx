import React, { useRef, useState } from 'react';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';
import { uploadMultipleFiles, validateFile, STORAGE_BUCKETS, type SupabaseUploadResult } from '../lib/supabaseStorage';

// Re-export the type for convenience
export type { SupabaseUploadResult } from '../lib/supabaseStorage';

interface SupabaseUploadWidgetProps {
  onUpload: (results: SupabaseUploadResult[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  bucket?: string;
  path?: string;
  children?: React.ReactNode;
  maxSizeMB?: number;
  validateFile?: (file: File) => { valid: boolean; error?: string };
}

export const SupabaseUploadWidget: React.FC<SupabaseUploadWidgetProps> = ({
  onUpload,
  onError,
  disabled = false,
  maxFiles = 5,
  bucket = STORAGE_BUCKETS.REVIEW_PHOTOS,
  path,
  children,
  maxSizeMB = 10,
  validateFile: customValidateFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles);
    
    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file, index) => {
      const validation = customValidateFile 
        ? customValidateFile(file)
        : validateFile(file, maxSizeMB);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      onError?.(`File validation failed: ${validationErrors.join(', ')}`);
      return;
    }

    if (validFiles.length === 0) {
      onError?.('No valid files selected');
      return;
    }

    setUploading(true);

    try {
      console.log(`Starting upload of ${validFiles.length} files to Supabase...`);
      
      const results = await uploadMultipleFiles(
        validFiles, 
        bucket, 
        path,
        (completed, total) => {
          console.log(`Upload progress: ${completed}/${total} files completed`);
        }
      );
      
      if (results.length > 0) {
        console.log(`✅ Successfully uploaded ${results.length} files`);
        onUpload(results);
      } else {
        onError?.('No files were uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Provide more specific error messages
      if (errorMessage.includes('timeout')) {
        onError?.('Upload timed out. Please check your internet connection and try again.');
      } else if (errorMessage.includes('policy')) {
        onError?.('Upload permission denied. Please contact support if this persists.');
      } else if (errorMessage.includes('bucket')) {
        onError?.('Storage configuration error. Please contact support.');
      } else {
        onError?.(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (children) {
    return (
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {children}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Upload className="w-8 h-8 text-blue-500 animate-pulse" />
              <div className="text-sm text-gray-600">
                <div>Uploading images...</div>
                <div className="text-xs text-gray-500 mt-1">Please wait</div>
              </div>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <div className="font-medium">Click to upload or drag and drop</div>
                <div className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, WebP, GIF up to {maxSizeMB}MB (max {maxFiles} files)
                </div>
              </div>
            </>
          )}
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">Drop files here</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for displaying uploaded images with remove functionality
interface UploadedImageProps {
  image: SupabaseUploadResult;
  onRemove: () => void;
  className?: string;
}

export const UploadedImage: React.FC<UploadedImageProps> = ({
  image,
  onRemove,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      {imageError ? (
        <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-gray-400" />
        </div>
      ) : (
        <img
          src={image.publicUrl}
          alt={image.originalFilename}
          className="w-full h-24 object-cover rounded-lg border border-gray-200"
          onError={() => setImageError(true)}
        />
      )}
      
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="truncate">{image.originalFilename}</div>
        {image.width && image.height && (
          <div>{image.width}×{image.height}</div>
        )}
      </div>
    </div>
  );
};

// Batch upload component for multiple images
interface BatchUploadProps {
  onUpload: (results: SupabaseUploadResult[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  bucket?: string;
  path?: string;
  disabled?: boolean;
}

export const BatchUpload: React.FC<BatchUploadProps> = (props) => {
  return (
    <SupabaseUploadWidget {...props}>
      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <Camera className="w-4 h-4" />
        Add Photos
      </div>
    </SupabaseUploadWidget>
  );
};