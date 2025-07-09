
import { useState, useEffect } from 'react';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  subCategory?: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  featured?: boolean;
  status?: string;
  approved?: boolean;
}

interface UseRealtimePropertiesOptions {
  categoryFilter?: string;
  includeMetadataChanges?: boolean;
}

export const useRealtimeProperties = (options: UseRealtimePropertiesOptions = {}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoryFilter, includeMetadataChanges = true } = options;

  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [categoryFilter]);

  const setupRealtimeListener = () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Setting up real-time properties listener...');
      
      const propertiesCollection = collection(db, 'properties');
      
      // Enhanced real-time listener with optimized options
      const unsubscribe = onSnapshot(
        propertiesCollection,
        {
          includeMetadataChanges
        },
        (querySnapshot) => {
          console.log('Real-time properties update received. Documents:', querySnapshot.size);
          
          const propertiesData = querySnapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            
            // Ensure images is always an array with valid URLs
            let validImages: string[] = [];
            if (Array.isArray(data.images)) {
              validImages = data.images.filter(img => {
                if (!img || typeof img !== 'string') return false;
                // Accept data URLs (uploaded files) and valid HTTPS URLs
                return img.startsWith('data:image/') || 
                       img.startsWith('https://') || 
                       img.includes('cloudinary.com');
              });
            }
            
            return {
              id: doc.id,
              title: data.title || '',
              price: data.price || '',
              location: data.location || '',
              type: data.type || 'Property',
              category: data.category || 'For Sale',
              subCategory: data.subCategory || '',
              images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500'],
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              area: data.area || 'N/A',
              description: data.description || 'No description available.',
              featured: data.featured || false,
              status: data.status,
              approved: data.approved
            } as Property;
          });

          // Apply category filter if specified
          const filteredProperties = categoryFilter 
            ? propertiesData.filter(property => {
                if (categoryFilter === 'PG/Hostels') {
                  return property.category === 'PG/Hostels' ||
                         property.type?.toLowerCase().includes('pg') ||
                         property.type?.toLowerCase().includes('hostel') ||
                         property.type?.toLowerCase().includes('accommodation');
                }
                return property.category === categoryFilter;
              })
            : propertiesData;
          
          console.log('Processed real-time properties:', {
            total: propertiesData.length,
            filtered: filteredProperties.length,
            categoryFilter
          });

          setProperties(filteredProperties);
          setLoading(false);
          
          if (filteredProperties.length === 0 && propertiesData.length === 0) {
            console.log('No properties found in real-time update');
            setError('No properties found. The database might be empty.');
          } else {
            setError(null);
          }
        },
        (error: any) => {
          console.error('Real-time properties listener error:', {
            error,
            code: error?.code,
            message: error?.message
          });
          
          let errorMessage = 'Unable to load properties. ';
          
          if (error?.code === 'permission-denied') {
            errorMessage += 'Database access denied. Please check Firestore security rules.';
          } else if (error?.code === 'unauthenticated') {
            errorMessage += 'Authentication required. Please log in to view properties.';
          } else if (error?.code === 'unavailable') {
            errorMessage += 'Database temporarily unavailable. Please try again later.';
          } else {
            errorMessage += `Error: ${error?.message || 'Unknown error occurred'}`;
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );
      
      return unsubscribe;
      
    } catch (error: any) {
      console.error('Error setting up real-time properties listener:', error);
      setError('Failed to set up real-time updates. Please refresh the page.');
      setLoading(false);
    }
  };

  const refetch = () => {
    setupRealtimeListener();
  };

  return { properties, loading, error, refetch };
};
