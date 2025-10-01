import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VisitorStats, getEnhancedVisitorStats, getDailyStats } from '@/utils/enhancedVisitorTracker';

interface UseRealTimeVisitorStatsReturn {
  visitorStats: VisitorStats;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

/**
 * Hook for real-time visitor statistics
 * Listens to Firestore changes and updates stats in real-time
 */
export const useRealTimeVisitorStats = (): UseRealTimeVisitorStatsReturn => {
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    uniqueVisitors: 0,
    pageViews: 0,
    lastVisit: null,
    dailyStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual refresh function
  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const stats = await getEnhancedVisitorStats();
      setVisitorStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error refreshing visitor stats:', err);
      setError('Failed to refresh visitor statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up real-time listener for global visitor stats
    const statsRef = doc(db, 'visitorStats', 'global');
    
    const unsubscribe = onSnapshot(
      statsRef,
      async (doc) => {
        try {
          if (doc.exists()) {
            const data = doc.data();
            const dailyStats = await getDailyStats(7);
            
            setVisitorStats({
              uniqueVisitors: data.uniqueVisitors || 0,
              pageViews: data.pageViews || 0,
              lastVisit: data.lastVisit?.toDate ? data.lastVisit.toDate() : null,
              dailyStats
            });
          } else {
            // Document doesn't exist yet, set default values
            setVisitorStats({
              uniqueVisitors: 0,
              pageViews: 0,
              lastVisit: null,
              dailyStats: []
            });
          }
          setError(null);
        } catch (err) {
          console.error('Error processing visitor stats update:', err);
          setError('Failed to update visitor statistics');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to visitor stats:', err);
        setError('Failed to connect to visitor statistics');
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    visitorStats,
    isLoading,
    error,
    refreshStats
  };
};