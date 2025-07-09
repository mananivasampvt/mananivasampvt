
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LocationData {
  locations: string[];
  areas: { [city: string]: string[] };
  propertyTypes: string[];
  categories: string[];
}

export const usePropertyLocations = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    locations: [],
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
          const areas = new Map<string, Set<string>>();
          const propertyTypes = new Set<string>();
          const categories = new Set<string>();

          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Extract and clean location data
            if (data.location && typeof data.location === 'string') {
              const cleanLocation = data.location.trim();
              if (cleanLocation) {
                locations.add(cleanLocation);
                
                // Extract area/sub-location from location string
                // Enhanced patterns: "Area, City" or "Area - City" or "Area in City" or "Area | City"
                const locationParts = cleanLocation.split(/[,\-|]|in\s+|near\s+/i);
                if (locationParts.length > 1) {
                  const area = locationParts[0].trim();
                  const city = locationParts[locationParts.length - 1].trim();
                  
                  if (area && city && area !== city) {
                    if (!areas.has(city)) {
                      areas.set(city, new Set<string>());
                    }
                    areas.get(city)?.add(area);
                    
                    // Also add the city itself as a main location
                    locations.add(city);
                  }
                } else {
                  // If no separator found, treat the entire location as a city
                  // and add it to areas for potential sub-area filtering
                  if (!areas.has(cleanLocation)) {
                    areas.set(cleanLocation, new Set<string>());
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
