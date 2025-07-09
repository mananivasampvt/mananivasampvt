
import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import PropertyGrid from '@/components/PropertyGrid';
import Footer from '@/components/Footer';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import { SearchFilters } from '@/components/SearchBar';
import { useLocation } from '@/contexts/LocationContext';

const Index = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const { setUserLocation, setUserCoordinates } = useLocation();

  const handleSearch = (filters: SearchFilters) => {
    console.log('Index page received search filters:', filters);
    setSearchFilters(filters);
    
    // Scroll to properties section
    setTimeout(() => {
      const propertiesSection = document.querySelector('#properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLocationDetected = (city: string) => {
    console.log('Location detected in Index:', city);
    setUserLocation(city);
    
    // Auto-search with detected location
    const locationFilters: SearchFilters = {
      location: city,
      propertyType: '',
      category: '',
      subCategory: '',
      manualLocation: city
    };
    
    setSearchFilters(locationFilters);
    
    // Scroll to properties section to show filtered results
    setTimeout(() => {
      const propertiesSection = document.querySelector('#properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000); // Increased delay to allow for better UX flow
  };

  const handleLocationDenied = () => {
    console.log('Location access denied - user will browse manually');
    // No action needed, user continues with manual browsing
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div id="hero">
        <Hero onSearch={handleSearch} />
      </div>
      
      {/* All Properties section */}
      <div id="properties">
        <PropertyGrid searchFilters={searchFilters} />
      </div>
      
      {/* Get Personalized Assistance section - moved up from Categories component */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Let our expert team help you find the perfect property that matches your requirements.
              </p>
              <button 
                onClick={() => {
                  // Navigate to contact page and scroll to form
                  window.location.href = '/contact';
                  setTimeout(() => {
                    const formElement = document.querySelector('form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                      if (messageTextarea) {
                        messageTextarea.value = "Hi, I need personalized help finding a property.";
                        messageTextarea.focus();
                      }
                    }
                  }, 100);
                }}
                className="btn-luxury text-white px-6 sm:px-8 py-3 rounded-full font-medium text-sm sm:text-base hover:scale-105 transition-transform duration-300"
              >
                Get Personalized Assistance
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories section moved to bottom */}
      <Categories />
      
      {/* Location Permission Modal */}
      <LocationPermissionModal
        onLocationDetected={handleLocationDetected}
        onLocationDenied={handleLocationDenied}
      />
      
      <Footer />
    </div>
  );
};

export default Index;
