import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { combineMediaItems, MediaItem, getEmbedUrl } from '@/lib/mediaUtils';

interface PropertyImageGalleryProps {
  images: string[];
  videos?: string[];
  title: string;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images, videos = [], title }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine images and videos into media items
  const getMediaItems = (): MediaItem[] => {
    const mediaItems = combineMediaItems(images, videos);
    
    if (mediaItems.length === 0) {
      const defaultImage = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
      return [{ url: defaultImage, type: 'image' }];
    }
    
    return mediaItems;
  };

  const mediaItems = getMediaItems();
  const currentMedia = mediaItems[selectedMediaIndex];

  const nextMedia = () => {
    setSelectedMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setSelectedMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const openLightbox = (index: number) => {
    setSelectedMediaIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Media Display */}
      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 group cursor-pointer">
        {currentMedia?.type === 'video' ? (
          // Video Display
          <div className="relative w-full h-full">
            <img
              src={currentMedia.thumbnail}
              alt={`${title} - Video ${selectedMediaIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => openLightbox(selectedMediaIndex)}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop';
              }}
            />
            
            {/* Video Play Button Overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer"
              onClick={() => openLightbox(selectedMediaIndex)}
            >
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-opacity-100 hover:scale-110">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </div>
            </div>
            
            {/* Video Type Indicator */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Play className="w-3 h-3" />
              Video
            </div>
          </div>
        ) : (
          // Image Display
          <img
            src={currentMedia?.url}
            alt={`${title} - Main image`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => openLightbox(selectedMediaIndex)}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
            }}
          />
        )}
        
        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMedia();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMedia();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* View Full Gallery Button */}
        <button
          onClick={() => openLightbox(selectedMediaIndex)}
          className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Maximize2 className="w-3 h-3" />
          Gallery
        </button>

        {/* Media Counter */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
          {selectedMediaIndex + 1} / {mediaItems.length}
        </div>
      </div>

      {/* Compact Thumbnail Strip */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mediaItems.slice(0, 6).map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMediaIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === selectedMediaIndex 
                  ? 'border-blue-500 ring-1 ring-blue-200' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={media.type === 'video' ? media.thumbnail : media.url}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                  }}
                />
                {media.type === 'video' && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
          {mediaItems.length > 6 && (
            <button
              onClick={() => openLightbox(0)}
              className="flex-shrink-0 w-16 h-12 rounded-md bg-gray-100 border-2 border-gray-200 hover:border-blue-300 flex items-center justify-center text-gray-600 text-xs"
            >
              +{mediaItems.length - 6}
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full">
            {currentMedia?.type === 'video' ? (
              // Video Lightbox
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                {currentMedia.url.includes('youtube.com') || currentMedia.url.includes('vimeo.com') ? (
                  <iframe
                    src={getEmbedUrl(currentMedia.url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentMedia.url}
                    controls
                    className="w-full h-full"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              // Image Lightbox
              <img
                src={currentMedia?.url}
                alt={`${title} - Full size`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                }}
              />
            )}
            
            {/* Close Button */}
            <Button
              onClick={closeLightbox}
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation in Lightbox */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  onClick={prevMedia}
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={nextMedia}
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Counter in Lightbox */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
              {selectedMediaIndex + 1} of {mediaItems.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;
