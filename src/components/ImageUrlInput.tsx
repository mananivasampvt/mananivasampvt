
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUrlInputProps {
  onUrlsChange: (urls: string[]) => void;
  initialUrls?: string[];
  maxImages?: number;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ 
  onUrlsChange, 
  initialUrls = [], 
  maxImages = 10 
}) => {
  const [urlInputs, setUrlInputs] = useState<string[]>(
    initialUrls.length > 0 ? initialUrls : ['']
  );
  const [validUrls, setValidUrls] = useState<string[]>(initialUrls);

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    // Check if URL is valid
    try {
      new URL(url);
    } catch {
      return false;
    }
    
    // Check if URL ends with image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const urlLower = url.toLowerCase();
    return imageExtensions.some(ext => urlLower.includes(ext)) || 
           url.includes('cloudinary.com') || 
           url.includes('unsplash.com');
  };

  const handleUrlChange = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = value;
    setUrlInputs(newInputs);
    
    // Validate and update valid URLs
    const newValidUrls = newInputs
      .filter(url => validateImageUrl(url))
      .slice(0, maxImages);
    
    setValidUrls(newValidUrls);
    onUrlsChange(newValidUrls);
  };

  const addUrlInput = () => {
    if (urlInputs.length < maxImages) {
      setUrlInputs([...urlInputs, '']);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      const newInputs = urlInputs.filter((_, i) => i !== index);
      setUrlInputs(newInputs);
      
      const newValidUrls = newInputs
        .filter(url => validateImageUrl(url))
        .slice(0, maxImages);
      
      setValidUrls(newValidUrls);
      onUrlsChange(newValidUrls);
    }
  };

  const validateUrl = async (url: string): Promise<boolean> => {
    if (!validateImageUrl(url)) return false;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  };

  const handleUrlBlur = async (index: number, url: string) => {
    if (url.trim() && !validateImageUrl(url)) {
      toast.error('Please enter a valid image URL (jpg, png, webp, gif)');
    } else if (url.trim()) {
      // Optional: Validate URL accessibility
      const isValid = await validateUrl(url);
      if (!isValid) {
        toast.warning('Image URL might not be accessible. Please verify the link.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="w-4 h-4 text-blue-600" />
        <Label className="text-sm font-medium">Image URLs</Label>
        <span className="text-xs text-gray-500">
          ({validUrls.length}/{maxImages} valid URLs)
        </span>
      </div>
      
      <div className="space-y-3">
        {urlInputs.map((url, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                onBlur={(e) => handleUrlBlur(index, e.target.value)}
                className={`transition-all duration-300 ${
                  url && validateImageUrl(url) 
                    ? 'border-green-300 bg-green-50' 
                    : url && !validateImageUrl(url)
                    ? 'border-red-300 bg-red-50'
                    : ''
                }`}
              />
            </div>
            {urlInputs.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeUrlInput(index)}
                className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {urlInputs.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrlInput}
          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another URL
        </Button>
      )}

      {/* Preview Section */}
      {validUrls.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm font-medium mb-2 block">URL Preview</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {validUrls.map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={url}
                  alt={`URL Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.display = 'flex';
                    e.currentTarget.style.alignItems = 'center';
                    e.currentTarget.style.justifyContent = 'center';
                    e.currentTarget.innerHTML = '<span style="color: #ef4444; font-size: 10px;">Invalid</span>';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>Supported formats:</strong> JPG, PNG, WebP, GIF<br />
        <strong>Tip:</strong> Use direct image URLs from trusted sources like Cloudinary, Unsplash, or your own CDN
      </div>
    </div>
  );
};

export default ImageUrlInput;
