
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyContactShareProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    images: string[];
  };
}

const PropertyContactShare: React.FC<PropertyContactShareProps> = ({ property }) => {
  const { toast } = useToast();

  const handleContactOwner = () => {
    const phoneNumber = '9121055512';
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

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} - ${property.price}`,
      url: window.location.origin + `/property/${property.id}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied",
          description: "Property link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied",
          description: "Property link copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Error",
          description: "Unable to share property",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleContactOwner}
        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
      >
        <Phone className="w-3 h-3 mr-1" />
        Contact Owner
      </Button>
      <Button
        onClick={handleShare}
        variant="outline"
        className="flex-1 h-8 text-xs border-gray-300"
      >
        <Send className="w-3 h-3 mr-1" />
        Share
      </Button>
    </div>
  );
};

export default PropertyContactShare;
