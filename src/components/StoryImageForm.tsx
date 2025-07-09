
import React, { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface StoryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

interface StoryImageFormProps {
  onClose: () => void;
  onSuccess: () => void;
  image?: StoryImage | null;
}

const StoryImageForm = ({ onClose, onSuccess, image }: StoryImageFormProps) => {
  const [formData, setFormData] = useState({
    url: image?.url || '',
    title: image?.title || '',
    description: image?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateAndSanitizeUrl = (url: string): { isValid: boolean; sanitizedUrl: string; error?: string } => {
    // Trim whitespace
    const trimmed = url.trim();
    
    if (!trimmed) {
      return { isValid: false, sanitizedUrl: '', error: 'URL is required' };
    }

    // Check if it starts with http or https
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { isValid: false, sanitizedUrl: trimmed, error: 'URL must start with http:// or https://' };
    }

    // Basic URL format validation
    try {
      new URL(trimmed);
      return { isValid: true, sanitizedUrl: trimmed };
    } catch {
      return { isValid: false, sanitizedUrl: trimmed, error: 'Invalid URL format' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL before submission
    const urlValidation = validateAndSanitizeUrl(formData.url);
    if (!urlValidation.isValid) {
      setUrlError(urlValidation.error || 'Invalid URL');
      return;
    }

    setLoading(true);
    setUrlError(null);

    try {
      const sanitizedData = {
        ...formData,
        url: urlValidation.sanitizedUrl
      };

      if (image) {
        // Update existing image
        await updateDoc(doc(db, 'storyImages', image.id), sanitizedData);
        toast({
          title: "Success",
          description: "Story image updated successfully",
        });
      } else {
        // Add new image
        await addDoc(collection(db, 'storyImages'), sanitizedData);
        toast({
          title: "Success",
          description: "Story image added successfully",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save story image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear URL error when user starts typing
    if (field === 'url' && urlError) {
      setUrlError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            {image ? 'Edit Story Image' : 'Add Story Image'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">Image URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
                className={urlError ? 'border-red-500' : ''}
              />
              {urlError && (
                <p className="text-sm text-red-600 mt-1">{urlError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Image title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Image description"
                rows={3}
              />
            </div>

            {formData.url && !urlError && (
              <div>
                <Label>Preview</Label>
                <img
                  src={formData.url.trim()}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md mt-2"
                  onError={(e) => {
                    console.log('Preview image failed to load:', formData.url);
                  }}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || !!urlError} className="flex-1">
                {loading ? 'Saving...' : (image ? 'Update' : 'Add')} Image
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryImageForm;
