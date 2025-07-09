
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useShortlist = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchShortlistedIds();
    } else {
      setShortlistedIds(new Set());
    }
  }, [currentUser]);

  const fetchShortlistedIds = async () => {
    if (!currentUser) return;

    try {
      const shortlistSnapshot = await getDocs(
        collection(db, 'users', currentUser.uid, 'shortlisted')
      );
      const ids = new Set(shortlistSnapshot.docs.map(doc => doc.id));
      setShortlistedIds(ids);
    } catch (error) {
      console.error('Error fetching shortlisted properties:', error);
    }
  };

  const toggleShortlist = async (propertyId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to save properties to your shortlist",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    const isCurrentlyShortlisted = shortlistedIds.has(propertyId);

    try {
      const shortlistDocRef = doc(db, 'users', currentUser.uid, 'shortlisted', propertyId);

      if (isCurrentlyShortlisted) {
        // Remove from shortlist
        await deleteDoc(shortlistDocRef);
        setShortlistedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        toast({
          title: "Removed from shortlist",
          description: "Property removed from your favorites",
        });
      } else {
        // Add to shortlist
        await setDoc(shortlistDocRef, {
          propertyId,
          addedAt: new Date()
        });
        setShortlistedIds(prev => new Set([...prev, propertyId]));
        toast({
          title: "Added to shortlist",
          description: "Property saved to your favorites",
        });
      }

      return true;
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      toast({
        title: "Error",
        description: "Failed to update shortlist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isShortlisted = (propertyId: string) => shortlistedIds.has(propertyId);

  return {
    isShortlisted,
    toggleShortlist,
    isLoading,
    shortlistedCount: shortlistedIds.size
  };
};
