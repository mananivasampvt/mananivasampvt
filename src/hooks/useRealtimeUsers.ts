import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface User {
  uid: string;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: any;
  lastLogin?: any;
  profileImage?: string;
  location?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  admins: number;
  users: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface UseRealtimeUsersReturn {
  users: User[];
  userStats: UserStats;
  recentUsers: User[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

export const useRealtimeUsers = (limit: number = 50): UseRealtimeUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time user subscription
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        try {
          const usersData: User[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            usersData.push({
              uid: doc.id,
              username: data.username || 'Unknown User',
              email: data.email || '',
              phone: data.phone,
              role: data.role || 'user',
              status: data.status || 'active',
              createdAt: data.createdAt,
              lastLogin: data.lastLogin,
              profileImage: data.profileImage,
              location: data.location,
              deviceInfo: data.deviceInfo,
              ipAddress: data.ipAddress,
              userAgent: data.userAgent
            });
          });

          setUsers(usersData);
          setError(null);
        } catch (err) {
          console.error('Error processing user data:', err);
          setError('Failed to process user data');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate user statistics
  const userStats: UserStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const total = users.length;
    const active = users.filter(u => u.status === 'active' || !u.status).length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user' || !u.role).length;

    // Calculate new signups for different periods
    const newToday = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= today;
    }).length;

    const newThisWeek = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= weekAgo;
    }).length;

    const newThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= monthAgo;
    }).length;

    // Calculate previous periods for growth rate
    const newYesterday = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= yesterday && userDate < today;
    }).length;

    const newLastWeek = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= lastWeek && userDate < weekAgo;
    }).length;

    const newLastMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const userDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userDate >= lastMonth && userDate < monthAgo;
    }).length;

    // Calculate growth rates
    const dailyGrowth = newYesterday === 0 ? 
      (newToday > 0 ? 100 : 0) : 
      ((newToday - newYesterday) / newYesterday) * 100;

    const weeklyGrowth = newLastWeek === 0 ? 
      (newThisWeek > 0 ? 100 : 0) : 
      ((newThisWeek - newLastWeek) / newLastWeek) * 100;

    const monthlyGrowth = newLastMonth === 0 ? 
      (newThisMonth > 0 ? 100 : 0) : 
      ((newThisMonth - newLastMonth) / newLastMonth) * 100;

    return {
      total,
      active,
      inactive,
      suspended,
      admins,
      users: regularUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      growthRate: {
        daily: dailyGrowth,
        weekly: weeklyGrowth,
        monthly: monthlyGrowth
      }
    };
  }, [users]);

  // Get recent users (limited)
  const recentUsers = useMemo(() => {
    return users.slice(0, limit);
  }, [users, limit]);

  const refreshUsers = async () => {
    // The real-time listener automatically refreshes data
    // This function is here for compatibility
    return Promise.resolve();
  };

  return {
    users,
    userStats,
    recentUsers,
    loading,
    error,
    refreshUsers
  };
};

// Hook for getting user signup trends
export const useUserSignupTrends = (days: number = 30) => {
  const [trends, setTrends] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const now = new Date();
        const trendData: { [key: string]: number } = {};
        
        // Initialize all days with 0
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          trendData[dateStr] = 0;
        }
        
        // Count signups per day
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const userDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const dateStr = userDate.toISOString().split('T')[0];
            
            if (trendData.hasOwnProperty(dateStr)) {
              trendData[dateStr]++;
            }
          }
        });
        
        // Convert to array format
        const trendsArray = Object.entries(trendData)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        setTrends(trendsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching signup trends:', err);
        setError('Failed to fetch signup trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [days]);

  return { trends, loading, error };
};

// Hook for getting user location statistics
export const useUserLocationStats = () => {
  const [locationStats, setLocationStats] = useState<{ country: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        try {
          const locationCount: { [key: string]: number } = {};
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const location = data.location || data.country || 'Unknown';
            locationCount[location] = (locationCount[location] || 0) + 1;
          });
          
          const stats = Object.entries(locationCount)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 locations
          
          setLocationStats(stats);
          setError(null);
        } catch (err) {
          console.error('Error processing location stats:', err);
          setError('Failed to process location statistics');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching location stats:', err);
        setError('Failed to fetch location statistics');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { locationStats, loading, error };
};

export default useRealtimeUsers;