import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Square, Phone, ChevronLeft, ChevronRight, Send, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useShortlist } from '@/hooks/useShortlist';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';
import { combineMediaItems, MediaItem, isVideoUrl, getVideoThumbnail } from '@/lib/mediaUtils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    images: string[];
    videos?: string[];
    bedrooms?: number;
    bathrooms?: number;
    area: string;
    description: string;
    featured?: boolean;
    category?: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const getMediaItems = (): MediaItem[] => {
    const images = property.images || [];
    const videos = property.videos || [];
    const mediaItems = combineMediaItems(images, videos);
    
    if (mediaItems.length === 0) {
      const defaultImage = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
      return [{ url: defaultImage, type: 'image' }];
    }
    
    return mediaItems;
  };

  const mediaItems = getMediaItems();
  const currentMedia = mediaItems[currentMediaIndex];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
    setImageLoading(true);
    setImageError(false);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
    setImageLoading(true);
    setImageError(false);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(index);
    setImageLoading(true);
    setImageError(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Media failed to load:', currentMedia?.url?.substring(0, 50) + '...');
    setImageLoading(false);
    setImageError(true);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property/${property.id}`);
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareMenuOpen(true);
  };

  const handleShortlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleShortlist(property.id);
  };

  const currentImageUrl = currentMedia?.type === 'image' ? currentMedia.url : currentMedia?.thumbnail || '';
  const isLandProperty = property.category === 'Land' || property.type === 'Land' || property.type === 'Agricultural' || property.type === 'Residential Plot';
  const isPropertyShortlisted = isShortlisted(property.id);

  return (
    <>
      <div 
        className="property-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] transform cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image Carousel - Reduced height for mobile */}
        <div className="relative h-48 sm:h-64 lg:h-56 xl:h-64 overflow-hidden group">
          
          
          <div className="relative w-full h-full">
            {currentMedia?.type === 'video' ? (
              // Video Display
              <div className="relative w-full h-full">
                <img 
                  src={currentMedia.thumbnail || getVideoThumbnail(currentMedia.url)}
                  alt={`${property.title} - Video ${currentMediaIndex + 1}`}
                  className={`w-full h-full object-cover transition-all duration-700 transform ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  } group-hover:scale-110`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
                
                {/* Video Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
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
                src={currentImageUrl}
                alt={`${property.title} - Image ${currentMediaIndex + 1}`}
                className={`w-full h-full object-cover transition-all duration-700 transform ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                } group-hover:scale-110`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            )}
            
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {imageError && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-sm text-center">
                  <div className="text-2xl mb-2">🏠</div>
                  <div>Media unavailable</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover: opacity-100 transition-opacity duration-300"></div>
          
          {property.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
              Featured
            </div>
          )}

          {/* Top right icons - Heart and Share */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button 
              onClick={handleShortlistClick}
              disabled={shortlistLoading}
              className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-200 ${
                  isPropertyShortlisted 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white hover:text-red-400 drop-shadow-md'
                }`} 
              />
            </button>
            
            <button 
              onClick={handleShareClick}
              className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <Send 
                className="w-4 h-4 text-white hover:text-blue-400 drop-shadow-md"
              />
            </button>
          </div>

          {mediaItems.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out hover:bg-white/60 hover:scale-125 hover:-translate-x-1"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out hover:bg-white/60 hover:scale-125 hover:translate-x-1"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {mediaItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`transition-all duration-300 ease-in-out rounded-full hover:scale-125 transform ${
                    index === currentMediaIndex 
                      ? 'bg-white w-6 h-2' 
                      : 'bg-white/50 hover:bg-white/90 w-2 h-2'
                  } ${media.type === 'video' ? 'ring-2 ring-blue-400' : ''}`}
                />
              ))}
            </div>
          )}

          {mediaItems.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out hover:bg-white/40">
            {property.type}
          </div>
        </div>

        {/* Content - Reduced padding for mobile */}
        <div className="p-4 sm:p-6">
          
          
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 hover:from-purple-700 hover:to-blue-700">
              {property.price}
            </div>
            {mediaItems.length > 1 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 transform">
                {mediaItems.filter(m => m.type === 'image').length} photos
                {mediaItems.filter(m => m.type === 'video').length > 0 && (
                  <span className="text-blue-600 ml-1">
                    + {mediaItems.filter(m => m.type === 'video').length} video{mediaItems.filter(m => m.type === 'video').length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight transition-colors duration-300 hover:text-purple-700">
            {property.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-3 sm:mb-4 transition-colors duration-300 hover:text-gray-800">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm truncate">{property.location}</span>
          </div>

          <div className="flex items-center space-x-4 mb-3 sm:mb-4 text-gray-600">
            {!isLandProperty && property.bedrooms && (
              <div className="flex items-center transition-colors duration-300 hover:text-gray-800">
                <Bed className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.bedrooms}</span>
              </div>
            )}
            {!isLandProperty && property.bathrooms && (
              <div className="flex items-center transition-colors duration-300 hover:text-gray-800">
                <Bath className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center transition-colors duration-300 hover:text-gray-800">
              <Square className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.area}</span>
            </div>
            {isLandProperty && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full transition-all duration-300 ease-in-out hover:bg-green-200 hover:scale-105 transform">
                Land
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed transition-colors duration-300 hover:text-gray-800">
            {property.description}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleViewDetails}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              View Details
            </Button>
            <Button 
              variant="outline" 
              className="p-3 border-gray-300 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Share Menu */}
      <EnhancedShareMenu
        isOpen={isShareMenuOpen}
        onClose={() => setIsShareMenuOpen(false)}
        propertyTitle={property.title}
        propertyPrice={property.price}
        propertyLocation={property.location}
        propertyId={property.id}
        propertyImage={mediaItems.find(m => m.type === 'image')?.url || currentMedia?.url}
      />
    </>
  );
};

export default PropertyCard;
