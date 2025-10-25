import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Clock, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDeviceInfo, logDeviceInfo, isAndroidWebView } from '@/utils/deviceDetection';

interface LocationPermissionModalProps {
  onLocationDetected: (city: string) => void;
  onLocationDenied: () => void;
  showOnAllDevices?: boolean; // Optional prop to show on all devices
}

interface LocationPermissionModalState {
  isVisible: boolean;
  hasBeenShown: boolean;
  selectedOption: 'allow' | 'session' | 'deny' | null;
  isDetecting: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  onLocationDetected,
  onLocationDenied,
  showOnAllDevices = false // Default to false for mobile-only behavior
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
    // Log device information for debugging
    logDeviceInfo();
    
    const hasShownLocationModal = sessionStorage.getItem('hasShownLocationModal');
    const hasExistingLocation = localStorage.getItem('userLocation') || sessionStorage.getItem('userLocation');
    
    // Get device info
    const deviceInfo = getDeviceInfo();
    
    console.log('Location modal debug:', {
      hasShownLocationModal,
      hasExistingLocation,
      deviceInfo,
      windowWidth: window.innerWidth,
      userAgent: navigator.userAgent
    });
    
    // Cleanup function to prevent memory leaks
    let observers: (MutationObserver | IntersectionObserver)[] = [];
    let timeouts: NodeJS.Timeout[] = [];
    
    const cleanup = () => {
      observers.forEach(observer => observer.disconnect());
      timeouts.forEach(timeout => clearTimeout(timeout));
      observers = [];
      timeouts = [];
    };
    
    // Show modal if not shown in this session, no existing location, and on mobile (or all devices if configured)
    if (!hasShownLocationModal && !hasExistingLocation && (showOnAllDevices || deviceInfo.isMobile)) {
      console.log('Modal conditions met, setting up logo detection...');
      
      const showModalAfterLogo = () => {
        console.log('Showing location modal after logo load');
        cleanup(); // Clean up observers and timeouts
        setModalState(prev => ({
          ...prev,
          isVisible: true
        }));
      };

      // Simple fallback - show modal after 3 seconds if logo detection fails
      const simpleTimeout = setTimeout(() => {
        if (!modalState.isVisible) {
          console.log('Simple fallback: showing modal after 3 seconds');
          showModalAfterLogo();
        }
      }, 3000);
      timeouts.push(simpleTimeout);

      // Enhanced logo detection with multiple strategies
      const detectLogoLoad = () => {
        const logoImage = document.querySelector('img[alt="Mana Nivasam Logo"]') as HTMLImageElement;
        
        if (logoImage) {
          console.log('Logo found, checking if loaded:', {
            complete: logoImage.complete,
            naturalHeight: logoImage.naturalHeight,
            naturalWidth: logoImage.naturalWidth,
            src: logoImage.src
          });
          
          // Check if logo is already loaded and rendered
          if (logoImage.complete && logoImage.naturalHeight > 0 && logoImage.naturalWidth > 0) {
            console.log('Logo already loaded, checking visibility...');
            
            // Use IntersectionObserver to ensure logo is visible
            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                  console.log('Logo is visible, showing modal in 800ms');
                  const timeout = setTimeout(showModalAfterLogo, 800);
                  timeouts.push(timeout);
                  observer.disconnect();
                }
              });
            });
            
            observers.push(observer);
            observer.observe(logoImage);
            
            // Fallback in case IntersectionObserver doesn't fire
            const fallbackTimeout = setTimeout(() => {
              console.log('IntersectionObserver fallback, showing modal anyway');
              observer.disconnect();
              showModalAfterLogo();
            }, 2000);
            timeouts.push(fallbackTimeout);
            
            return true;
          } else {
            // Wait for logo to load
            console.log('Waiting for logo to load...');
            
            const handleLogoLoad = () => {
              console.log('Logo load event fired, checking visibility...');
              
              // Use IntersectionObserver after load
              const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    console.log('Logo loaded and visible, showing modal in 800ms');
                    const timeout = setTimeout(showModalAfterLogo, 800);
                    timeouts.push(timeout);
                    observer.disconnect();
                  }
                });
              });
              
              observers.push(observer);
              observer.observe(logoImage);
              
              // Fallback
              const fallbackTimeout = setTimeout(() => {
                observer.disconnect();
                showModalAfterLogo();
              }, 2000);
              timeouts.push(fallbackTimeout);
            };
            
            const handleLogoError = () => {
              console.log('Logo failed to load, showing modal in 2000ms');
              const timeout = setTimeout(showModalAfterLogo, 2000);
              timeouts.push(timeout);
            };
            
            // Add event listeners
            logoImage.addEventListener('load', handleLogoLoad, { once: true });
            logoImage.addEventListener('error', handleLogoError, { once: true });
            
            // Fallback timeout in case events don't fire
            const fallbackTimeout = setTimeout(() => {
              if (!modalState.isVisible) {
                console.log('Logo load timeout, showing modal anyway');
                showModalAfterLogo();
              }
            }, 5000);
            timeouts.push(fallbackTimeout);
            
            return true;
          }
        }
        return false;
      };

      // Try to detect logo immediately
      if (!detectLogoLoad()) {
        console.log('Logo element not found initially, setting up observers...');
        
        // Use MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  // Check if the added node is the logo or contains the logo
                  if (element.tagName === 'IMG' && element.getAttribute('alt') === 'Mana Nivasam Logo') {
                    console.log('Logo detected via MutationObserver');
                    if (detectLogoLoad()) {
                      observer.disconnect();
                    }
                  } else {
                    // Check if logo is within the added node
                    const logo = element.querySelector('img[alt="Mana Nivasam Logo"]');
                    if (logo) {
                      console.log('Logo found in added subtree');
                      if (detectLogoLoad()) {
                        observer.disconnect();
                      }
                    }
                  }
                }
              });
            }
          });
        });

        observers.push(observer);
        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Fallback checks with increasing delays
        const fallbackChecks = [1000, 2000, 3000, 5000];
        fallbackChecks.forEach((delay) => {
          const timeout = setTimeout(() => {
            if (!modalState.isVisible && detectLogoLoad()) {
              observer.disconnect();
            }
          }, delay);
          timeouts.push(timeout);
        });

        // Ultimate fallback - show modal after 8 seconds regardless
        const ultimateTimeout = setTimeout(() => {
          if (!modalState.isVisible) {
            console.log('Ultimate fallback: showing modal after 8 seconds');
            observer.disconnect();
            showModalAfterLogo();
          }
        }, 8000);
        timeouts.push(ultimateTimeout);
      }
    }
    
    // Cleanup function for useEffect
    return cleanup;
  }, [showOnAllDevices]);

  // Function to get user's location coordinates with Android WebView support
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const isAndroid = isAndroidWebView();
      
      // Different configurations for Android WebView vs regular browsers
      const highAccuracyOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: isAndroid ? 20000 : 10000, // Longer timeout for Android
        maximumAge: 0
      };

      const lowAccuracyOptions: PositionOptions = {
        enableHighAccuracy: false,
        timeout: isAndroid ? 15000 : 8000,
        maximumAge: 5000
      };

      console.log('Attempting location detection...', { isAndroid, userAgent: navigator.userAgent });

      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('High accuracy location success:', position);
          resolve(position);
        },
        (error) => {
          console.warn('High accuracy failed, trying low accuracy...', error);
          
          // If high accuracy fails, try low accuracy (network-based)
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Low accuracy location success:', position);
              resolve(position);
            },
            (finalError) => {
              console.error('Both location attempts failed:', finalError);
              
              // Provide more specific error messages
              let errorMessage = 'Geolocation failed';
              switch (finalError.code) {
                case finalError.PERMISSION_DENIED:
                  errorMessage = 'Location permission denied. Please enable location access in your device settings.';
                  break;
                case finalError.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable. Please check your device location settings.';
                  break;
                case finalError.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
              }
              
              reject(new Error(errorMessage));
            },
            lowAccuracyOptions
          );
        },
        highAccuracyOptions
      );
    });
  };

  // Function to convert coordinates to city using geocoding API with fallbacks
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    console.log('Geocoding coordinates:', { lat, lng });
    
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'ManaNavasam/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      // Extract city name from response with multiple fallbacks
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.municipality ||
                   data.address?.suburb ||
                   data.address?.county ||
                   data.address?.state_district ||
                   data.address?.state ||
                   'Unknown Location';
      
      console.log('Extracted city:', city);
      return city;
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Try alternative geocoding service as fallback
      try {
        console.log('Trying alternative geocoding service...');
        const altResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          const city = altData.city || altData.locality || altData.principalSubdivision || 'Current Location';
          console.log('Alternative geocoding success:', city);
          return city;
        }
      } catch (altError) {
        console.error('Alternative geocoding also failed:', altError);
      }
      
      // Final fallback - use coordinates
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  };

  // Handle location detection process with enhanced error handling
  const handleLocationDetection = async (storageType: 'localStorage' | 'sessionStorage' | null) => {
    setModalState(prev => ({ ...prev, isDetecting: true }));

    try {
      console.log('Starting location detection process...');
      
      // Check if location services are available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported on this device');
      }

      // Check if running in secure context (HTTPS or localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Not running in secure context, location may not work');
      }

      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log('Location detected successfully:', { 
        latitude, 
        longitude, 
        accuracy: position.coords.accuracy 
      });
      
      const city = await getCityFromCoordinates(latitude, longitude);
      
      // Store location based on user's choice
      if (storageType === 'localStorage') {
        localStorage.setItem('userLocation', city);
        localStorage.setItem('userCoordinates', JSON.stringify({ latitude, longitude }));
        console.log('Location saved to localStorage');
      } else if (storageType === 'sessionStorage') {
        sessionStorage.setItem('userLocation', city);
        sessionStorage.setItem('userCoordinates', JSON.stringify({ latitude, longitude }));
        console.log('Location saved to sessionStorage');
      }
      
      toast({
        title: "Location Detected ✓",
        description: `Your location has been set to ${city}. Showing properties in your area.`,
        duration: 4000,
      });

      onLocationDetected(city);
      closeModal();
      
    } catch (error) {
      console.error('Location detection failed:', error);
      
      let errorTitle = "Location Detection Failed";
      let errorMessage = '';
      let showSettings = false;
      
      if (error instanceof Error) {
        if (error.message.includes('denied') || error.message.includes('permission')) {
          errorTitle = "Permission Denied";
          errorMessage = 'Please enable location access in your device settings:\n\nSettings → Apps → Mana Nivasam → Permissions → Location → Allow';
          showSettings = true;
        } else if (error.message.includes('unavailable')) {
          errorTitle = "Location Unavailable";
          errorMessage = 'Please ensure:\n• Location services are enabled on your device\n• You have a stable internet connection\n• GPS signal is available';
          showSettings = true;
        } else if (error.message.includes('timeout')) {
          errorTitle = "Request Timed Out";
          errorMessage = 'Location detection took too long. Please try again or check if:\n• Location services are enabled\n• You have good GPS signal';
        } else if (error.message.includes('not supported')) {
          errorTitle = "Not Supported";
          errorMessage = 'Location services are not available on this device or browser.';
        } else {
          errorMessage = error.message || 'An unknown error occurred. Please try again.';
        }
      } else {
        errorMessage = 'Unable to detect your location. Please try again or enter your location manually.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: showSettings ? 8000 : 5000,
      });

      // Don't call onLocationDenied immediately, give user a chance to retry
      setModalState(prev => ({ 
        ...prev, 
        isDetecting: false,
        selectedOption: null // Reset so user can try again
      }));
      
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
          className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-xs mx-auto pointer-events-auto transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: modalState.isVisible ? 'slide-up-fade-in 0.4s ease-out forwards' : undefined
          }}
        >
          {/* Header */}
          <div className="relative p-4 pb-3">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
            
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Location Access
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed px-1">
                We'd like to access your location to show properties near you. Choose how you'd like to share your location.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-4 pb-4 space-y-2">
            {/* Allow Location Access */}
            <Button
              onClick={handleAllowLocationAccess}
              disabled={modalState.isDetecting}
              className="w-full h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] text-sm"
            >
              {modalState.isDetecting && modalState.selectedOption === 'allow' ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  <span>Allow Location Access</span>
                </>
              )}
            </Button>
            
            {/* Only While Using the App */}
            <Button
              onClick={handleOnlyWhileUsingApp}
              disabled={modalState.isDetecting}
              variant="outline"
              className="w-full h-10 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02] text-sm"
            >
              {modalState.isDetecting && modalState.selectedOption === 'session' ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  <span>Only While Using App</span>
                </>
              )}
            </Button>
            
            {/* Don't Allow */}
            <Button
              onClick={handleDontAllow}
              disabled={modalState.isDetecting}
              variant="ghost"
              className="w-full h-10 text-gray-600 hover:bg-gray-100 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-sm"
            >
              Don't Allow
            </Button>
          </div>
          
          {/* Footer Note */}
          <div className="px-4 pb-3">
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              
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
