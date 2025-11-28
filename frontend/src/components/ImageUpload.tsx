import { useState, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  label?: string;
  existingImages?: string[];
  onImagesChange?: (urls: string[]) => void;
}

const ImageUpload = ({
  onUploadComplete,
  onUploadError,
  maxSize = 5,
  accept = 'image/*',
  multiple = false,
  label = 'Upload Image',
  existingImages = [],
  onImagesChange,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file size
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize * 1024 * 1024) {
        toast.error(`File ${files[i].name} exceeds ${maxSize}MB limit`);
        if (onUploadError) {
          onUploadError(`File size exceeds ${maxSize}MB`);
        }
        return;
      }
    }

    setUploading(true);

    try {
      if (multiple) {
        // Multiple file upload
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });

        const response = await api.post('/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const urls = response.data.data.urls.map((item: any) => item.url);
        const newPreview = [...preview, ...urls];
        setPreview(newPreview);
        
        if (onImagesChange) {
          onImagesChange(newPreview);
        }

        toast.success(`${urls.length} image(s) uploaded successfully`);
      } else {
        // Single file upload
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const url = response.data.data.url;
        setPreview([url]);
        onUploadComplete(url);
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);
    if (onImagesChange) {
      onImagesChange(newPreview);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : multiple ? 'Select Images' : 'Select Image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-sm text-gray-500">
            Max {maxSize}MB per file
          </span>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {preview.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

