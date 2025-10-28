import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import AdminMediaPreview from './AdminMediaPreview';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const UserPropertyForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    fullAddress: '',
    type: '',
    category: '',
    subCategory: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaAcres: '',
    description: '',
    plotSize: '',
    landType: '',
    facing: '',
    roadAccess: false,
    legalClearances: false,
    furnishingStatus: '',
    amenities: [] as string[],
    propertyAge: '',
    status: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        let newValue = value;
        
        // Validate Property Age input
        if (name === 'propertyAge') {
          if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 200)) {
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
              toast.error('Property age must be a non-negative number');
            } else if (Number(value) > 200) {
              toast.error('Property age cannot exceed 200 years');
            }
            return prev;
          }
        }

        // Validate Area Acres input
        if (name === 'areaAcres') {
          if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10000)) {
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
              toast.error('Area in acres must be a non-negative number');
            } else if (Number(value) > 10000) {
              toast.error('Area in acres cannot exceed 10,000 acres');
            }
            return prev;
          }
        }
        
        const newFormData = { ...prev, [name]: newValue };
        
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
    setImages(uploadedImages);
  };

  const handleVideoUpload = (uploadedVideos: string[]) => {
    setVideos(uploadedVideos);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
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

      // Validate contact information
      if (!formData.contactName || !formData.contactPhone) {
        toast.error('Please provide your contact name and phone number');
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
      }

      // Validate PG/Hostels subcategory
      if (isPGCategory && !formData.subCategory) {
        toast.error('Please select a subcategory for PG/Hostels');
        setLoading(false);
        return;
      }

      // Validate Status for non-Land properties
      if (!isLandCategory && !formData.status) {
        toast.error('Please select a status for this property');
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
        propertyAge: formData.propertyAge ? parseInt(formData.propertyAge) : undefined,
        areaAcres: formData.areaAcres ? parseFloat(formData.areaAcres) : undefined,
        status: (!isLandCategory && formData.status) ? formData.status : undefined,
        submittedBy: currentUser?.uid || 'anonymous',
        submittedByEmail: currentUser?.email || formData.contactEmail || 'not-provided',
        submittedAt: new Date(),
        approved: false, // User submissions need approval
      };

      // Remove undefined/empty fields for cleaner data
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined || propertyData[key] === '') {
          delete propertyData[key];
        }
      });

      // Save to userListings collection instead of properties
      const docRef = await addDoc(collection(db, 'userListings'), propertyData);
      console.log('User listing successfully saved with ID:', docRef.id);
      
      toast.success('Property submitted successfully! Our team will review it soon.');
      
      // Reset form
      setFormData({
        title: '',
        price: '',
        location: '',
        fullAddress: '',
        type: '',
        category: '',
        subCategory: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        areaAcres: '',
        description: '',
        plotSize: '',
        landType: '',
        facing: '',
        roadAccess: false,
        legalClearances: false,
        furnishingStatus: '',
        amenities: [],
        propertyAge: '',
        status: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
      });
      setImages([]);
      setVideos([]);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      
      let errorMessage = 'Failed to submit property. Please try again.';
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
  const pgSubCategories = ['For Boys', 'For Girls', 'Co-Living'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">List Your Property</h2>
        <p className="text-gray-600 mt-2">Fill in the details below to submit your property listing. Our team will review and publish it soon.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactName">Your Name <span className="text-red-500">*</span></Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
                className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Your Phone <span className="text-red-500">*</span></Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                placeholder="Enter your phone number"
                className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Your Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Enter your email (optional)"
                className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Basic Property Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Property Title <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="fullAddress">Full Address</Label>
            <Input
              id="fullAddress"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleInputChange}
              placeholder="Enter complete address with landmarks"
              className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
            />
          </div>

          <div>
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
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

          {isPGCategory && (
            <div>
              <Label htmlFor="subCategory">PG/Hostels Type <span className="text-red-500">*</span></Label>
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
              Property Type {!isLandCategory && <span className="text-red-500">*</span>}
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

          {/* Property Area Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Area</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Area (sq.ft) <span className="text-red-500">*</span></Label>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2500 sq ft"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>
              <div>
                <Label htmlFor="areaAcres">Area (acres)</Label>
                <Input
                  id="areaAcres"
                  name="areaAcres"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000"
                  value={formData.areaAcres}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.5 acres"
                  className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="propertyAge">Property Age (in years)</Label>
            <Input
              id="propertyAge"
              name="propertyAge"
              type="number"
              min="0"
              max="200"
              value={formData.propertyAge}
              onChange={handleInputChange}
              placeholder="Enter age in years (0 for new)"
              className="transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
            />
          </div>

          {!isLandCategory && (
            <div>
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required={!isLandCategory}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out focus:scale-105 focus:shadow-md"
              >
                <option value="">Select Status</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Ready to Move">Ready to Move</option>
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Amenities Section */}
        {supportsAmenities && formData.type && propertyAmenities[formData.type as keyof typeof propertyAmenities] && !isLandCategory && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {propertyAmenities[formData.type as keyof typeof propertyAmenities].map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-medium">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Furnishing Status Section */}
        {supportsFurnishing && formData.type && !isLandCategory && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Furnishing Status</h3>
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
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={`furnishing-${option}`} className="text-sm font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Land-Specific Fields */}
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

        {/* Non-Land Property Fields */}
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
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
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

        {/* Image Upload */}
        <div>
          <Label>Property Images <span className="text-red-500">*</span></Label>
          <p className="text-sm text-gray-600 mb-2">Upload at least one image of your property</p>
          <ImageUploader 
            onImagesUpload={handleImageUpload} 
            initialImages={images}
            maxImages={10}
          />
        </div>

        {/* Video Upload */}
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

        {/* Media Preview */}
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
          <Button
            type="submit"
            disabled={loading || images.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Property for Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserPropertyForm;
