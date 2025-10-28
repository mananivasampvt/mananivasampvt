
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LocationData {
  locations: string[];
  cities: string[]; // Add cities array
  areas: { [city: string]: string[] };
  propertyTypes: string[];
  categories: string[];
}

export const usePropertyLocations = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    locations: [],
    cities: [], // Add cities array
    areas: {},
    propertyTypes: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setupRealtimeListener = () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Setting up real-time listener for property search data...');
      
      const propertiesCollection = collection(db, 'properties');
      
      // Set up real-time listener for property data with enhanced error handling
      const unsubscribe = onSnapshot(
        propertiesCollection,
        {
          // Include metadata changes for better real-time detection
          includeMetadataChanges: true
        },
        (querySnapshot) => {
          console.log('Real-time property search data update received');
          
          const locations = new Set<string>();
          const cities = new Set<string>(); // Separate set for cities only
          const areas = new Map<string, Set<string>>();
          const propertyTypes = new Set<string>();
          const categories = new Set<string>();

          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Helper function to normalize location strings
            const normalizeLocation = (loc: string): string => {
              return loc
                .trim()
                .replace(/[.,;!?]+$/g, '') // Remove trailing punctuation
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            };
            
            // Extract and clean location data
            if (data.location && typeof data.location === 'string') {
              const cleanLocation = normalizeLocation(data.location);
              if (cleanLocation) {
                locations.add(cleanLocation);
                
                // Extract area/sub-location from location string
                // Enhanced patterns: "Area, City" or "Area - City" or "Area in City" or "Area | City"
                const locationParts = cleanLocation.split(/[,\-|]|in\s+|near\s+/i);
                if (locationParts.length > 1) {
                  const area = normalizeLocation(locationParts[0]);
                  const city = normalizeLocation(locationParts[locationParts.length - 1]);
                  
                  if (area && city && area.toLowerCase() !== city.toLowerCase()) {
                    // Add city to cities set (with proper capitalization)
                    // Capitalize first letter of each word for display
                    const capitalizedCity = city
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                    cities.add(capitalizedCity);
                    
                    if (!areas.has(capitalizedCity)) {
                      areas.set(capitalizedCity, new Set<string>());
                    }
                    
                    // Capitalize area name as well
                    const capitalizedArea = area
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                    areas.get(capitalizedCity)?.add(capitalizedArea);
                  }
                } else {
                  // If no separator found, treat the entire location as a city
                  // Capitalize first letter of each word for display
                  const capitalizedCity = cleanLocation
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                  cities.add(capitalizedCity);
                  if (!areas.has(capitalizedCity)) {
                    areas.set(capitalizedCity, new Set<string>());
                  }
                }
              }
            }

            // Extract property types
            if (data.type && typeof data.type === 'string') {
              const cleanType = data.type.trim();
              if (cleanType) {
                propertyTypes.add(cleanType);
              }
            }

            // Extract categories
            if (data.category && typeof data.category === 'string') {
              const cleanCategory = data.category.trim();
              if (cleanCategory) {
                categories.add(cleanCategory);
              }
            }
          });

          // Convert areas Map to object with sorted arrays
          const areasObject: { [city: string]: string[] } = {};
          areas.forEach((areaSet, city) => {
            areasObject[city] = Array.from(areaSet).sort();
          });

          const result = {
            locations: Array.from(locations).sort(),
            cities: Array.from(cities).sort(), // Add cities array
            areas: areasObject,
            propertyTypes: Array.from(propertyTypes).sort(),
            categories: Array.from(categories).sort()
          };

          console.log('Real-time property search data extracted:', {
            locationsCount: result.locations.length,
            areasCount: Object.keys(result.areas).length,
            typesCount: result.propertyTypes.length,
            categoriesCount: result.categories.length
          });

          setLocationData(result);
          setLoading(false);
        },
        (error: any) => {
          console.error('Error in property search data real-time listener:', error);
          setError(`Failed to load search data: ${error?.message || 'Unknown error'}`);
          
          // Fallback to empty arrays if database fetch fails
          setLocationData({
            locations: [],
            cities: [],
            areas: {},
            propertyTypes: [],
            categories: []
          });
          setLoading(false);
        }
      );
      
      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up property search data real-time listener:', error);
      setError(`Failed to load search data: ${error?.message || 'Unknown error'}`);
      
      // Fallback to empty arrays if database fetch fails
      setLocationData({
        locations: [],
        cities: [],
        areas: {},
        propertyTypes: [],
        categories: []
      });
      setLoading(false);
    }
  };

  const refetch = () => {
    setupRealtimeListener();
  };

  return { locationData, loading, error, refetch };
};
