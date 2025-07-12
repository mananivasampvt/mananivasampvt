import React from 'react';
import { X, Image as ImageIcon, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { combineMediaItems, MediaItem, isVideoUrl, getVideoThumbnail } from '@/lib/mediaUtils';
import { toast } from 'sonner';

interface AdminMediaPreviewProps {
  images: string[];
  videos: string[];
  onRemoveImage: (index: number) => void;
  onRemoveVideo: (index: number) => void;
  className?: string;
}

const AdminMediaPreview: React.FC<AdminMediaPreviewProps> = ({
  images,
  videos,
  onRemoveImage,
  onRemoveVideo,
  className = ''
}) => {
  const mediaItems = combineMediaItems(images, videos);
  
  if (mediaItems.length === 0) {
    return null;
  }

  const handleRemoveMedia = (mediaItem: MediaItem, index: number) => {
    if (mediaItem.type === 'image') {
      // Find the index in the images array
      const imageIndex = images.findIndex(img => img === mediaItem.url);
      if (imageIndex !== -1) {
        onRemoveImage(imageIndex);
        toast.success('Image removed');
      }
    } else if (mediaItem.type === 'video') {
      // Find the index in the videos array
      const videoIndex = videos.findIndex(vid => vid === mediaItem.url);
      if (videoIndex !== -1) {
        onRemoveVideo(videoIndex);
        toast.success('Video removed');
      }
    }
  };

  const getThumbnailForVideo = (videoUrl: string): string => {
    // YouTube thumbnail
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return getVideoThumbnail(videoUrl);
    }
    
    // Vimeo thumbnail
    if (videoUrl.includes('vimeo.com')) {
      return getVideoThumbnail(videoUrl);
    }
    
    // For direct video files, we'll use a placeholder
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
  };

  const getVideoTypeLabel = (videoUrl: string): string => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return 'YouTube';
    }
    if (videoUrl.includes('vimeo.com')) {
      return 'Vimeo';
    }
    if (videoUrl.includes('cloudinary.com')) {
      return 'Uploaded';
    }
    return 'Video';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            All Property Media ({mediaItems.length} items)
          </h4>
          <div className="text-xs text-gray-500">
            Click × to remove items
          </div>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mediaItems.map((mediaItem, index) => (
            <div key={`${mediaItem.type}-${index}-${mediaItem.url}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 bg-gray-100">
                {mediaItem.type === 'image' ? (
                  <img
                    src={mediaItem.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error('Failed to load image:', mediaItem.url);
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.display = 'flex';
                      e.currentTarget.style.alignItems = 'center';
                      e.currentTarget.style.justifyContent = 'center';
                      e.currentTarget.innerHTML = '<span style="color: #ef4444; font-size: 10px;">Failed to load</span>';
                    }}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {isVideoUrl(mediaItem.url) && (mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be') || mediaItem.url.includes('vimeo.com')) ? (
                      // YouTube/Vimeo thumbnail
                      <img
                        src={getThumbnailForVideo(mediaItem.url)}
                        alt={`Video ${index + 1} thumbnail`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
                        }}
                      />
                    ) : (
                      // Direct video preview
                      <video
                        src={mediaItem.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                        onError={(e) => {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-full bg-gray-200 flex items-center justify-center';
                          placeholder.innerHTML = '<div class="text-center text-gray-400"><svg class="w-6 h-6 mx-auto mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><div class="text-xs">Video</div></div>';
                          e.currentTarget.parentNode?.appendChild(placeholder);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    {/* Video play overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-1.5">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(mediaItem, index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out hover:bg-red-600 hover:scale-110 transform shadow-md z-10"
                  title={`Remove ${mediaItem.type}`}
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Media type indicator */}
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                  {mediaItem.type === 'image' ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                </div>
                
                {/* Video type label for videos */}
                {mediaItem.type === 'video' && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {getVideoTypeLabel(mediaItem.url)}
                  </div>
                )}
                
                {/* Index */}
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {images.length} images
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {videos.length} videos
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Total: {mediaItems.length} media items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMediaPreview;
