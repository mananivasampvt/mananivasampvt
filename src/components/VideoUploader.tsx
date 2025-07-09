import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Video, Link as LinkIcon, Play } from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideosUpload: (videos: string[]) => void;
  maxVideos?: number;
  initialVideos?: string[];
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onVideosUpload, 
  maxVideos = 5,
  initialVideos = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [urlVideos, setUrlVideos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // Cloudinary configuration for video uploads
  const CLOUDINARY_CLOUD_NAME = 'doxwyrp8n';
  const CLOUDINARY_UPLOAD_PRESET = 'kkdrealestate';

  // Initialize videos from props - improved to handle updates properly
  React.useEffect(() => {
    if (initialVideos && initialVideos.length > 0) {
      console.log('Initializing videos from props:', initialVideos);
      
      // Separate uploaded videos (Cloudinary URLs) from URL videos (YouTube, Vimeo, etc.)
      const cloudinaryVideos: string[] = [];
      const externalVideos: string[] = [];
      
      initialVideos.forEach(video => {
        if (video && typeof video === 'string' && !video.startsWith('blob:') && !video.startsWith('data:')) {
          if (video.includes('cloudinary.com') || (video.includes('.mp4') || video.includes('.webm') || video.includes('.mov')) && !video.includes('youtube.com') && !video.includes('vimeo.com')) {
            cloudinaryVideos.push(video);
          } else if (video.includes('youtube.com') || video.includes('youtu.be') || video.includes('vimeo.com') || video.includes('player.vimeo.com')) {
            externalVideos.push(video);
          } else {
            // Default to external for unknown video types
            externalVideos.push(video);
          }
        }
      });
      
      console.log('Separated videos - Cloudinary:', cloudinaryVideos.length, 'External:', externalVideos.length);
      
      // Only update if the videos have actually changed to prevent infinite re-renders
      const currentTotal = uploadedVideos.length + urlVideos.length;
      const newTotal = cloudinaryVideos.length + externalVideos.length;
      
      if (currentTotal !== newTotal || 
          JSON.stringify([...uploadedVideos, ...urlVideos].sort()) !== JSON.stringify([...cloudinaryVideos, ...externalVideos].sort())) {
        setUploadedVideos(cloudinaryVideos);
        setUrlVideos(externalVideos);
      }
    } else if (initialVideos && initialVideos.length === 0 && (uploadedVideos.length > 0 || urlVideos.length > 0)) {
      // Clear videos if initialVideos is empty (for new forms)
      console.log('Clearing videos as initialVideos is empty');
      setUploadedVideos([]);
      setUrlVideos([]);
    }
  }, [initialVideos]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'real_estate/videos');
    formData.append('resource_type', 'video');
    
    console.log('Uploading video to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName: file.name,
      fileSize: file.size
    });
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary Video API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      if (response.status === 401) {
        throw new Error('Cloudinary authentication failed. Check your upload preset configuration.');
      } else if (response.status === 400) {
        throw new Error('Invalid video upload request. Check file format and size limits.');
      } else {
        throw new Error(`Cloudinary video upload failed: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('Cloudinary video upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      duration: data.duration,
      bytes: data.bytes
    });
    
    return data.secure_url;
  };

  const getAllVideos = () => {
    return [...uploadedVideos, ...urlVideos];
  };

  const updateParentWithAllVideos = () => {
    const allVideos = getAllVideos();
    onVideosUpload(allVideos);
    console.log('All videos updated:', allVideos);
  };

  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return false;
    
    const trimmedUrl = url.trim();
    
    // YouTube URLs - comprehensive patterns
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)/;
    // Vimeo URLs - comprehensive patterns
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)/;
    // Direct video file URLs
    const directVideoRegex = /\.(mp4|webm|ogg|mov|avi|wmv|m4v|3gp|flv)(\?.*)?$/i;
    // Cloudinary video URLs
    const cloudinaryRegex = /res\.cloudinary\.com\/.*\.(mp4|webm|mov)/i;
    
    // Additional video hosting services
    const dailymotionRegex = /^(https?:\/\/)?(www\.)?dailymotion\.com\/video\//;
    const twitchRegex = /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\//;
    
    return youtubeRegex.test(trimmedUrl) || 
           vimeoRegex.test(trimmedUrl) || 
           directVideoRegex.test(trimmedUrl) || 
           cloudinaryRegex.test(trimmedUrl) ||
           dailymotionRegex.test(trimmedUrl) ||
           twitchRegex.test(trimmedUrl);
  };

  const normalizeVideoUrl = (url: string): string => {
    // Ensure URL has protocol
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Convert YouTube watch URLs to standard format for better compatibility
    if (normalizedUrl.includes('youtube.com/watch?v=')) {
      const videoId = normalizedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        // Keep as watch URL for better thumbnail generation and compatibility
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Convert YouTube short URLs to standard format
    if (normalizedUrl.includes('youtu.be/')) {
      const videoId = normalizedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Convert YouTube mobile URLs
    if (normalizedUrl.includes('m.youtube.com/watch?v=')) {
      const videoId = normalizedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Convert YouTube shorts URLs
    if (normalizedUrl.includes('youtube.com/shorts/')) {
      const videoId = normalizedUrl.split('/shorts/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Convert Vimeo URLs to standard format
    if (normalizedUrl.includes('vimeo.com/') && !normalizedUrl.includes('/embed/') && !normalizedUrl.includes('player.vimeo.com')) {
      const videoId = normalizedUrl.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://vimeo.com/${videoId}`;
      }
    }
    
    return normalizedUrl;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    const currentTotalVideos = getAllVideos().length;
    if (currentTotalVideos + files.length > maxVideos) {
      toast.error(`Maximum ${maxVideos} videos allowed`);
      return;
    }

    setUploading(true);
    const newVideos: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('video/')) {
          console.warn('Skipping non-video file:', file.name);
          errorCount++;
          continue;
        }

        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Video "${file.name}" is too large. Maximum size is 100MB.`);
          errorCount++;
          continue;
        }

        const videoUrl = await uploadToCloudinary(file);
        newVideos.push(videoUrl);
        successCount++;
        
      } catch (error) {
        console.error('Error uploading video:', error);
        errorCount++;
        
        if (error instanceof Error) {
          if (error.message.includes('authentication')) {
            toast.error('Upload failed: Authentication error. Please contact support.');
          } else if (error.message.includes('Invalid')) {
            toast.error(`Upload failed: Invalid video format for "${files[i].name}"`);
          } else {
            toast.error(`Upload failed for "${files[i].name}": ${error.message}`);
          }
        } else {
          toast.error(`Upload failed for "${files[i].name}"`);
        }
      }
    }

    if (successCount > 0) {
      const updatedVideos = [...uploadedVideos, ...newVideos];
      setUploadedVideos(updatedVideos);
      onVideosUpload([...updatedVideos, ...urlVideos]);
      toast.success(`${successCount} video(s) uploaded successfully!`);
    }

    if (errorCount > 0 && successCount === 0) {
      toast.error(`Failed to upload ${errorCount} video(s)`);
    }

    setUploading(false);
  }, [uploadedVideos, urlVideos, maxVideos, onVideosUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleVideoUrlAdd = () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    if (!isValidVideoUrl(videoUrl.trim())) {
      toast.error('Please enter a valid video URL (YouTube, Vimeo, or direct video link)');
      return;
    }

    const currentTotalVideos = getAllVideos().length;
    if (currentTotalVideos >= maxVideos) {
      toast.error(`Maximum ${maxVideos} videos allowed`);
      return;
    }

    // Check for duplicate URLs
    const trimmedUrl = videoUrl.trim();
    const normalizedUrl = normalizeVideoUrl(trimmedUrl);
    const allCurrentVideos = getAllVideos();
    
    if (allCurrentVideos.includes(normalizedUrl) || allCurrentVideos.includes(trimmedUrl)) {
      toast.error('This video URL has already been added');
      return;
    }

    const updatedUrlVideos = [...urlVideos, normalizedUrl];
    setUrlVideos(updatedUrlVideos);
    
    // Update parent immediately
    const allUpdatedVideos = [...uploadedVideos, ...updatedUrlVideos];
    onVideosUpload(allUpdatedVideos);
    setVideoUrl('');
    toast.success('Video URL added successfully!');
    console.log('Video URL added:', normalizedUrl);
  };

  // Handle Enter key press for video URL input
  const handleVideoUrlKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVideoUrlAdd();
    }
  };

  const removeVideo = (index: number, isUploaded: boolean) => {
    if (isUploaded) {
      const updatedUploaded = uploadedVideos.filter((_, i) => i !== index);
      setUploadedVideos(updatedUploaded);
      onVideosUpload([...updatedUploaded, ...urlVideos]);
    } else {
      const adjustedIndex = index - uploadedVideos.length;
      const updatedUrls = urlVideos.filter((_, i) => i !== adjustedIndex);
      setUrlVideos(updatedUrls);
      onVideosUpload([...uploadedVideos, ...updatedUrls]);
    }
  };

  const allVideos = getAllVideos();

  // Only update parent when videos actually change, not on every render
  React.useEffect(() => {
    const allCurrentVideos = getAllVideos();
    // Only call parent callback if we have initial videos loaded or videos have been changed by user
    if (allCurrentVideos.length > 0 || (initialVideos && initialVideos.length === 0)) {
      onVideosUpload(allCurrentVideos);
      console.log('Videos updated in parent:', allCurrentVideos.length);
    }
  }, [uploadedVideos, urlVideos]); // Depend on the actual arrays, not their length

  const getVideoThumbnail = (videoUrl: string): string => {
    // YouTube thumbnail
    if (videoUrl.includes('youtube.com/embed/')) {
      const videoId = videoUrl.split('/embed/')[1]?.split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    // Vimeo thumbnail (Note: This requires an API call for full implementation)
    if (videoUrl.includes('player.vimeo.com/video/')) {
      return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop'; // Placeholder
    }
    
    // Default video thumbnail
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Upload Videos
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Video URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-300 bg-gray-50 hover:bg-blue-50"
          >
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Drag and drop video files here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports MP4, WebM, MOV (max 100MB each)
            </p>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button asChild disabled={uploading}>
                <span className="cursor-pointer">
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Select Videos
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, or direct link)</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleVideoUrlKeyPress}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="flex-1"
              />
              <Button 
                onClick={handleVideoUrlAdd}
                disabled={!videoUrl.trim() || getAllVideos().length >= maxVideos}
              >
                Add Video
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Paste YouTube, Vimeo, or direct video file URLs. Press Enter or click "Add Video" to add multiple URLs.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Preview Grid */}
      {allVideos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Videos ({allVideos.length}/{maxVideos})
            </h4>
            <div className="text-xs text-gray-500">
              Click × to remove videos
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allVideos.map((video, index) => {
              const isUploaded = index < uploadedVideos.length;
              const videoType = isUploaded ? 'Uploaded' : 'URL';
              
              return (
                <div key={`${isUploaded ? 'upload' : 'url'}-${index}`} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 bg-gray-100">
                    {video.includes('youtube.com') || video.includes('youtu.be') || video.includes('vimeo.com') ? (
                      // Preview for embeddable videos (YouTube/Vimeo)
                      <div className="relative w-full h-full">
                        <img
                          src={getVideoThumbnail(video)}
                          alt={`Video ${index + 1} thumbnail`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-2">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        {/* Video platform indicator */}
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {video.includes('youtube.com') || video.includes('youtu.be') ? 'YouTube' : 'Vimeo'}
                        </div>
                      </div>
                    ) : (
                      // Preview for direct video files or Cloudinary videos
                      <div className="relative w-full h-full">
                        <video
                          src={video}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                          onError={(e) => {
                            // Fallback to placeholder if video fails to load
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full bg-gray-200 flex items-center justify-center';
                            placeholder.innerHTML = '<div class="text-center"><div class="w-8 h-8 mx-auto mb-2 text-gray-400"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><span class="text-xs text-gray-500">Video Preview</span></div>';
                            e.currentTarget.parentNode?.appendChild(placeholder);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-blue-600 rounded-full p-2">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        {/* Direct video indicator */}
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          MP4
                        </div>
                      </div>
                    )}
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeVideo(index, isUploaded)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                      title="Remove video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Video info */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {videoType}
                    </div>
                    
                    {/* Video index */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Instructions */}
          {allVideos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ✓ {allVideos.length} video(s) added. These will appear in the property gallery alongside images.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
