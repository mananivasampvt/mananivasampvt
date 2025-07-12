import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageUrlInput from './ImageUrlInput';
import { isImageFile, getImageFormatFromFile, getSupportedImageFormats } from '@/lib/mediaUtils';

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
    
    // Add specific parameters for better image handling and HEIC support
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');
    
    // Special handling for HEIC files - convert to JPEG for browser compatibility
    const isHeicFile = file.name.toLowerCase().includes('.heic') || file.type.toLowerCase().includes('heic');
    if (isHeicFile) {
      formData.append('format', 'jpg'); // Force conversion to JPEG
      formData.append('quality', '90'); // High quality for HEIC conversion
      console.log('🔄 HEIC file detected, will convert to JPEG for browser compatibility');
    }
    
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      supportedFormat: isImageFile(file) ? 'Yes' : 'No',
      isHeicFile: isHeicFile ? 'Yes (will convert to JPEG)' : 'No'
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
        errorText,
        fileName: file.name,
        fileType: file.type,
        cloudName: CLOUDINARY_CLOUD_NAME,
        preset: CLOUDINARY_UPLOAD_PRESET
      });
      
      if (response.status === 401) {
        throw new Error('Cloudinary authentication failed. Check your upload preset configuration.');
      } else if (response.status === 400) {
        throw new Error(`Invalid upload request for ${file.name}. Check if the file format is supported by Cloudinary.`);
      } else {
        throw new Error(`Cloudinary upload failed for ${file.name}: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      originalFileName: file.name,
      originalFormat: file.type,
      convertedFormat: isHeicFile ? 'JPEG (converted from HEIC)' : data.format
    });
    
    // Test if the uploaded image can be accessed immediately
    console.log('🔍 Testing immediate access to uploaded image...');
    const testImage = new Image();
    testImage.onload = () => {
      console.log('✅ Uploaded image is immediately accessible');
    };
    testImage.onerror = (error) => {
      console.warn('⚠️ Uploaded image may not be immediately accessible:', error);
    };
    testImage.src = data.secure_url;
    
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
        
        console.log(`Processing file ${i + 1}/${files.length}:`, {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });
        
        // Enhanced image format validation
        if (!isImageFile(file)) {
          const detectedFormat = getImageFormatFromFile(file);
          const supportedFormats = getSupportedImageFormats().join(', ');
          console.warn(`File ${file.name} rejected: unsupported format. Detected: ${detectedFormat}, Type: ${file.type}`);
          toast.error(`${file.name} is not a supported image format${detectedFormat ? ` (detected: ${detectedFormat})` : ''}. Supported formats: ${supportedFormats}`);
          errorCount++;
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} rejected: too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          errorCount++;
          continue;
        }

        if (file.size === 0) {
          console.warn(`File ${file.name} rejected: empty file`);
          toast.error(`${file.name} appears to be empty or corrupted`);
          errorCount++;
          continue;
        }

        try {
          console.log(`Uploading image ${i + 1}/${files.length}:`, file.name);
          
          // Special notification for HEIC files
          const isHeicFile = file.name.toLowerCase().includes('.heic') || file.type.toLowerCase().includes('heic');
          if (isHeicFile) {
            toast.info(`Converting ${file.name} from HEIC to JPEG for browser compatibility...`);
          }
          
          const imageUrl = await uploadToCloudinary(file);
          
          if (!imageUrl || !imageUrl.startsWith('https://') || !imageUrl.includes('cloudinary.com')) {
            throw new Error('Invalid response from Cloudinary');
          }
          
          newImages.push(imageUrl);
          successCount++;
          
          if (isHeicFile) {
            console.log(`✅ HEIC file successfully converted and uploaded: ${file.name} -> ${imageUrl}`);
            toast.success(`${file.name} converted to JPEG and uploaded successfully!`);
          } else {
            console.log(`Successfully uploaded: ${file.name} -> ${imageUrl}`);
          }
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          handleUploadError(error, file.name);
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

  // Add configuration status checking
  const getConfigStatus = () => {
    const hasCloudName = !!CLOUDINARY_CLOUD_NAME;
    const hasPreset = !!CLOUDINARY_UPLOAD_PRESET;
    const isConfigured = hasCloudName && hasPreset;
    
    return {
      isConfigured,
      status: isConfigured ? 'ready' : 'incomplete',
      message: isConfigured 
        ? '✅ Cloudinary configured'
        : '❌ Missing configuration'
    };
  };

  // Add debugging helper for Cloudinary configuration
  const testCloudinaryConfig = () => {
    console.log('🔧 Cloudinary Configuration Test:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      endpoint: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      timestamp: new Date().toISOString()
    });
  };

  // Test configuration on component mount
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testCloudinaryConfig();
    }
  }, []);

  // Add test upload function for debugging
  const testUpload = async () => {
    console.log('🧪 Testing Cloudinary connection...');
    
    // Create a small test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 1, 1);
    }
    
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ Failed to create test blob');
          reject(new Error('Failed to create test image'));
          return;
        }
        
        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        console.log('🧪 Created test file:', testFile);
        
        try {
          const url = await uploadToCloudinary(testFile);
          console.log('✅ Cloudinary test upload successful:', url);
          
          // Test if the image can be loaded
          const img = new Image();
          img.onload = () => {
            console.log('✅ Test image loads successfully in browser');
            toast.success('Cloudinary configuration is working correctly!');
            resolve();
          };
          img.onerror = (error) => {
            console.error('❌ Test image failed to load in browser:', error);
            toast.error('Upload successful but image cannot be displayed. Check CORS settings.');
            reject(new Error('Image upload works but display fails'));
          };
          img.src = url;
          
        } catch (error) {
          console.error('❌ Cloudinary test upload failed:', error);
          toast.error(`Cloudinary test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          reject(error);
        }
      }, 'image/png');
    });
  };

  // Enhanced error handling with detailed diagnostics
  const handleUploadError = (error: any, fileName: string) => {
    console.error('📊 Upload Error Analysis:', {
      fileName,
      error: error.message,
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      timestamp: new Date().toISOString()
    });

    // Provide specific error messages based on error type
    if (error.message.includes('authentication')) {
      toast.error('❌ Authentication Error: Please check if the upload preset "kkdrealestate" exists and is set to "Unsigned" in your Cloudinary dashboard.');
    } else if (error.message.includes('Invalid upload request')) {
      toast.error(`❌ Format Error: ${fileName} format is not supported by your Cloudinary preset. Try a different image format.`);
    } else if (error.message.includes('400')) {
      toast.error('❌ Bad Request: Check file format and size. Maximum 10MB allowed.');
    } else if (error.message.includes('401')) {
      toast.error('❌ Unauthorized: Upload preset configuration issue. Check Cloudinary settings.');
    } else if (error.message.includes('413')) {
      toast.error('❌ File Too Large: Reduce image size to under 10MB.');
    } else {
      toast.error(`❌ Upload Failed: ${error.message}`);
    }
  };

  const allImages = getAllImages();

  return (
    <div className="space-y-4">
      {/* Development Mode: Cloudinary Test Button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Development Mode</p>
              <p className="text-xs text-yellow-600">
                {getConfigStatus().message} | Cloud: {CLOUDINARY_CLOUD_NAME} | Preset: {CLOUDINARY_UPLOAD_PRESET}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testUpload}
              disabled={uploading || !getConfigStatus().isConfigured}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Test Upload
            </Button>
          </div>
        </div>
      )}

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
            <p className="text-xs text-gray-500 mb-3">
              All image formats supported: JPEG, JPG, PNG, GIF, WEBP, BMP, TIFF, TIF, HEIC*, HEIF*, RAW, SVG and all camera RAW formats<br/>
              <span className="text-blue-600">*HEIC/HEIF files are automatically converted to JPEG for browser compatibility</span>
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.heic,.heif,.raw,.tiff,.tif,.bmp,.dng,.cr2,.nef,.orf,.arw,.rw2,.crw,.erf,.3fr,.dcr,.k25,.kdc,.mrw,.raf,.sr2,.srf,.x3f"
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
              Supported formats: JPEG, JPG, PNG, GIF, WEBP, BMP, TIFF, TIF, HEIC*, HEIF*, RAW, SVG and all camera RAW formats<br/>
              <span className="text-blue-600">*HEIC/HEIF automatically converted to JPEG</span>
            </p>
            <p className="text-xs text-gray-500">
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
                        console.error('Image load error details:', {
                          src: image,
                          error: e,
                          timestamp: new Date().toISOString()
                        });
                        
                        // Check if this is a HEIC-related issue
                        const isHeicUrl = image.includes('.heic') || image.includes('heic');
                        if (isHeicUrl) {
                          console.warn('⚠️ HEIC format detected in URL - browser may not support direct HEIC display');
                        }
                        
                        // Try to fetch the image to get more details
                        fetch(image, { method: 'HEAD' })
                          .then(response => {
                            console.log('Image HEAD response:', {
                              status: response.status,
                              headers: Object.fromEntries(response.headers.entries()),
                              url: image,
                              contentType: response.headers.get('content-type')
                            });
                            
                            // Special handling for HEIC content type
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('heic')) {
                              console.warn('⚠️ Server is serving HEIC content type - image should have been converted');
                            }
                          })
                          .catch(err => {
                            console.error('Image HEAD request failed:', err);
                          });
                        
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
