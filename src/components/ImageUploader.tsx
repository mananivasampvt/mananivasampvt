
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageUrlInput from './ImageUrlInput';

interface ImageUploaderProps {
  onImagesUpload: (images: string[]) => void;
  maxImages?: number;
  initialImages?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImagesUpload, 
  maxImages = 10,
  initialImages = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialImages.filter(img => img && !img.startsWith('data:'))
  );
  const [urlImages, setUrlImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  // Updated Cloudinary configuration with new credentials
  const CLOUDINARY_CLOUD_NAME = 'doxwyrp8n';
  const CLOUDINARY_UPLOAD_PRESET = 'kkdrealestate';

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'real_estate');
    
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size
    });
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      if (response.status === 401) {
        throw new Error('Cloudinary authentication failed. Check your upload preset configuration.');
      } else if (response.status === 400) {
        throw new Error('Invalid upload request. Check file format and size limits.');
      } else {
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes
    });
    
    return data.secure_url;
  };

  const getAllImages = () => {
    return [...uploadedImages, ...urlImages];
  };

  const updateParentWithAllImages = () => {
    const allImages = getAllImages();
    onImagesUpload(allImages);
    console.log('All images updated:', allImages);
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    const currentTotalImages = getAllImages().length;
    if (currentTotalImages + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newImages: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`);
          errorCount++;
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          errorCount++;
          continue;
        }

        try {
          console.log(`Uploading image ${i + 1}/${files.length}:`, file.name);
          const imageUrl = await uploadToCloudinary(file);
          
          if (!imageUrl || !imageUrl.startsWith('https://') || !imageUrl.includes('cloudinary.com')) {
            throw new Error('Invalid response from Cloudinary');
          }
          
          newImages.push(imageUrl);
          successCount++;
          console.log(`Successfully uploaded: ${file.name} -> ${imageUrl}`);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }

      if (successCount > 0) {
        const updatedUploadedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedUploadedImages);
        const allImages = [...updatedUploadedImages, ...urlImages];
        onImagesUpload(allImages);
        toast.success(`Successfully uploaded ${successCount} image(s)`);
        console.log('All uploaded images:', allImages);
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast.error(`Failed to upload any images. Please check your Cloudinary configuration.`);
      }
    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('Upload process failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, urlImages, maxImages, onImagesUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeUploadedImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    const allImages = [...updatedImages, ...urlImages];
    onImagesUpload(allImages);
    toast.success('Image removed');
  };

  const handleUrlImagesChange = (urls: string[]) => {
    const currentTotalImages = uploadedImages.length + urls.length;
    if (currentTotalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    setUrlImages(urls);
    const allImages = [...uploadedImages, ...urls];
    onImagesUpload(allImages);
    console.log('URL images updated:', urls);
  };

  const allImages = getAllImages();

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Paste URLs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all duration-300 ease-in-out hover:bg-blue-50"
          >
            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3 text-sm">
              Drag and drop images here, or click to select files
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading || allImages.length >= maxImages}
              onClick={() => document.getElementById('image-upload')?.click()}
              className="inline-flex items-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Select Images'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Maximum {maxImages} images, up to 10MB each
            </p>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <ImageUrlInput
            onUrlsChange={handleUrlImagesChange}
            initialUrls={urlImages}
            maxImages={maxImages - uploadedImages.length}
          />
        </TabsContent>
      </Tabs>

      {/* Combined Image Preview */}
      {allImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              All Images ({allImages.length}/{maxImages})
            </h4>
            <div className="text-xs text-gray-500">
              Click × to remove individual images
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {allImages.map((image, index) => {
              const isUploaded = index < uploadedImages.length;
              const adjustedIndex = isUploaded ? index : index - uploadedImages.length;
              
              return (
                <div key={`${isUploaded ? 'upload' : 'url'}-${index}`} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Failed to load image:', image);
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.innerHTML = '<span style="color: #ef4444; font-size: 10px;">Failed to load</span>';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isUploaded) {
                        removeUploadedImage(adjustedIndex);
                      } else {
                        const newUrlImages = urlImages.filter((_, i) => i !== adjustedIndex);
                        setUrlImages(newUrlImages);
                        const allUpdatedImages = [...uploadedImages, ...newUrlImages];
                        onImagesUpload(allUpdatedImages);
                        toast.success('Image removed');
                      }
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out hover:bg-red-600 hover:scale-110 transform shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                  <div className={`absolute top-1 left-1 text-white text-xs px-1 rounded opacity-80 ${
                    isUploaded ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {isUploaded ? '📁' : '🔗'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading to Cloudinary...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
