/**
 * Reusable property filtering utilities
 * Provides consistent search and filter logic across all property pages
 */

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  description?: string;
  featured?: boolean;
  status?: string;
  approved?: boolean;
  subCategory?: string;
}

/**
 * Comprehensive property search function
 * Matches search query against all relevant property metadata fields
 */
export const searchProperties = (properties: Property[], searchQuery: string): Property[] => {
  if (!searchQuery.trim()) {
    return properties;
  }

  const searchTerm = searchQuery.toLowerCase().trim();
  
  return properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm) ||
    property.location.toLowerCase().includes(searchTerm) ||
    property.category.toLowerCase().includes(searchTerm) ||
    property.type.toLowerCase().includes(searchTerm) ||
    property.description?.toLowerCase().includes(searchTerm) ||
    property.area?.toLowerCase().includes(searchTerm) ||
    (property.bedrooms && property.bedrooms.toString().includes(searchTerm)) ||
    (property.bathrooms && property.bathrooms.toString().includes(searchTerm)) ||
    property.price.toLowerCase().includes(searchTerm)
  );
};

/**
 * Filter properties by type/category
 */
export const filterByType = (properties: Property[], selectedType: string): Property[] => {
  if (selectedType === 'all') {
    return properties;
  }

  return properties.filter(property => 
    property.category === selectedType || 
    property.type === selectedType ||
    property.subCategory === selectedType
  );
};

/**
 * Combined filter function for property pages
 * Handles both search query and type filtering
 */
export const filterProperties = (
  properties: Property[], 
  searchQuery: string, 
  manualSearchQuery: string, 
  selectedType: string
): Property[] => {
  // Use manual search query if provided, otherwise use dropdown search query
  const effectiveSearchQuery = manualSearchQuery.trim() || searchQuery;
  
  // Apply search filter first
  let filtered = searchProperties(properties, effectiveSearchQuery);
  
  // Then apply type filter
  filtered = filterByType(filtered, selectedType);
  
  return filtered;
};

/**
 * Special filter for PG/Hostels with subcategory support
 */
export const filterPGHostels = (
  properties: Property[], 
  searchQuery: string, 
  manualSearchQuery: string, 
  selectedType: string
): Property[] => {
  // Use manual search query if provided, otherwise use dropdown search query
  const effectiveSearchQuery = manualSearchQuery.trim() || searchQuery;
  
  // Apply search filter first
  let filtered = searchProperties(properties, effectiveSearchQuery);
  
  // Apply PG/Hostels specific type filter
  if (selectedType !== 'all') {
    filtered = filtered.filter(property => {
      // Match by subCategory (new field) for exact matching
      if (property.subCategory) {
        return property.subCategory.toLowerCase() === selectedType.toLowerCase();
      }
      
      // Fallback: Try to match by existing category or type for backward compatibility
      const searchTerm = selectedType.toLowerCase();
      return (
        property.category?.toLowerCase().includes(searchTerm) ||
        property.type?.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  return filtered;
};

/**
 * Validate and clean search input
 */
export const sanitizeSearchInput = (input: string): string => {
  return input.trim().slice(0, 100); // Limit length and trim whitespace
};

/**
 * Check if search is active (has any filters applied)
 */
export const isSearchActive = (searchQuery: string, manualSearchQuery: string, selectedType: string): boolean => {
  return !!(
    searchQuery.trim() || 
    manualSearchQuery.trim() || 
    (selectedType && selectedType !== 'all')
  );
};
