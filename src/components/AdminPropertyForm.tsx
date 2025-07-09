import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import AdminMediaPreview from './AdminMediaPreview';
import { toast } from 'sonner';

interface AdminPropertyFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  property?: any;
}

const AdminPropertyForm: React.FC<AdminPropertyFormProps> = ({ 
  onClose, 
  onSuccess, 
  property 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    type: '',
    category: '',
    subCategory: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    plotSize: '',
    landType: '',
    facing: '',
    roadAccess: false,
    legalClearances: false,
    furnishingStatus: '',
    amenities: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Predefined property types for consistency
  const propertyTypes = [
    'Apartment',
    'Villa',
    'Office',
    'House'
  ];

  // Define amenities for each property type
  const propertyAmenities = {
    Apartment: [
      'Lift',
      'Swimming Pool',
      'Covered Parking',
      '24x7 Security',
      'Power Backup',
      'Gym',
      'CCTV Surveillance',
      'Kids Play Area'
    ],
    Villa: [
      'Garden Area',
      'Private Parking',
      'Open Terrace',
      'Swimming Pool',
      '24x7 Security',
      'Power Backup'
    ],
    Office: [
      'Meeting Room',
      'High-Speed Internet',
      'Central AC',
      '24x7 Access',
      'Backup Generator',
      'CCTV Surveillance',
      'Covered Parking'
    ],
    House: [
      'Water Storage',
      'Private Garden',
      'Vastu Compliant',
      'Covered Parking',
      'Security',
      'Backup Power',
      '24x7 Security'
    ]
  };

  const furnishingOptions = [
    'Fully Furnished',
    'Semi-Furnished',
    'Unfurnished'
  ];

  // Check if property type supports amenities and furnishing
  const supportsAmenities = ['Apartment', 'Villa', 'Office', 'House'].includes(formData.type);
  const supportsFurnishing = ['Apartment', 'Villa', 'Office', 'House'].includes(formData.type);

  // Populate form data when editing existing property
  useEffect(() => {
    if (property) {
      console.log('Loading property for editing:', property);
      setFormData({
        title: property.title || '',
        price: property.price || '',
        location: property.location || '',
        type: property.type || '',
        category: property.category || '',
        subCategory: property.subCategory || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area: property.area || '',
        description: property.description || '',
        plotSize: property.plotSize || '',
        landType: property.landType || '',
        facing: property.facing || '',
        roadAccess: property.roadAccess || false,
        legalClearances: property.legalClearances || false,
        furnishingStatus: property.furnishingStatus || '',
        amenities: property.amenities || [],
      });
      
      // Set existing images - ensure they are valid
      const existingImages = property.images || [];
      const validImages = existingImages.filter(img => 
        img && typeof img === 'string' && !img.startsWith('blob:')
      );
      console.log('Setting existing images:', validImages.length, 'valid images');
      setImages(validImages);

      // Set existing videos - ensure they are valid
      const existingVideos = property.videos || [];
      const validVideos = existingVideos.filter(video => 
        video && typeof video === 'string' && !video.startsWith('blob:')
      );
      console.log('Setting existing videos:', validVideos.length, 'valid videos');
      setVideos(validVideos);
    }
  }, [property]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const newFormData = { ...prev, [name]: value };
        
        // Reset subCategory when category changes
        if (name === 'category' && value !== 'PG/Hostels') {
          newFormData.subCategory = '';
        }

        // Reset amenities and furnishing when property type changes
        if (name === 'type') {
          newFormData.amenities = [];
          newFormData.furnishingStatus = '';
        }

        // Reset property type, amenities, and furnishing when Land is selected
        if (name === 'category' && value === 'Land') {
          newFormData.type = '';
          newFormData.amenities = [];
          newFormData.furnishingStatus = '';
        }
        
        return newFormData;
      });
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleImageUpload = (uploadedImages: string[]) => {
    console.log('Images updated in form:', uploadedImages.length, 'images');
    setImages(uploadedImages);
  };

  const handleVideoUpload = (uploadedVideos: string[]) => {
    console.log('Videos updated in form:', uploadedVideos.length, 'videos');
    setVideos(uploadedVideos);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    console.log('Image removed at index:', index, 'Remaining images:', updatedImages.length);
  };

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    console.log('Video removed at index:', index, 'Remaining videos:', updatedVideos.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (images.length === 0) {
        toast.error('Please upload at least one image');
        setLoading(false);
        return;
      }

      // Enhanced validation for Land properties
      const isLandCategory = formData.category === 'Land';
      const isPGCategory = formData.category === 'PG/Hostels';
      
      if (isLandCategory) {
        if (!formData.area) {
          toast.error('Area is required for land properties');
          setLoading(false);
          return;
        }
        
        console.log('Preparing Land property submission with data:', formData);
      }

      // Validate PG/Hostels subcategory
      if (isPGCategory && !formData.subCategory) {
        toast.error('Please select a subcategory for PG/Hostels');
        setLoading(false);
        return;
      }

      // Filter out any blob URLs before saving
      const validImages = images.filter(img => 
        img && typeof img === 'string' && !img.startsWith('blob:')
      );

      const validVideos = videos.filter(video => 
        video && typeof video === 'string' && !video.startsWith('blob:')
      );

      if (validImages.length === 0) {
        toast.error('No valid images to save. Please upload images again.');
        setLoading(false);
        return;
      }

      const propertyData = {
        ...formData,
        images: validImages,
        videos: validVideos.length > 0 ? validVideos : undefined,
        bedrooms: (!isLandCategory && formData.bedrooms) ? parseInt(formData.bedrooms) : undefined,
        bathrooms: (!isLandCategory && formData.bathrooms) ? parseInt(formData.bathrooms) : undefined,
        featured: property?.featured || false,
        createdAt: property?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Remove undefined/empty fields for cleaner data
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined || propertyData[key] === '') {
          delete propertyData[key];
        }
      });

      console.log('Final property data being submitted:', {
        ...propertyData,
        images: `${validImages.length} valid images`
      });

      if (property?.id) {
        // Update existing property
        await updateDoc(doc(db, 'properties', property.id), propertyData);
        toast.success('Property updated successfully!');
      } else {
        // Add new property
        const docRef = await addDoc(collection(db, 'properties'), propertyData);
        console.log('Property successfully saved with ID:', docRef.id);
        toast.success('Property added successfully!');
      }
      
      // Call success callback and close form
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to save property. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check all fields.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLandCategory = formData.category === 'Land';
  const isPGCategory = formData.category === 'PG/Hostels';

  // PG/Hostels subcategory options
  const pgSubCategories = ['For Boys', 'For Girls', 'Co-Living'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Property Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter property title"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="₹ Enter price"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter location"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                >
                  <option value="">Select Category</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Commercial">Commercial</option>
                  <option value="PG/Hostels">PG/Hostels</option>
                  <option value="Land">Land</option>
                </select>
              </div>

              {/* PG/Hostels Subcategory Selection */}
              {isPGCategory && (
                <div>
                  <Label htmlFor="subCategory">PG/Hostels Type</Label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                  >
                    <option value="">Select Type</option>
                    {pgSubCategories.map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="type" className={isLandCategory ? "text-gray-400" : ""}>
                  Property Type
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required={!isLandCategory}
                  disabled={isLandCategory}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md ${
                    isLandCategory ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  placeholder={isLandCategory ? "e.g., 2.5 acres or 2400 sq ft" : "e.g., 2500 sq ft"}
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>
            </div>

            {/* Dynamic Amenities Section - Disabled for Land */}
            {supportsAmenities && formData.type && propertyAmenities[formData.type as keyof typeof propertyAmenities] && !isLandCategory && (
              <div className="border-t pt-6">
                <h3 className={`text-lg font-semibold mb-4 ${isLandCategory ? 'text-gray-400' : ''}`}>
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {propertyAmenities[formData.type as keyof typeof propertyAmenities].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        disabled={isLandCategory}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          isLandCategory ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      />
                      <Label 
                        htmlFor={`amenity-${amenity}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          isLandCategory ? 'text-gray-400' : ''
                        }`}
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Furnishing Status Section - Disabled for Land */}
            {supportsFurnishing && formData.type && !isLandCategory && (
              <div className="border-t pt-6">
                <h3 className={`text-lg font-semibold mb-4 ${isLandCategory ? 'text-gray-400' : ''}`}>
                  Furnishing Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {furnishingOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`furnishing-${option}`}
                        name="furnishingStatus"
                        value={option}
                        checked={formData.furnishingStatus === option}
                        onChange={handleInputChange}
                        disabled={isLandCategory}
                        className={`text-blue-600 focus:ring-blue-500 ${
                          isLandCategory ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      />
                      <Label 
                        htmlFor={`furnishing-${option}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          isLandCategory ? 'text-gray-400' : ''
                        }`}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditional Fields for Land */}
            {isLandCategory && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Land-Specific Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="plotSize">Plot Size</Label>
                    <Input
                      id="plotSize"
                      name="plotSize"
                      value={formData.plotSize}
                      onChange={handleInputChange}
                      placeholder="e.g., 2400 sq ft"
                    />
                  </div>

                  <div>
                    <Label htmlFor="landType">Land Type</Label>
                    <select
                      id="landType"
                      name="landType"
                      value={formData.landType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Land Type</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="facing">Land Facing</Label>
                    <select
                      id="facing"
                      name="facing"
                      value={formData.facing}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Facing</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roadAccess"
                        name="roadAccess"
                        checked={formData.roadAccess}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <Label htmlFor="roadAccess">Road Access</Label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="legalClearances"
                        name="legalClearances"
                        checked={formData.legalClearances}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <Label htmlFor="legalClearances">Legal Clearances</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Fields for Non-Land Properties */}
            {!isLandCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="Number of bathrooms"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Enter property description"
                className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              />
            </div>

            {/* Image Upload with initial images and deletion */}
            <div>
              <Label>Property Images</Label>
              <ImageUploader 
                onImagesUpload={handleImageUpload} 
                initialImages={images}
                maxImages={10}
              />
            </div>

            {/* Video Upload - Optional */}
            <div>
              <Label>Property Videos (Optional)</Label>
              <p className="text-sm text-gray-600 mb-3">
                Add videos to showcase your property. You can upload video files or paste YouTube/Vimeo links.
              </p>
              <VideoUploader 
                onVideosUpload={handleVideoUpload} 
                initialVideos={videos}
                maxVideos={5}
              />
            </div>

            {/* Media Preview - Shows all uploaded media after saving */}
            {(images.length > 0 || videos.length > 0) && (
              <AdminMediaPreview
                images={images}
                videos={videos}
                onRemoveImage={handleRemoveImage}
                onRemoveVideo={handleRemoveVideo}
                className="border-t pt-6"
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md hover:border-gray-400"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyForm;
