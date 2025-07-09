import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PropertyCard from './PropertyCard';
import { Heart, ChevronRight, MapPin, Square, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useShortlist } from '@/hooks/useShortlist';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  images: string[];
  area: string;
  description: string;
  featured?: boolean;
}

interface SuggestedPropertiesProps {
  currentPropertyId: string;
  category: string;
  location: string;
}

const SuggestedProperties: React.FC<SuggestedPropertiesProps> = ({
  currentPropertyId,
  category,
  location
}) => {
  const [suggestedProperties, setSuggestedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  const [shareMenuProperty, setShareMenuProperty] = useState<Property | null>(null);
  const navigate = useNavigate();
  const { isShortlisted, toggleShortlist } = useShortlist();

  useEffect(() => {
    fetchSuggestedProperties();
  }, [currentPropertyId, category, location]);

  const fetchSuggestedProperties = async () => {
    try {
      console.log('Fetching suggested properties for category:', category, 'location:', location);
      
      // First try to get properties from same category
      let q = query(
        collection(db, 'properties'),
        where('category', '==', category),
        limit(6)
      );
      
      let querySnapshot = await getDocs(q);
      let properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      // Filter out current property
      properties = properties.filter(prop => prop.id !== currentPropertyId);
      
      // If we don't have enough properties from same category, get from same location
      if (properties.length < 4) {
        const locationQuery = query(
          collection(db, 'properties'),
          where('location', '==', location),
          limit(4)
        );
        
        const locationSnapshot = await getDocs(locationQuery);
        const locationProperties = locationSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];
        
        // Add location-based properties that aren't already included
        locationProperties.forEach(prop => {
          if (prop.id !== currentPropertyId && !properties.find(p => p.id === prop.id)) {
            properties.push(prop);
          }
        });
      }
      
      console.log('Found suggested properties:', properties.length);
      setSuggestedProperties(properties.slice(0, 4));
    } catch (error) {
      console.error('Error fetching suggested properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAll = () => {
    setShowAllOnMobile(true);
  };

  const handleBackToScroll = () => {
    setShowAllOnMobile(false);
  };

  const handlePropertyCardClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
    // Scroll to top of the page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleContactOwner = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    // Open phone dialer with the specified number
    window.location.href = 'tel:9121055512';
  };

  const handleShareClick = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setShareMenuProperty(property);
  };

  const handleShortlistClick = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    await toggleShortlist(propertyId);
  };

  const handleCloseShareMenu = () => {
    setShareMenuProperty(null);
  };

  if (loading || suggestedProperties.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-6 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-4 h-4 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-2 h-2 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-xs sm:text-3xl font-bold text-gray-900">You Might Also Like</h2>
            </div>
            
            {/* See All Button - Hidden on Desktop Grid, Shown on Mobile */}
            <button
              onClick={handleSeeAll}
              className="md:hidden flex items-center gap-1 text-red-600 font-bold text-xs hover:text-red-700 transition-colors duration-200"
            >
              See All
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          {/* Mobile View with "See All" functionality */}
          <div className="md:hidden">
            {!showAllOnMobile ? (
              /* Horizontal Scrollable Compact Cards with Equal Sizing */
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4 px-1">
                {suggestedProperties.slice(0, 6).map((property, index) => (
                  <div
                    key={property.id}
                    className="flex-none w-36 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] cursor-pointer"
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => handlePropertyCardClick(property.id)}
                  >
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-44">
                      {/* Equal Height Image */}
                      <div className="relative h-20 overflow-hidden">
                        <img 
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                          }}
                        />
                        
                        {/* Top right icons - Heart and Share */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button 
                            onClick={(e) => handleShortlistClick(e, property.id)}
                            className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                          >
                            <Heart 
                              className={`w-4 h-4 transition-all duration-200 ${
                                isShortlisted(property.id) 
                                  ? 'text-red-500 fill-red-500' 
                                  : 'text-white hover:text-red-400 drop-shadow-md'
                              }`} 
                            />
                          </button>
                          
                          <button 
                            onClick={(e) => handleShareClick(e, property)}
                            className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                          >
                            <Send 
                              className="w-4 h-4 text-white hover:text-blue-400 drop-shadow-md"
                            />
                          </button>
                        </div>
                      </div>
                      
                      {/* Equal Height Content */}
                      <div className="p-2 h-24 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-gray-900 mb-1 line-clamp-1">{property.price}</div>
                          <h3 className="text-xs font-semibold text-gray-800 mb-1 line-clamp-1 truncate">
                            {property.title}
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="w-2 h-2 mr-1 flex-shrink-0" />
                            <span className="truncate">{property.location}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Square className="w-2 h-2 mr-1 flex-shrink-0" />
                            <span>{property.area}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Mobile Expanded Compact Card Layout with Updated Styling */
              <div className="space-y-4">
                {/* Back Button */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <Button
                    onClick={handleBackToScroll}
                    variant="outline"
                    className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                    Back
                  </Button>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {suggestedProperties.length} properties
                  </div>
                </div>

                {/* Compact Card Layout with Updated Styling */}
                <div className="space-y-3">
                  {suggestedProperties.map((property, index) => (
                    <div 
                      key={property.id} 
                      className="opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" 
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 relative">
                        {/* Top right icons - Heart and Share */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          <button 
                            onClick={(e) => handleShortlistClick(e, property.id)}
                            className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                          >
                            <Heart 
                              className={`w-4 h-4 transition-all duration-200 ${
                                isShortlisted(property.id) 
                                  ? 'text-red-500 fill-red-500' 
                                  : 'text-gray-600 hover:text-red-500'
                              }`} 
                            />
                          </button>
                          
                          <button 
                            onClick={(e) => handleShareClick(e, property)}
                            className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                          >
                            <Send 
                              className="w-4 h-4 text-gray-600 hover:text-blue-500"
                            />
                          </button>
                        </div>

                        {/* Top Section: Thumbnail + Details */}
                        <div className="flex h-20">
                          {/* Thumbnail Image - Slightly wider and shorter */}
                          <div className="w-28 h-20 flex-shrink-0 overflow-hidden">
                            <img 
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                              }}
                            />
                          </div>
                          
                          {/* Property Details */}
                          <div className="flex-1 p-3 pr-16 flex flex-col justify-between">
                            {/* Price */}
                            <div className="text-lg font-bold text-gray-900">
                              {property.price}
                            </div>
                            
                            {/* Title - Fixed visibility issue */}
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 break-words">
                              {property.title}
                            </h3>
                            
                            {/* Location and Area */}
                            <div className="space-y-1 mt-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{property.location}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Carpet Area {property.area}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Section: Action Buttons with increased spacing */}
                        <div className="px-3 pb-3 pt-4">
                          <div className="flex gap-2 w-full">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePropertyCardClick(property.id);
                              }}
                              className="flex-1 text-sm py-2 px-4 bg-transparent text-red-600 border border-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={(e) => handleContactOwner(e, property.id)}
                              className="flex-1 text-sm py-2 px-4 bg-red-600 text-white hover:bg-red-700 rounded-md transition-all duration-200"
                            >
                              Contact Owner
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedProperties.map((property, index) => (
                <div key={property.id} className="fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Share Menu */}
      {shareMenuProperty && (
        <EnhancedShareMenu
          isOpen={true}
          onClose={handleCloseShareMenu}
          propertyTitle={shareMenuProperty.title}
          propertyPrice={shareMenuProperty.price}
          propertyLocation={shareMenuProperty.location}
          propertyId={shareMenuProperty.id}
          propertyImage={shareMenuProperty.images[0]}
        />
      )}
    </>
  );
};

export default SuggestedProperties;
