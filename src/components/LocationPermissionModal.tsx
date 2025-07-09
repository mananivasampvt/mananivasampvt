import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Clock, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationPermissionModalProps {
  onLocationDetected: (city: string) => void;
  onLocationDenied: () => void;
}

interface LocationPermissionModalState {
  isVisible: boolean;
  hasBeenShown: boolean;
  selectedOption: 'allow' | 'session' | 'deny' | null;
  isDetecting: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  onLocationDetected,
  onLocationDenied
}) => {
  const [modalState, setModalState] = useState<LocationPermissionModalState>({
    isVisible: false,
    hasBeenShown: false,
    selectedOption: null,
    isDetecting: false
  });

  const { toast } = useToast();

  // Check if modal should be shown on component mount
  useEffect(() => {
    const hasShownLocationModal = sessionStorage.getItem('hasShownLocationModal');
    const hasExistingLocation = localStorage.getItem('userLocation') || sessionStorage.getItem('userLocation');
    
    // Function to check if device is mobile
    const isMobileDevice = () => {
      return window.innerWidth <= 1024 || 
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    // Only show modal on mobile devices, if not shown in this session, and no existing location
    if (!hasShownLocationModal && !hasExistingLocation && isMobileDevice()) {
      // Wait for the logo to load first
      const logoImage = document.querySelector('img[alt="Mana Nivasam Logo"]') as HTMLImageElement;
      
      const showModalAfterLogo = () => {
        setModalState(prev => ({
          ...prev,
          isVisible: true
        }));
      };

      if (logoImage) {
        if (logoImage.complete && logoImage.naturalHeight !== 0) {
          // Logo is already loaded
          setTimeout(showModalAfterLogo, 500); // Small delay after logo is loaded
        } else {
          // Wait for logo to load
          logoImage.addEventListener('load', () => {
            setTimeout(showModalAfterLogo, 500); // Small delay after logo loads
          });
          
          logoImage.addEventListener('error', () => {
            // If logo fails to load, still show modal after timeout
            setTimeout(showModalAfterLogo, 2000);
          });
        }
      } else {
        // Fallback: if logo element not found, wait for DOM to be ready
        const checkForLogo = () => {
          const logo = document.querySelector('img[alt="Mana Nivasam Logo"]') as HTMLImageElement;
          if (logo) {
            if (logo.complete && logo.naturalHeight !== 0) {
              setTimeout(showModalAfterLogo, 500);
            } else {
              logo.addEventListener('load', () => {
                setTimeout(showModalAfterLogo, 500);
              });
            }
          } else {
            // If still no logo found, show modal after timeout
            setTimeout(showModalAfterLogo, 3000);
          }
        };
        
        setTimeout(checkForLogo, 1000);
      }
    }
  }, []);

  // Function to get user's location coordinates
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Function to convert coordinates to city using geocoding API
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      // Extract city name from response
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.suburb ||
                   data.address?.state_district ||
                   data.address?.state ||
                   'Unknown Location';
      
      return city;
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to a generic location
      return 'Current Location';
    }
  };

  // Handle location detection process
  const handleLocationDetection = async (storageType: 'localStorage' | 'sessionStorage' | null) => {
    setModalState(prev => ({ ...prev, isDetecting: true }));

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log('Location detected:', { latitude, longitude });
      
      const city = await getCityFromCoordinates(latitude, longitude);
      
      // Store location based on user's choice
      if (storageType === 'localStorage') {
        localStorage.setItem('userLocation', city);
        localStorage.setItem('userCoordinates', JSON.stringify({ latitude, longitude }));
      } else if (storageType === 'sessionStorage') {
        sessionStorage.setItem('userLocation', city);
        sessionStorage.setItem('userCoordinates', JSON.stringify({ latitude, longitude }));
      }
      
      toast({
        title: "Location Detected",
        description: `Your location has been set to ${city}. Showing properties in your area.`,
        duration: 4000,
      });

      onLocationDetected(city);
      closeModal();
      
    } catch (error) {
      console.error('Location detection failed:', error);
      
      let errorMessage = 'Unable to detect your location. ';
      if (error instanceof Error) {
        if (error.message.includes('denied')) {
          errorMessage += 'Location access was denied.';
        } else if (error.message.includes('unavailable')) {
          errorMessage += 'Location service is unavailable.';
        } else if (error.message.includes('timeout')) {
          errorMessage += 'Location request timed out.';
        } else {
          errorMessage += 'Please enable location services and try again.';
        }
      }
      
      toast({
        title: "Location Detection Failed",
        description: errorMessage,
        variant: "destructive",
      });

      onLocationDenied();
      closeModal();
    } finally {
      setModalState(prev => ({ ...prev, isDetecting: false }));
    }
  };

  // Handle button clicks
  const handleAllowLocationAccess = () => {
    setModalState(prev => ({ ...prev, selectedOption: 'allow' }));
    handleLocationDetection('localStorage');
  };

  const handleOnlyWhileUsingApp = () => {
    setModalState(prev => ({ ...prev, selectedOption: 'session' }));
    handleLocationDetection('sessionStorage');
  };

  const handleDontAllow = () => {
    setModalState(prev => ({ ...prev, selectedOption: 'deny' }));
    onLocationDenied();
    closeModal();
  };

  const closeModal = () => {
    // Mark as shown in session to prevent showing again
    sessionStorage.setItem('hasShownLocationModal', 'true');
    
    setModalState(prev => ({
      ...prev,
      isVisible: false,
      hasBeenShown: true
    }));
  };

  // Don't render if not visible
  if (!modalState.isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-all duration-300 ease-out"
        onClick={closeModal}
        style={{
          animation: modalState.isVisible ? 'fade-in 0.3s ease-out forwards' : undefined
        }}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm mx-auto pointer-events-auto transform transition-all duration-300 ease-out min-h-[360px]"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: modalState.isVisible ? 'slide-up-fade-in 0.4s ease-out forwards' : undefined
          }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
            
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Navigation className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Location Access
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed px-2">
                We'd like to access your location to show properties near you. Choose how you'd like to share your location.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            {/* Allow Location Access */}
            <Button
              onClick={handleAllowLocationAccess}
              disabled={modalState.isDetecting}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
            >
              {modalState.isDetecting && modalState.selectedOption === 'allow' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting Location...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </>
              )}
            </Button>
            
            {/* Only While Using the App */}
            <Button
              onClick={handleOnlyWhileUsingApp}
              disabled={modalState.isDetecting}
              variant="outline"
              className="w-full h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
            >
              {modalState.isDetecting && modalState.selectedOption === 'session' ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Detecting Location...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Only While Using the App</span>
                </>
              )}
            </Button>
            
            {/* Don't Allow */}
            <Button
              onClick={handleDontAllow}
              disabled={modalState.isDetecting}
              variant="ghost"
              className="w-full h-12 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              Don't Allow
            </Button>
          </div>
          
          {/* Footer Note */}
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Your location data is used only to filter properties and enhance your browsing experience.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default LocationPermissionModal;
