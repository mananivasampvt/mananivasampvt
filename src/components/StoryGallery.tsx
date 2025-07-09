import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

const StoryGallery = () => {
  const [images, setImages] = useState<StoryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStoryImages();
  }, []);

  const fetchStoryImages = async () => {
    try {
      setError(null);
      console.log('Fetching story images from Firestore...');
      
      const storyImagesQuery = collection(db, 'storyImages');
      const querySnapshot = await getDocs(storyImagesQuery);
      
      const imageData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing story image document:', { id: doc.id, data });
        
        return {
          id: doc.id,
          url: (data.url || data.image || '').trim(), // Trim any whitespace
          title: data.title || '',
          description: data.description || ''
        };
      }).filter(img => img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))) as StoryImage[];
      
      console.log('Processed and filtered story images:', imageData);
      setImages(imageData);
      
    } catch (error: any) {
      console.error('Error fetching story images:', error);
      setError(`Failed to load story images: ${error?.message || 'Unknown error'}`);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageId: string, imageUrl: string) => {
    console.error('Image failed to load:', { id: imageId, url: imageUrl });
    setImageErrors(prev => new Set([...prev, imageId]));
  };

  const handleImageLoad = (imageId: string, imageUrl: string) => {
    console.log('Image loaded successfully:', { id: imageId, url: imageUrl });
    // Remove from error set if it was there
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (loading) {
    return (
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-2xl animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-64 sm:h-80 lg:h-96 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-600 font-medium mb-2">Error Loading Story Images</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchStoryImages}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Story Images</h3>
          <p className="text-gray-500 text-sm">Add story images through the admin panel to display them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group">
      {/* Main Image Container */}
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex transition-transform duration-500 ease-in-out h-full" 
             style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-shrink-0 w-full h-full relative"
            >
              {imageErrors.has(image.id) ? (
                // Only show fallback for images that actually failed to load
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Image failed to load</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={image.url}
                  alt={image.title || `Story image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(image.id, image.url)}
                  onLoad={() => handleImageLoad(image.id, image.url)}
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Content Overlay */}
              {(image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {image.title && (
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm sm:text-base text-gray-200">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110 z-10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex 
                  ? 'bg-white w-8 h-2' 
                  : 'bg-white/50 hover:bg-white/80 w-2 h-2 hover:scale-125'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default StoryGallery;
