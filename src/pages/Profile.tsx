import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, MapPin, Calendar, Mail, LogOut, Home, Search, FileText, Shield, Phone, Send } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertyContactShare from '@/components/PropertyContactShare';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfile {
  username: string;
  email: string;
  createdAt: any;
}

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

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shortlistedProperties, setShortlistedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Scroll to top when profile page loads
    window.scrollTo(0, 0);

    fetchUserProfile();
    fetchShortlistedProperties();
  }, [currentUser, navigate]);

  // Additional effect to ensure scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleSearchClick = () => {
    navigate('/');
    setTimeout(() => {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          // Try to find the search input with improved logic
          const findAndFocusSearchInput = () => {
            // First try mobile input (more likely on mobile devices)
            let searchInput = document.getElementById('search-anything-input-mobile') as HTMLInputElement;
            
            // If mobile not found, try desktop
            if (!searchInput) {
              searchInput = document.getElementById('search-anything-input') as HTMLInputElement;
            }
            
            // If still not found, try by placeholder
            if (!searchInput) {
              searchInput = document.querySelector('input[placeholder*="Enter anything related to properties"]') as HTMLInputElement;
            }
            
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Trigger a click to ensure mobile keyboards appear
              searchInput.click();
              console.log('Successfully focused on search input from Profile page');
              return true;
            }
            
            console.log('Search input not found from Profile page');
            return false;
          };

          // Try immediately
          if (!findAndFocusSearchInput()) {
            // If not found, wait a bit more and try again
            setTimeout(findAndFocusSearchInput, 500);
          }
        }, 800);
      }
    }, 300);
  };

  const handleExploreProperties = () => {
    navigate('/#properties');
  };

  const handleContactOwner = () => {
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

  const handleShare = async (property: Property) => {
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

  const handleProfileIconClick = () => {
    setShowProfilePopup(true);
    setTimeout(() => {
      setShowProfilePopup(false);
    }, 3000);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 ${isMobile ? 'pb-20' : ''}`}>
      <Header />
      
      {/* Mobile Search Bar - Now scrollable instead of sticky */}
      {isMobile && (
        <div className="pt-16 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200/30">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div 
              className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 cursor-pointer"
              onClick={handleSearchClick}
            >
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">LS</span>
              </div>
              <span className="flex-1 text-gray-500 text-sm truncate">Search Property</span>
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            
            {/* Profile Icon with Popup */}
            <div className="relative">
              <div 
                className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                onClick={handleProfileIconClick}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              
              {/* Profile Info Popup */}
              {showProfilePopup && (
                <div className="absolute top-10 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[240px] animate-fade-in">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">
                      Email: {userProfile?.email || currentUser.email || 'user@example.com'}
                    </div>
                    <div className="text-gray-500">
                      Joined: {userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : '29/06/2025'}
                    </div>
                  </div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-white"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section - Adjusted for mobile */}
      <section className={`${isMobile ? 'pt-4' : 'pt-20'} pb-8 md:pb-12 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Desktop Search Bar */}
          {!isMobile && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleSearchClick}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/30 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <Card className="glass border-white/20 shadow-2xl animate-fade-in">
              <CardHeader className="text-center pb-4 md:pb-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <CardTitle className="text-xl md:text-3xl font-bold text-gray-900">
                  {userProfile?.username || currentUser.displayName || 'User'}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Gallery Style Grid Cards - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3 md:p-4 text-center">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500 mx-auto mb-1" />
                      <div className="text-sm md:text-base font-bold text-gray-900">{shortlistedProperties.length}</div>
                      <div className="text-xs text-gray-600">Shortlisted</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3 md:p-4 text-center">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-sm md:text-base font-bold text-gray-900">Account</div>
                      <div className="text-xs text-gray-600">Info</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3 md:p-4 text-center">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-sm md:text-base font-bold text-gray-900">Personal</div>
                      <div className="text-xs text-gray-600">Details</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-3 md:p-4 text-center">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-sm md:text-base font-bold text-gray-900">All</div>
                      <div className="text-xs text-gray-600">Cities</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105 col-span-2 md:col-span-1">
                    <CardContent className="p-3 md:p-4 text-center">
                      <Home className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mx-auto mb-1" />
                      <div className="text-sm md:text-base font-bold text-gray-900">Coverage</div>
                      <div className="text-xs text-gray-600">Area</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shortlisted Properties Section - Mobile Optimized */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Your Shortlisted Properties
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Properties you've saved for later viewing
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 md:hidden">
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
                      onClick={() => handleShare(property)}
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
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                onClick={handleExploreProperties}
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

export default Profile;
