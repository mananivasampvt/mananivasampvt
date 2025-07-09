
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Heart, Send } from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';
import { useNavigate } from 'react-router-dom';

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
  bedrooms?: number;
  bathrooms?: number;
}

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Add shortlist functionality
  const { isShortlisted, toggleShortlist, isLoading: shortlistLoading } = useShortlist();
  const navigate = useNavigate();

  const categories = ['All', 'For Sale', 'For Rent', 'Commercial', 'PG/Hostels', 'Land'];

  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, selectedCategory]);

  const setupRealtimeListener = () => {
    try {
      console.log('Setting up real-time listener for featured properties...');
      
      // Set up real-time listener for featured properties
      const featuredQuery = query(
        collection(db, 'properties'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      
      const unsubscribe = onSnapshot(
        featuredQuery,
        (querySnapshot) => {
          console.log('Real-time featured properties update received:', querySnapshot.size);
          
          let propertiesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Featured property data:', data);
            
            // Ensure images is always an array with valid URLs
            let validImages: string[] = [];
            if (Array.isArray(data.images)) {
              validImages = data.images.filter(img => {
                if (!img || typeof img !== 'string') return false;
                return img.startsWith('data:image/') || 
                       img.startsWith('https://') || 
                       img.includes('cloudinary.com');
              });
            }
            
            // Skip properties with missing required fields
            if (!data.title || !data.price || !data.location) {
              return null;
            }
            
            return {
              id: doc.id,
              title: data.title,
              price: data.price,
              location: data.location,
              type: data.type || 'Property',
              category: data.category || 'For Sale',
              images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500'],
              area: data.area || 'N/A',
              description: data.description || 'No description available.',
              featured: data.featured || false,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms
            };
          }).filter(Boolean) as Property[];
          
          // If no featured properties, get latest properties instead
          if (propertiesData.length === 0) {
            console.log('No featured properties found, setting up fallback listener...');
            
            const latestQuery = query(
              collection(db, 'properties'),
              orderBy('createdAt', 'desc'),
              limit(8)
            );
            
            const fallbackUnsubscribe = onSnapshot(latestQuery, (fallbackSnapshot) => {
              const fallbackData = fallbackSnapshot.docs.map(doc => {
                const data = doc.data();
                
                let validImages: string[] = [];
                if (Array.isArray(data.images)) {
                  validImages = data.images.filter(img => {
                    if (!img || typeof img !== 'string') return false;
                    return img.startsWith('data:image/') || 
                           img.startsWith('https://') || 
                           img.includes('cloudinary.com');
                  });
                }
                
                if (!data.title || !data.price || !data.location) {
                  return null;
                }
                
                return {
                  id: doc.id,
                  title: data.title,
                  price: data.price,
                  location: data.location,
                  type: data.type || 'Property',
                  category: data.category || 'For Sale',
                  images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500'],
                  area: data.area || 'N/A',
                  description: data.description || 'No description available.',
                  featured: data.featured || false,
                  bedrooms: data.bedrooms,
                  bathrooms: data.bathrooms
                };
              }).filter(Boolean) as Property[];
              
              console.log('Fallback featured properties fetched:', fallbackData);
              setProperties(fallbackData);
              setLoading(false);
            });
            
            return fallbackUnsubscribe;
          } else {
            console.log('Featured properties fetched via real-time:', propertiesData);
            setProperties(propertiesData);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error in featured properties real-time listener:', error);
          setLoading(false);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up featured properties real-time listener:', error);
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (selectedCategory !== 'All') {
      switch (selectedCategory) {
        case 'For Sale':
          filtered = properties.filter(p => p.category.includes('Sale'));
          break;
        case 'For Rent':
          filtered = properties.filter(p => p.category.includes('Rent') && !p.category.includes('PG'));
          break;
        case 'Commercial':
          filtered = properties.filter(p => p.category.includes('Office') || p.category.includes('Commercial'));
          break;
        case 'PG/Hostels':
          filtered = properties.filter(p => p.category.includes('PG'));
          break;
        case 'Land':
          filtered = properties.filter(p => p.category === 'Land' || p.type === 'Land' || p.type === 'Agricultural' || p.type === 'Residential Plot');
          break;
        default:
          filtered = properties;
      }
    }

    setFilteredProperties(filtered);
  };

  // Add shortlist handler
  const handleShortlistClick = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    await toggleShortlist(propertyId);
  };

  // Add view details handler
  const handleViewDetails = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    navigate(`/property/${propertyId}`);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
            Featured Properties
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-2">
            Discover our handpicked selection of premium properties across various categories
          </p>
          
          {/* Category Filter Buttons - Mobile Responsive */}
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Horizontal Scroll */}
            <div className="flex sm:hidden overflow-x-auto pb-2 px-2 -mx-2 space-x-2 snap-x snap-mandatory">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`flex-none px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm snap-center transform hover:scale-105 hover:shadow-md ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'hover:bg-gray-100 hover:border-purple-300'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Desktop: Centered Flex */}
            <div className="hidden sm:flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 text-sm md:text-base transform hover:scale-105 hover:shadow-md ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'hover:bg-gray-100 hover:border-purple-300'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Display */}
        {loading ? (
          // Loading State
          <div>
            {/* Mobile: 2-Column Grid Loading */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 animate-pulse aspect-[3/4]">
                  <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Wider Grid Loading */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-48 lg:h-56 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div>
            {/* Mobile: 2-Column Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
              {filteredProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="fade-in-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div 
                    className="property-card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    onClick={(e) => handleViewDetails(e, property.id)}
                  >
                    {/* Mobile Property Card Content */}
                    <div className="relative h-32 overflow-hidden group">
                      <img 
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                        }}
                      />
                      
                      {/* Featured Badge */}
                      {property.featured && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}

                      {/* Heart Icon - Top Right */}
                      <button 
                        onClick={(e) => handleShortlistClick(e, property.id)}
                        disabled={shortlistLoading}
                        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-all duration-200 ${
                            isShortlisted(property.id) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-white hover:text-red-400 drop-shadow-md'
                          }`} 
                        />
                      </button>

                      {/* Property Type Tag */}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs">
                        {property.type}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Price */}
                      <div className="text-lg font-bold text-gray-900 mb-1">{property.price}</div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <span className="text-xs truncate">{property.location}</span>
                      </div>

                      {/* Area */}
                      <div className="text-xs text-gray-500 mb-3">
                        {property.area}
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={(e) => handleViewDetails(e, property.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-xs py-2 transform hover:scale-105 hover:shadow-md"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Wider 2-Column Grid for larger cards, 3-Column on XL screens */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="fade-in-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center">
              <span className="text-lg sm:text-xl lg:text-2xl">🏠</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">No Properties Found</h3>
            <p className="text-gray-600 mb-4 lg:mb-6 max-w-md mx-auto text-sm sm:text-base">No properties available in this category yet.</p>
            <Button 
              onClick={() => setSelectedCategory('All')} 
              className="px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              View All Properties
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
