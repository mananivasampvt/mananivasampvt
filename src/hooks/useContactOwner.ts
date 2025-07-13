import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UseContactOwnerOptions {
  propertyId?: string;
  redirectPath?: string;
}

export const useContactOwner = (options?: UseContactOwnerOptions) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleContactOwner = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Check if user is authenticated
    if (!currentUser) {
      // Show toast notification
      toast({
        title: "Please login to contact owner",
        description: "You need to be logged in to access contact information",
        variant: "destructive",
      });

      // Store current location and property info for redirect after login
      const redirectData = {
        returnTo: options?.redirectPath || location.pathname,
        propertyId: options?.propertyId,
        action: 'contact'
      };

      // Navigate to login with state
      navigate('/login', { 
        state: { 
          from: location.pathname,
          ...redirectData
        } 
      });
      return;
    }

    // User is authenticated, proceed with contact functionality
    const phoneNumber = '8985816481';
    if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber);
      toast({
        title: "Phone number copied",
        description: `${phoneNumber} copied to clipboard`,
      });
    }
  };

  return {
    handleContactOwner,
    isAuthenticated: !!currentUser
  };
};
