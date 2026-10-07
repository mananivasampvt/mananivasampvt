import React, { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Square, Phone, ChevronLeft, ChevronRight, Send, Play, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useShortlist } from '@/hooks/useShortlist';
import { useContactOwner } from '@/hooks/useContactOwner';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';
import { combineMediaItems, MediaItem, isVideoUrl, getVideoThumbnail } from '@/lib/mediaUtils';
import { formatPropertyDate } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    fullAddress?: string;
    type: string;
    images: string[];
    videos?: string[];
    bedrooms?: number;
    bathrooms?: number;
    area: string;
    areaAcres?: number;
    description: string;
    featured?: boolean;
    category?: string;
    propertyAge?: number;
    status?: string;
    createdAt?: any;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();
  const { handleContactOwner } = useContactOwner({ propertyId: property.id });
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
        className="property-card flex flex-col gap-3 group cursor-pointer transition-all duration-300 hover:-translate-y-1"
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative h-56 sm:h-64 lg:h-56 xl:h-64 w-full overflow-hidden rounded-2xl">
          <div className="relative w-full h-full">
            {currentMedia?.type === 'video' ? (
              <div className="relative w-full h-full">
                <img 
                  src={currentMedia.thumbnail || getVideoThumbnail(currentMedia.url)}
                  alt={`${property.title} - Video ${currentMediaIndex + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <img 
                src={currentImageUrl}
                alt={`${property.title} - Image ${currentMediaIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            )}
            
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {imageError && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
                Media unavailable
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Top Left Badge */}
          {property.propertyAge === 0 && (
            <div className="absolute top-3 left-3 bg-[#059669] text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-sm">
              <span className="text-[10px]">✨</span> Newly Constructed
            </div>
          )}

          {/* Top Right Icons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button 
              onClick={handleShortlistClick}
              disabled={shortlistLoading}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/60"
            >
              <Heart 
                className={`w-4 h-4 ${isPropertyShortlisted ? 'text-white fill-white' : 'text-white'}`} 
              />
            </button>
            <button 
              onClick={handleShareClick}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/60"
            >
              <Send className="w-4 h-4 text-white -ml-0.5 mt-0.5" />
            </button>
          </div>

          {/* Bottom Left Timestamp Badge */}
          {property.createdAt && formatPropertyDate(property.createdAt) && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 max-w-[90%] bg-white/20 backdrop-blur-md border border-white/30 text-white px-2 py-1 rounded-lg text-[9px] sm:text-[11px] leading-tight font-semibold flex items-start sm:items-center gap-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/30">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 mt-[1px] sm:mt-0 drop-shadow-md" />
              <span className="drop-shadow-md tracking-wide line-clamp-2 sm:line-clamp-1">{formatPropertyDate(property.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-1">
          <h3 className="text-[17px] font-bold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          
          <div className="text-base font-bold text-[#16a34a] mt-1">
            {property.price}
          </div>
          
          <div className="flex items-center justify-between text-[13px] text-gray-500 mt-2">
            <div className="flex items-center truncate mr-2">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
            <div className="flex-shrink-0 whitespace-nowrap">
              {property.area} {property.areaAcres ? `(${property.areaAcres} acres)` : ''}
            </div>
          </div>
        </div>
      </div>

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
