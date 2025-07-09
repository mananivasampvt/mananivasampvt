import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PropertyCard from './PropertyCard';
import { SearchFilters } from './SearchBar';
import { ChevronRight, MapPin, Square, Heart, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealtimeProperties } from '@/hooks/useRealtimeProperties';
import EnhancedShareMenu from '@/components/EnhancedShareMenu';
import { useShortlist } from '@/hooks/useShortlist';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  featured?: boolean;
  status?: string;
  approved?: boolean;
}

interface PropertyGridProps {
  searchFilters?: SearchFilters | null;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ searchFilters }) => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchActive, setSearchActive] = useState(false);
  const [shareMenuState, setShareMenuState] = useState<{isOpen: boolean, propertyId: string | null}>({isOpen: false, propertyId: null});
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Add new state for mobile view
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  
  // Add shortlist functionality
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();

  // Use the optimized real-time properties hook
  const { properties, loading, error, refetch } = useRealtimeProperties({
    includeMetadataChanges: true
  });

  const filters = ['All', 'For Sale', 'For Rent', 'Commercial', 'PG/Hostels', 'Land'];

  useEffect(() => {
    filterProperties();
  }, [properties, selectedFilter, searchFilters]);

  const filterProperties = () => {
    let filtered = properties;

    // Apply search filters first if they exist
    if (searchFilters) {
      setSearchActive(true);
      
      filtered = properties.filter(property => {
        let matches = true;

        // Enhanced comprehensive search - search across multiple property fields
        if (searchFilters.location && searchFilters.location.trim() !== '') {
          const searchTerm = searchFilters.location.toLowerCase();
          const propertyMatches = 
            property.title.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm) ||
            property.category.toLowerCase().includes(searchTerm) ||
            property.type.toLowerCase().includes(searchTerm) ||
            property.description?.toLowerCase().includes(searchTerm) ||
            property.area?.toLowerCase().includes(searchTerm) ||
            (property.bedrooms && property.bedrooms.toString().includes(searchTerm)) ||
            (property.bathrooms && property.bathrooms.toString().includes(searchTerm)) ||
            property.price.toLowerCase().includes(searchTerm);
          
          matches = matches && propertyMatches;
        }

        // Property type filter
        if (searchFilters.propertyType && searchFilters.propertyType !== '') {
          matches = matches && (
            property.type.toLowerCase().includes(searchFilters.propertyType.toLowerCase()) ||
            property.type.toLowerCase() === searchFilters.propertyType.toLowerCase()
          );
        }

        // Category filter
        if (searchFilters.category && searchFilters.category !== '') {
          matches = matches && property.category === searchFilters.category;
        }

        return matches;
      });

      console.log('Search results:', filtered);
    } else {
      setSearchActive(false);
      
      // Apply category filter
      if (selectedFilter !== 'All') {
        switch (selectedFilter) {
          case 'For Sale':
            filtered = properties.filter(p => 
              p.category?.includes('Sale') || 
              p.category === 'For Sale'
            );
            break;
          case 'For Rent':
            filtered = properties.filter(p => 
              p.category?.includes('Rent') && 
              !p.category?.includes('PG')
            );
            break;
          case 'Commercial':
            filtered = properties.filter(p => 
              p.category?.includes('Office') || 
              p.category?.includes('Commercial') ||
              p.category === 'Commercial'
            );
            break;
          case 'PG/Hostels':
            filtered = properties.filter(p => 
              p.category?.includes('PG') ||
              p.category === 'PG/Hostels'
            );
            break;
          case 'Land':
            filtered = properties.filter(p => 
              p.category === 'Land' ||
              p.type === 'Land' ||
              p.type === 'Agricultural' ||
              p.type === 'Residential Plot'
            );
            break;
          default:
            filtered = properties;
        }
      }
    }

    console.log('Final filtered properties:', filtered);
    setFilteredProperties(filtered);
  };

  const clearSearch = () => {
    setSearchActive(false);
    setSelectedFilter('All');
    setShowAllOnMobile(false);
    filterProperties();
  };

  const handleSeeAll = () => {
    setShowAllOnMobile(true);
  };

  const handleBackToScroll = () => {
    setShowAllOnMobile(false);
  };

  // Helper function to handle mobile card tap
  const handleMobileCardTap = (propertyId: string, e: React.MouseEvent) => {
    // Only handle mobile taps and prevent if clicking on interactive elements
    if (!isMobile) return;
    
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button, a, input, select, textarea');
    
    if (!isInteractiveElement) {
      navigate(`/property/${propertyId}`);
    }
  };

  // Helper function to handle contact owner call
  const handleContactOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = 'tel:9121055512';
  };

  const handleShareClick = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    setShareMenuState({isOpen: true, propertyId});
  };

  const handleCloseShareMenu = () => {
    setShareMenuState({isOpen: false, propertyId: null});
  };

  // Add shortlist handler
  const handleShortlistClick = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    await toggleShortlist(propertyId);
  };

  const getSelectedProperty = () => {
    return filteredProperties.find(p => p.id === shareMenuState.propertyId);
  };

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            {searchActive ? 'Search Results' : 'All Properties'}
          </h2>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
            {searchActive 
              ? `Found ${filteredProperties.length} properties matching your search`
              : 'Explore our complete collection of properties across all categories'
            }
          </p>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-3 sm:mt-6 rounded-full"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
            <Button
              onClick={refetch}
              className="ml-4 text-sm bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Search Active Indicator */}
        {searchActive && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-8 text-center flex items-center justify-center gap-4">
            <span>Search filters active</span>
            <Button
              onClick={clearSearch}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Enhanced Filter Tabs - Mobile Optimized */}
        {!searchActive && (
          <div className="mb-8 sm:mb-12">
            {/* Mobile: Horizontal Scrollable Buttons */}
            <div className="flex sm:hidden overflow-x-auto scrollbar-hide gap-2 pb-2 px-1 snap-x snap-mandatory">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-none px-3 py-2 rounded-full font-medium transition-all duration-300 text-xs snap-center transform hover:scale-105 hover:shadow-md ${
                    selectedFilter === filter 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Desktop: Centered Layout */}
            <div className="hidden sm:flex flex-wrap justify-center gap-3 lg:gap-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                    selectedFilter === filter 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Properties Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 lg:h-56 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
              {!showAllOnMobile ? (
                <div className="relative">
                  {/* Header with See All Button */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                    <button
                      onClick={handleSeeAll}
                      className="flex items-center gap-1 text-red-600 font-bold text-sm hover:text-red-700 transition-colors duration-200"
                    >
                      See All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Horizontal Scrollable Mini Cards */}
                  <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 px-1">
                    {filteredProperties.slice(0, 10).map((property, index) => (
                      <div
                        key={property.id}
                        className="flex-none w-48 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] cursor-pointer"
                        style={{animationDelay: `${index * 0.1}s`}}
                        onClick={(e) => handleMobileCardTap(property.id, e)}
                      >
                        {/* Mini Property Card */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md active:scale-95">
                          {/* Image */}
                          <div className="relative h-32 overflow-hidden">
                            <img 
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                              }}
                            />
                            {property.featured && (
                              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                Featured
                              </div>
                            )}
                            
                            {/* Top right icons - Heart and Share */}
                            <div className="absolute top-2 right-2 flex gap-1">
                              {/* Heart Icon */}
                              <button 
                                onClick={(e) => handleShortlistClick(e, property.id)}
                                disabled={shortlistLoading}
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
                              
                              {/* Share Icon */}
                              <button 
                                onClick={(e) => handleShareClick(e, property.id)}
                                className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                              >
                                <Send 
                                  className="w-4 h-4 text-white hover:text-blue-400 drop-shadow-md"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3">
                            {/* Add Property Title */}
                            <div className="text-xs font-medium text-gray-700 mb-1 truncate">
                              {property.title}
                            </div>
                            <div className="text-lg font-bold text-gray-900 mb-1">{property.price}</div>
                            <div className="text-xs text-gray-600 mb-1 flex items-center">
                              <Square className="w-3 h-3 mr-1" />
                              {property.area}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{property.location}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Mobile Expanded List View - Updated with Fixed Share Icon Position */
                <div className="space-y-4">
                  {/* Back Button */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      onClick={handleBackToScroll}
                      variant="outline"
                      className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back
                    </Button>
                    <div className="text-sm text-gray-600">
                      {filteredProperties.length} properties
                    </div>
                  </div>

                  {/* Updated Property Cards Layout - Fixed Share Icon Position */}
                  <div className="space-y-2">
                    {filteredProperties.map((property, index) => (
                      <div 
                        key={property.id} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] relative" 
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        {/* Top right icons - Heart and Share */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          {/* Heart Icon */}
                          <button 
                            onClick={(e) => handleShortlistClick(e, property.id)}
                            disabled={shortlistLoading}
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
                          
                          {/* Share Icon */}
                          <button 
                            onClick={(e) => handleShareClick(e, property.id)}
                            className="w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                          >
                            <Send 
                              className="w-4 h-4 text-gray-600 hover:text-blue-500"
                            />
                          </button>
                        </div>

                        {/* Main Card Content - Horizontal Layout */}
                        <div className="flex">
                          {/* Left: Larger Thumbnail Image */}
                          <div className="w-28 h-20 flex-shrink-0 bg-gray-100">
                            <img 
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                              }}
                            />
                          </div>

                          {/* Right: Content Section */}
                          <div className="flex-1 px-3 py-1.5 flex flex-col pr-12">
                            {/* Top Section: Price */}
                            <div className="mb-1.5">
                              <div className="text-lg font-bold text-gray-900">{property.price}</div>
                            </div>

                            {/* Title */}
                            <div className="mb-1.5">
                              <h3 className="text-sm font-medium text-gray-800 leading-tight line-clamp-1">
                                {property.title}
                              </h3>
                            </div>

                            {/* Middle Section: Location and Area */}
                            <div className="space-y-0.5">
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{property.location}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">Carpet Area </span>
                                <span className="font-medium">{property.area}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Bottom Row for Action Buttons */}
                        <div className="border-t border-gray-100 px-3 py-2">
                          <div className="flex gap-3">
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/property/${property.id}`);
                              }}
                              variant="outline"
                              className="flex-1 h-8 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-600 rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View Details
                            </Button>
                            <Button 
                              onClick={handleContactOwner}
                              className="flex-1 h-8 text-sm bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Contact Owner
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Grid View - Enhanced with Mobile Tap Support */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={isMobile ? (e) => handleMobileCardTap(property.id, e) : undefined}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center hover:bg-gray-300 transition-colors duration-300">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchActive ? 'No Properties Found' : 'No Properties Available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchActive 
                ? 'Try adjusting your search filters to find more properties.'
                : 'No properties have been added yet. Check back later!'
              }
            </p>
            <Button 
              onClick={searchActive ? clearSearch : refetch}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {searchActive ? 'Clear Search' : 'Refresh'}
            </Button>
          </div>
        )}

        {/* Enhanced Load More Button - Hide on mobile when in scroll view */}
        {!loading && filteredProperties.length > 0 && filteredProperties.length >= 6 && (!showAllOnMobile || window.innerWidth >= 768) && (
          <div className="text-center mt-12 hidden md:block">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Load More Properties
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Share Menu */}
      {shareMenuState.propertyId && getSelectedProperty() && (
        <EnhancedShareMenu
          isOpen={shareMenuState.isOpen}
          onClose={handleCloseShareMenu}
          propertyTitle={getSelectedProperty()!.title}
          propertyPrice={getSelectedProperty()!.price}
          propertyLocation={getSelectedProperty()!.location}
          propertyId={shareMenuState.propertyId}
          propertyImage={getSelectedProperty()!.images[0]}
        />
      )}
    </section>
  );
};

export default PropertyGrid;
