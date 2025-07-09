import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import PropertyOverview from '@/components/PropertyOverview';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyMap from '@/components/PropertyMap';
import PropertyContact from '@/components/PropertyContact';
import SuggestedProperties from '@/components/SuggestedProperties';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Home, ImageIcon, MapIcon, Phone } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  images: string[];
  videos?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  highlights?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: any;
  facing?: string;
  amenities?: string[];
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  // Add scroll to top effect when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProperty = async (propertyId: string) => {
    try {
      console.log('Fetching property with ID:', propertyId);
      const docRef = doc(db, 'properties', propertyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const propertyData = {
          id: docSnap.id,
          ...docSnap.data()
        } as Property;
        console.log('Property data fetched:', propertyData);
        setProperty(propertyData);
      } else {
        setError('Property not found');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-xl mb-4 w-full sm:w-1/4"></div>
            <div className="h-48 sm:h-64 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="h-4 bg-gray-200 rounded-xl mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-xl w-full sm:w-2/3"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-premium">Property Not Found</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6 font-body">{error || 'The property you are looking for does not exist.'}</p>
              <Button onClick={handleBackClick} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-body">
      <Header />
      
      {/* Navigation - Back button with icon for mobile */}
      <section className="pt-16 sm:pt-20 pb-1 sm:pb-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="mb-1 sm:mb-4 flex items-center gap-2 hover:bg-gray-100 rounded-xl border-gray-200 transition-all duration-200 text-sm sm:text-base font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Properties</span>
          </Button>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-8">
          {/* Main Content Area - Mobile First Order */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            
            {/* 1. Image Gallery - First on Mobile */}
            <Card className="overflow-hidden shadow-soft-lg rounded-2xl">
              <CardContent className="p-1 sm:p-6">
                <PropertyImageGallery 
                  images={property.images} 
                  videos={property.videos} 
                  title={property.title} 
                />
              </CardContent>
            </Card>

            {/* 2. Compact Property Info Card - Second on Mobile */}
            <Card className="shadow-soft-lg rounded-2xl lg:hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="space-y-2 sm:space-y-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight font-premium line-clamp-2">
                    {property.title}
                  </h1>
                  <div className="flex items-start gap-1 text-gray-600">
                    <MapPin className="w-3 h-3 mr-0.5 mt-0.5 flex-shrink-0 text-blue-600" />
                    <span className="text-sm sm:text-sm font-medium">{property.location}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-premium">
                    {property.price}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 sm:px-2 sm:py-1 rounded-lg text-xs font-semibold shadow-elegant">
                      {property.type}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 sm:px-2 sm:py-1 rounded-lg text-xs font-semibold shadow-elegant">
                      {property.category}
                    </span>
                  </div>
                  {property.createdAt && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 sm:px-2 sm:py-1 rounded-lg mt-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      Listed on {new Date(property.createdAt.toDate()).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. Tabbed Content Sections with improved mobile spacing */}
            <Card className="shadow-soft-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-50/50 p-1 m-3 sm:m-6 mb-0 rounded-xl">
                    <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 rounded-lg font-medium text-xs sm:text-sm">
                      <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Overview</span>
                      <span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="amenities" className="flex items-center gap-1 sm:gap-2 rounded-lg font-medium text-xs sm:text-sm">
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Amenities</span>
                      <span className="sm:hidden">Features</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-1 sm:gap-2 rounded-lg font-medium text-xs sm:text-sm">
                      <MapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Location</span>
                      <span className="sm:hidden">Map</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center gap-1 sm:gap-2 rounded-lg font-medium text-xs sm:text-sm">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      Contact
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-4 sm:p-6 pt-3 sm:pt-4 mt-3 sm:mt-2">
                    <PropertyOverview property={property} />
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="p-4 sm:p-6 pt-3 sm:pt-4 mt-3 sm:mt-2">
                    {property.amenities && property.amenities.length > 0 ? (
                      <PropertyAmenities amenities={property.amenities} />
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500 font-medium">No amenities listed for this property.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="map" className="p-0 mt-3 sm:mt-2">
                    <div className="min-h-[300px] sm:h-80 lg:h-96">
                      <PropertyMap location={property.location} title={property.title} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="p-4 sm:p-6 pt-3 sm:pt-4 mt-3 sm:mt-2">
                    <PropertyContact 
                      contactName={property.contactName}
                      contactPhone={property.contactPhone}
                      contactEmail={property.contactEmail}
                      propertyTitle={property.title}
                      propertyLocation={property.location}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Sidebar - Hidden on mobile and simplified */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Key Information Card - Desktop Only */}
            <Card className="shadow-soft-lg rounded-2xl sticky top-24">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight font-premium">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
                    <span className="text-sm font-medium">{property.location}</span>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 font-premium">
                    {property.price}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-xl text-sm font-semibold shadow-elegant">
                      {property.type}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-semibold shadow-elegant">
                      {property.category}
                    </span>
                  </div>
                  {property.createdAt && (
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                      <Calendar className="w-4 h-4 mr-2" />
                      Listed on {new Date(property.createdAt.toDate()).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Suggested Properties */}
      <SuggestedProperties 
        currentPropertyId={property.id}
        category={property.category}
        location={property.location}
      />

      <Footer />
    </div>
  );
};

export default PropertyDetails;
