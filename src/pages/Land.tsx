
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MapPin, Home, ChevronRight, Square, Heart, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';
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
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  featured?: boolean;
}

const Land = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  const [shareMenuState, setShareMenuState] = useState<{isOpen: boolean, propertyId: string | null}>({isOpen: false, propertyId: null});
  const navigate = useNavigate();
  const { locationData } = usePropertyLocations();
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchQuery, selectedType, manualSearchQuery]);

  const fetchProperties = async () => {
    try {
      const allPropertiesQuery = query(collection(db, 'properties'));
      const querySnapshot = await getDocs(allPropertiesQuery);
      
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      const landProperties = propertiesData.filter(property => 
        property.category === 'Land' || 
        property.type === 'Land' || 
        property.type === 'Agricultural' || 
        property.type === 'Residential Plot'
      );
      
      setProperties(landProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    // Check both dropdown search query and manual search query
    const effectiveSearchQuery = manualSearchQuery.trim() || searchQuery;
    
    if (effectiveSearchQuery) {
      const searchTerm = effectiveSearchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.category.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.area?.toLowerCase().includes(searchTerm) ||
        (property.bedrooms && property.bedrooms.toString().includes(searchTerm)) ||
        (property.bathrooms && property.bathrooms.toString().includes(searchTerm)) ||
        property.price.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property => 
        property.category === selectedType || property.type === selectedType
      );
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = () => {
    filterProperties();
    
    setTimeout(() => {
      const resultsSection = document.querySelector('#properties-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSeeAll = () => {
    setShowAllOnMobile(true);
  };

  const handleBackToScroll = () => {
    setShowAllOnMobile(false);
  };

  const handleCardClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContactOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = 'tel:9121055512';
  };

  const handleShareClick = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    setShareMenuState({isOpen: true, propertyId});
  };

  const handleShortlistClick = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    await toggleShortlist(propertyId);
  };

  const handleCloseShareMenu = () => {
    setShareMenuState({isOpen: false, propertyId: null});
  };

  const getSelectedProperty = () => {
    return filteredProperties.find(p => p.id === shareMenuState.propertyId);
  };

  const propertyTypes = ['all', 'Agricultural', 'Residential Plot', 'Commercial Land'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-16 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Land for
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Sale
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Discover prime land opportunities for agriculture, residential, and commercial development
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select 
                  value={searchQuery || 'all-locations'} 
                  onValueChange={(value) => setSearchQuery(value === 'all-locations' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-12 bg-white/90 border-white/30">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <SelectValue placeholder="Select Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                    <SelectItem value="all-locations" className="text-gray-600">
                      All Locations
                    </SelectItem>
                    {locationData.locations.map((location, index) => (
                      <SelectItem key={index} value={location} className="text-gray-900">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  placeholder="Enter anything related to properties to search…"
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-full h-12 bg-white/90 border-white/30 rounded-lg text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg bg-white/90 border border-white/30 text-gray-900"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 btn-luxury text-white font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section id="properties-section" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {filteredProperties.length} Land Properties
                      </h3>
                      <button
                        onClick={handleSeeAll}
                        className="flex items-center gap-1 text-red-600 font-bold text-sm hover:text-red-700 transition-colors duration-200"
                      >
                        See All
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 px-1">
                      {filteredProperties.slice(0, 10).map((property, index) => (
                        <div
                          key={property.id}
                          className="flex-none w-48 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] cursor-pointer"
                          style={{animationDelay: `${index * 0.1}s`}}
                          onClick={() => handleCardClick(property.id)}
                        >
                          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                            <div className="relative h-32 overflow-hidden">
                              <img 
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=500';
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
                                  className="w-5 h-5 flex items-center justify-center z-10"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <Heart 
                                    className={`w-4 h-4 ${
                                      isShortlisted(property.id) 
                                        ? 'text-red-500 fill-red-500' 
                                        : 'text-white'
                                    }`} 
                                  />
                                </button>
                                
                                {/* Share Icon */}
                                <button
                                  onClick={(e) => handleShareClick(e, property.id)}
                                  className="w-5 h-5 flex items-center justify-center z-10"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <Send className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>

                            <div className="p-3">
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
                  /* Mobile Expanded List View - Updated to match PropertyGrid */
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

                    {/* Updated Property Cards Layout - With Larger Thumbnail */}
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
                              className="w-5 h-5 flex items-center justify-center"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  isShortlisted(property.id) 
                                    ? 'text-red-500 fill-red-500' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            </button>
                            
                            {/* Share Icon */}
                            <button 
                              onClick={(e) => handleShareClick(e, property.id)}
                              className="w-5 h-5 flex items-center justify-center"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Send className="w-4 h-4 text-gray-600" />
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
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=500';
                                }}
                              />
                            </div>

                            {/* Right: Content Section */}
                            <div className="flex-1 px-3 py-1.5 flex flex-col pr-10">
                              {/* Top Section: Price and Title */}
                              <div className="mb-1.5">
                                <div className="text-lg font-bold text-gray-900 mb-0.5">{property.price}</div>
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

              {/* Desktop Grid View */}
              <div className="hidden md:block">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {filteredProperties.length} Land Properties Found
                  </h2>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties.map((property, index) => (
                    <div key={property.id} className="fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Land Properties Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all properties.</p>
              <Button onClick={() => {setSearchQuery(''); setManualSearchQuery(''); setSelectedType('all');}}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

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

      <Footer />
    </div>
  );
};

export default Land;
