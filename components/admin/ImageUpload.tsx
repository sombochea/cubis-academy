'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trans } from '@lingui/react/macro';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string | null;
  onUploadComplete: (fileUrl: string) => void;
  category?: 'profile' | 'document' | 'course_material' | 'general';
}

export function ImageUpload({ 
  currentImage, 
  onUploadComplete,
  category = 'profile' 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('isPublic', 'true');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      setSuccess(true);
      onUploadComplete(data.fileUrl);
      
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-[#007FFF] bg-[#007FFF]/5'
            : preview
            ? 'border-gray-200 bg-white'
            : 'border-gray-300 bg-[#F4F5F7] hover:border-[#007FFF]/50 hover:bg-[#007FFF]/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          /* Preview Mode */
          <div className="relative aspect-square w-full max-w-[200px] mx-auto p-4">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 bg-white text-[#007FFF] rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    title="Change image"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <div className="w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-white text-xs mt-2 font-medium">{uploadProgress}%</p>
                </div>
              )}

              {/* Success Indicator */}
              {success && (
                <div className="absolute inset-0 bg-green-600/90 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-white text-sm font-semibold">
                      <Trans>Uploaded!</Trans>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#007FFF]/10 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[#007FFF] animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-[#007FFF]" />
              )}
            </div>
            
            {isUploading ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#17224D]">
                  <Trans>Uploading...</Trans>
                </p>
                <div className="max-w-xs mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#007FFF] to-[#17224D] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#363942]/60">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-[#17224D] mb-1">
                  <Trans>Drop your image here, or</Trans>{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#007FFF] hover:text-[#0066CC] font-semibold"
                  >
                    <Trans>browse</Trans>
                  </button>
                </p>
                <p className="text-xs text-[#363942]/60">
                  <Trans>JPG, PNG or WebP • Max 5MB • 400x400px recommended</Trans>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
