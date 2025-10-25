import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface NewUserNotification {
  uid: string;
  username: string;
  email: string;
  createdAt: Date;
  isNew: boolean;
}

interface UseNewUserNotificationsOptions {
  enabled?: boolean;
  showToasts?: boolean;
  checkInterval?: number; // in minutes
}

interface UseNewUserNotificationsReturn {
  newUsers: NewUserNotification[];
  newUserCount: number;
  todaySignupCount: number;
  loading: boolean;
  error: string | null;
  clearNotifications: () => void;
  toggleNotifications: () => void;
  notificationsEnabled: boolean;
}

export const useNewUserNotifications = (
  options: UseNewUserNotificationsOptions = {}
): UseNewUserNotificationsReturn => {
  const {
    enabled = true,
    showToasts = true,
    checkInterval = 1 // Check every minute for new users
  } = options;

  const [newUsers, setNewUsers] = useState<NewUserNotification[]>([]);
  const [newUserCount, setNewUserCount] = useState(0);
  const [todaySignupCount, setTodaySignupCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(enabled);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (!notificationsEnabled) {
      setLoading(false);
      return;
    }

    const usersRef = collection(db, 'users');
    const recentUsersQuery = query(
      usersRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      recentUsersQuery,
      (snapshot) => {
        try {
          const users: NewUserNotification[] = [];
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          let todayCount = 0;
          let newCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.createdAt) return;

            const userDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            
            // Count signups for today
            if (userDate >= todayStart) {
              todayCount++;
            }

            // Check if this is a new user since last check
            const isNew = userDate > lastCheckTime;
            if (isNew) {
              newCount++;
              
              // Show toast notification for new signup
              if (showToasts && notificationsEnabled) {
                toast({
                  title: "🎉 New User Signup!",
                  description: `${data.username || 'New user'} just joined the platform`,
                  duration: 5000,
                });
              }
            }

            // Keep recent users for display (last 50)
            if (users.length < 50) {
              users.push({
                uid: doc.id,
                username: data.username || 'Unknown User',
                email: data.email || '',
                createdAt: userDate,
                isNew
              });
            }
          });

          setNewUsers(users);
          setNewUserCount(newCount);
          setTodaySignupCount(todayCount);
          setLastCheckTime(now);
          setError(null);
        } catch (err) {
          console.error('Error processing new user notifications:', err);
          setError('Failed to process user notifications');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error setting up new user notifications:', err);
        setError('Failed to set up user notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [notificationsEnabled, showToasts, lastCheckTime, toast]);

  // Periodic cleanup of notifications (remove old "new" flags)
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      setNewUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          isNew: false // Reset new flags after some time
        }))
      );
      setNewUserCount(0); // Reset new count
    }, checkInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [checkInterval, notificationsEnabled]);

  const clearNotifications = () => {
    setNewUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        isNew: false
      }))
    );
    setNewUserCount(0);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      // Re-enable notifications
      setLastCheckTime(new Date());
    }
  };

  return {
    newUsers,
    newUserCount,
    todaySignupCount,
    loading,
    error,
    clearNotifications,
    toggleNotifications,
    notificationsEnabled
  };
};

// Hook for getting real-time user statistics
export const useRealtimeUserStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        try {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

          let totalUsers = 0;
          let activeUsers = 0;
          let newToday = 0;
          let newThisWeek = 0;
          let newThisMonth = 0;
          let newYesterday = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            totalUsers++;

            // Count active users
            if (data.status === 'active' || !data.status) {
              activeUsers++;
            }

            // Count new signups by period
            if (data.createdAt) {
              const userDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
              
              if (userDate >= todayStart) {
                newToday++;
              }
              if (userDate >= weekStart) {
                newThisWeek++;
              }
              if (userDate >= monthStart) {
                newThisMonth++;
              }
              if (userDate >= yesterdayStart && userDate < todayStart) {
                newYesterday++;
              }
            }
          });

          // Calculate growth rate (today vs yesterday)
          const growthRate = newYesterday === 0 ? 
            (newToday > 0 ? 100 : 0) : 
            ((newToday - newYesterday) / newYesterday) * 100;

          setStats({
            totalUsers,
            activeUsers,
            newToday,
            newThisWeek,
            newThisMonth,
            growthRate
          });
          setError(null);
        } catch (err) {
          console.error('Error calculating user stats:', err);
          setError('Failed to calculate user statistics');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error setting up user stats listener:', err);
        setError('Failed to set up user statistics');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { stats, loading, error };
};

export default useNewUserNotifications;