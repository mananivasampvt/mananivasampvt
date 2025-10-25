import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  userLocation: string | null;
  userCoordinates: { latitude: number; longitude: number } | null;
  setUserLocation: (location: string | null) => void;
  setUserCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  isLocationSet: boolean;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocationState] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinatesState] = useState<{ latitude: number; longitude: number } | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    // Check localStorage first (persistent)
    const storedLocation = localStorage.getItem('userLocation');
    const storedCoordinates = localStorage.getItem('userCoordinates');
    
    if (storedLocation && storedCoordinates) {
      try {
        const coords = JSON.parse(storedCoordinates);
        // Ensure location is a string, not an object
        let locationString = storedLocation;
        try {
          const parsedLocation = JSON.parse(storedLocation);
          if (typeof parsedLocation === 'object' && parsedLocation.city) {
            locationString = parsedLocation.city;
          }
        } catch {
          // If it's not JSON, use it as is
        }
        setUserLocationState(locationString);
        setUserCoordinatesState(coords);
        return;
      } catch (error) {
        console.error('Error parsing stored coordinates:', error);
      }
    }
    
    // Check sessionStorage (session-only)
    const sessionLocation = sessionStorage.getItem('userLocation');
    const sessionCoordinates = sessionStorage.getItem('userCoordinates');
    
    if (sessionLocation && sessionCoordinates) {
      try {
        const coords = JSON.parse(sessionCoordinates);
        // Ensure location is a string, not an object
        let locationString = sessionLocation;
        try {
          const parsedLocation = JSON.parse(sessionLocation);
          if (typeof parsedLocation === 'object' && parsedLocation.city) {
            locationString = parsedLocation.city;
          }
        } catch {
          // If it's not JSON, use it as is
        }
        setUserLocationState(locationString);
        setUserCoordinatesState(coords);
      } catch (error) {
        console.error('Error parsing session coordinates:', error);
      }
    }
  }, []);

  const setUserLocation = (location: string | null) => {
    setUserLocationState(location);
    if (location) {
      // Update both localStorage and sessionStorage to maintain consistency
      if (localStorage.getItem('userLocation')) {
        localStorage.setItem('userLocation', location);
      }
      if (sessionStorage.getItem('userLocation')) {
        sessionStorage.setItem('userLocation', location);
      }
    }
  };

  const setUserCoordinates = (coords: { latitude: number; longitude: number } | null) => {
    setUserCoordinatesState(coords);
    if (coords) {
      const coordsString = JSON.stringify(coords);
      // Update both localStorage and sessionStorage to maintain consistency
      if (localStorage.getItem('userCoordinates')) {
        localStorage.setItem('userCoordinates', coordsString);
      }
      if (sessionStorage.getItem('userCoordinates')) {
        sessionStorage.setItem('userCoordinates', coordsString);
      }
    }
  };

  const clearLocation = () => {
    setUserLocationState(null);
    setUserCoordinatesState(null);
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userCoordinates');
    sessionStorage.removeItem('userLocation');
    sessionStorage.removeItem('userCoordinates');
  };

  const isLocationSet = userLocation !== null && userCoordinates !== null;

  const value: LocationContextType = {
    userLocation,
    userCoordinates,
    setUserLocation,
    setUserCoordinates,
    isLocationSet,
    clearLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
