import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, User } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  createdAt?: any;
}

interface TeamMemberFormProps {
  onClose: () => void;
  onSuccess: () => void;
  member?: TeamMember | null;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ onClose, onSuccess, member }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    description: member?.description || '',
    image: member?.image || ''
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (imageUrls: string[]) => {
    console.log('Image upload received:', imageUrls);
    if (imageUrls.length > 0) {
      const imageUrl = imageUrls[0];
      
      // Validate that we have a proper URL, not base64 data
      if (imageUrl.startsWith('data:')) {
        console.error('Received base64 data instead of URL');
        toast({
          title: "Error",
          description: "Image upload failed. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure URL is reasonable length (under 500 characters)
      if (imageUrl.length > 500) {
        console.error('Image URL too long:', imageUrl.length, 'characters');
        toast({
          title: "Error", 
          description: "Image URL is too long. Please use a different image.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
      
      console.log('Valid image URL set:', imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Team member form submission started');
    console.log('Form data:', formData);
    
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({
        title: "Error",
        description: "Name and role are required",
        variant: "destructive",
      });
      return;
    }

    // Validate image URL if provided
    if (formData.image && formData.image.startsWith('data:')) {
      toast({
        title: "Error",
        description: "Please wait for image upload to complete, or remove the image.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // Prepare data with size validation
    const teamMemberData = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      description: formData.description.trim(),
      image: formData.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Final validation - ensure no field is too large
    const dataString = JSON.stringify(teamMemberData);
    if (dataString.length > 500000) { // 500KB limit
      toast({
        title: "Error",
        description: "Team member data is too large. Please use smaller images or shorter descriptions.",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    try {
      console.log('Attempting to save team member data:', teamMemberData);
      console.log('Data size:', dataString.length, 'characters');

      if (member) {
        console.log('Updating existing member with ID:', member.id);
        const docRef = doc(db, 'teamMembers', member.id);
        await updateDoc(docRef, teamMemberData);
        console.log('Team member updated successfully');
        toast({
          title: "Success",
          description: "Team member updated successfully",
        });
      } else {
        console.log('Adding new team member to Firestore collection: teamMembers');
        const collectionRef = collection(db, 'teamMembers');
        const docRef = await addDoc(collectionRef, teamMemberData);
        console.log('Team member added successfully with ID:', docRef.id);
        toast({
          title: "Success",
          description: "Team member added successfully",
        });
      }

      console.log('Operation completed successfully, calling onSuccess');
      onSuccess();
    } catch (error: any) {
      console.error('Detailed error saving team member:', {
        error,
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        dataSize: dataString.length,
        imageUrlLength: formData.image?.length || 0
      });
      
      let errorMessage = "Failed to save team member. ";
      
      if (error?.message?.includes('longer than') || error?.message?.includes('too large')) {
        errorMessage += "The image or data is too large. Please use a smaller image or shorter descriptions.";
      } else if (error?.code === 'permission-denied') {
        errorMessage += "Database access denied. Please check your admin permissions.";
      } else if (error?.code === 'unauthenticated') {
        errorMessage += "You must be logged in as an admin to perform this action.";
      } else {
        errorMessage += `Error: ${error?.message || 'Unknown error occurred'}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="mb-4">
                {formData.image && !formData.image.startsWith('data:') ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-full"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">No image selected</p>
                  </div>
                )}
              </div>
              <ImageUploader
                onImagesUpload={handleImageUpload}
                maxImages={1}
                initialImages={formData.image && !formData.image.startsWith('data:') ? [formData.image] : []}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., CEO, Sales Manager, etc."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Brief description about the team member"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all duration-300 hover:scale-105"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || (formData.image && formData.image.startsWith('data:'))}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {uploading ? 'Saving...' : member ? 'Update' : 'Add'} Team Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberForm;
