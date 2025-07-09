
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowLeft, Phone, Send } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertyContactShare from '@/components/PropertyContactShare';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  featured?: boolean;
  category?: string;
}

const Shortlist = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shortlistedProperties, setShortlistedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchShortlistedProperties();
  }, [currentUser, navigate]);

  // Scroll to top when component mounts to fix navigation behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchShortlistedProperties = async () => {
    if (!currentUser) return;

    try {
      const shortlistQuery = query(
        collection(db, 'users', currentUser.uid, 'shortlisted')
      );
      const shortlistSnapshot = await getDocs(shortlistQuery);
      const propertyIds = shortlistSnapshot.docs.map(doc => doc.id);

      if (propertyIds.length === 0) {
        setShortlistedProperties([]);
        setLoading(false);
        return;
      }

      const propertiesQuery = query(
        collection(db, 'properties'),
        where('__name__', 'in', propertyIds)
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const properties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property));

      setShortlistedProperties(properties);
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
      toast({
        title: "Error",
        description: "Failed to load shortlisted properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = '9121055512';
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber);
      toast({
        title: "Phone number copied",
        description: `${phoneNumber} copied to clipboard`,
      });
    }
  };

  const handleShare = async (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} - ${property.price}`,
      url: window.location.origin + `/property/${property.id}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied",
          description: "Property link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied",
          description: "Property link copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Error",
          description: "Unable to share property",
          variant: "destructive",
        });
      }
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20 md:pb-0">
      <Header />
      
      {/* Mobile Header */}
      <div className="pt-16 pb-4 md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Shortlist
            </h1>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <section className="pt-20 pb-12 relative overflow-hidden hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Shortlist</h1>
            <p className="text-lg text-gray-600">Your saved properties</p>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-4 flex">
                  <div className="w-24 h-20 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : shortlistedProperties.length > 0 ? (
            <>
              {/* Mobile Layout - Compact Row Cards */}
              <div className="md:hidden space-y-3">
                {shortlistedProperties.map((property, index) => (
                  <div 
                    key={property.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] relative" 
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    {/* Share Button - Top Right Corner */}
                    <button
                      onClick={(e) => handleShare(property, e)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
                    >
                      <Send className="w-3.5 h-3.5 text-gray-600" />
                    </button>

                    <div className="flex">
                      <div className="w-20 h-16 flex-shrink-0 bg-gray-100 rounded-l-xl overflow-hidden">
                        <img 
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500';
                          }}
                        />
                      </div>
                      <div className="flex-1 px-3 py-2">
                        <div className="text-base font-bold text-gray-900 mb-1">{property.price}</div>
                        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="text-xs text-gray-600 mb-0.5">{property.location}</div>
                        <div className="text-xs text-gray-500">{property.area}</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Reduced padding */}
                    <div className="border-t border-gray-100 px-3 py-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => navigate(`/property/${property.id}`)}
                          variant="outline"
                          className="flex-1 h-8 text-xs border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 rounded-full font-medium"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={handleContactOwner}
                          className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white rounded-full font-medium"
                        >
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Layout - Grid Cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedProperties.map((property, index) => (
                  <div 
                    key={property.id} 
                    className="opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" 
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No activity yet</h3>
              <p className="text-gray-500 mb-6">Start exploring and save your favorite properties!</p>
              <Button 
                onClick={() => navigate('/#properties')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Explore Properties
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shortlist;
