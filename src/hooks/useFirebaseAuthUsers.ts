import { useState, useEffect, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface FirebaseAuthUser {
  // Firebase Authentication metadata
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  creationTime: string | null; // Firebase metadata.creationTime
  lastSignInTime: string | null; // Firebase metadata.lastSignInTime
  providerData: any[];
  disabled?: boolean; // Account status from Firebase Auth
  
  // Firestore user data (if exists)
  username?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  firestoreCreatedAt?: any;
  profileImage?: string;
  location?: string;
  deviceInfo?: string;
  
  // Computed fields
  accountAge: number; // in days
  daysSinceLastLogin: number;
  hasFirestoreProfile: boolean;
}

export interface FirebaseAuthStats {
  totalUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  anonymousUsers: number;
  disabledUsers: number;
  activeUsers: number; // Last sign-in within 7 days
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersWithProfiles: number; // Have Firestore profile
  usersWithoutProfiles: number; // Missing Firestore profile
  averageAccountAge: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface UseFirebaseAuthUsersReturn {
  authUsers: FirebaseAuthUser[];
  authStats: FirebaseAuthStats;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  syncWithFirestore: () => Promise<void>;
}

export const useFirebaseAuthUsers = (): UseFirebaseAuthUsersReturn => {
  const [authUsers, setAuthUsers] = useState<FirebaseAuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all users from Firebase Authentication through Firestore
  // Note: Direct Firebase Auth user listing requires Admin SDK on backend
  // This implementation combines available Auth data with Firestore profiles
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all Firestore user profiles
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const firestoreSnapshot = await getDocs(usersQuery);
      
      const firestoreUsers: { [uid: string]: any } = {};
      firestoreSnapshot.forEach((doc) => {
        firestoreUsers[doc.id] = { id: doc.id, ...doc.data() };
      });

      // For demonstration, we'll work with available data from Firestore
      // In production, you'd need Firebase Admin SDK on backend to list all auth users
      const combinedUsers: FirebaseAuthUser[] = [];

      // Process each Firestore user
      Object.values(firestoreUsers).forEach((firestoreUser: any) => {
        const now = new Date();
        const createdAt = firestoreUser.createdAt?.toDate?.() || new Date(firestoreUser.createdAt || now);
        const lastLogin = firestoreUser.lastLogin?.toDate?.() || createdAt;
        
        const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        const authUser: FirebaseAuthUser = {
          // Firebase Auth metadata (from Firestore stored data)
          uid: firestoreUser.uid,
          email: firestoreUser.email,
          displayName: firestoreUser.username || firestoreUser.displayName,
          phoneNumber: firestoreUser.phone || null,
          emailVerified: firestoreUser.emailVerified !== false, // Default to true if not specified
          isAnonymous: false,
          creationTime: createdAt.toISOString(),
          lastSignInTime: lastLogin.toISOString(),
          providerData: firestoreUser.providerData || [{ providerId: 'password' }],
          disabled: firestoreUser.status === 'suspended',
          
          // Firestore profile data
          username: firestoreUser.username,
          role: firestoreUser.role || 'user',
          status: firestoreUser.status || 'active',
          firestoreCreatedAt: firestoreUser.createdAt,
          profileImage: firestoreUser.profileImage,
          location: firestoreUser.location,
          deviceInfo: firestoreUser.deviceInfo,
          
          // Computed fields
          accountAge,
          daysSinceLastLogin,
          hasFirestoreProfile: true
        };

        combinedUsers.push(authUser);
      });

      setAuthUsers(combinedUsers);
      
    } catch (err: any) {
      console.error('Error fetching Firebase Auth users:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription to Firestore users
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        try {
          const now = new Date();
          const users: FirebaseAuthUser[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt || now);
            const lastLogin = data.lastLogin?.toDate?.() || createdAt;
            
            const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

            const authUser: FirebaseAuthUser = {
              // Firebase Auth metadata
              uid: doc.id,
              email: data.email,
              displayName: data.username || data.displayName,
              phoneNumber: data.phone || null,
              emailVerified: data.emailVerified !== false,
              isAnonymous: false,
              creationTime: createdAt.toISOString(),
              lastSignInTime: lastLogin.toISOString(),
              providerData: data.providerData || [{ providerId: 'password' }],
              disabled: data.status === 'suspended',
              
              // Firestore profile data
              username: data.username,
              role: data.role || 'user',
              status: data.status || 'active',
              firestoreCreatedAt: data.createdAt,
              profileImage: data.profileImage,
              location: data.location,
              deviceInfo: data.deviceInfo,
              
              // Computed fields
              accountAge,
              daysSinceLastLogin,
              hasFirestoreProfile: true
            };

            users.push(authUser);
          });

          setAuthUsers(users);
          setError(null);
        } catch (err: any) {
          console.error('Error processing real-time user updates:', err);
          setError(err.message || 'Failed to process user updates');
        }
      },
      (err) => {
        console.error('Real-time subscription error:', err);
        setError(err.message || 'Real-time connection failed');
      }
    );

    return unsubscribe;
  }, []);

  // Calculate comprehensive statistics
  const authStats: FirebaseAuthStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeekStart = new Date(weekStart.getTime() - (7 * 24 * 60 * 60 * 1000));
    const lastMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);

    let totalUsers = authUsers.length;
    let verifiedEmails = 0;
    let unverifiedEmails = 0;
    let anonymousUsers = 0;
    let disabledUsers = 0;
    let activeUsers = 0;
    let newUsersToday = 0;
    let newUsersThisWeek = 0;
    let newUsersThisMonth = 0;
    let usersWithProfiles = 0;
    let usersWithoutProfiles = 0;
    let totalAccountAge = 0;
    let newUsersLastWeek = 0;
    let newUsersLastMonth = 0;

    authUsers.forEach(user => {
      // Email verification status
      if (user.emailVerified) verifiedEmails++;
      else unverifiedEmails++;

      // Account type
      if (user.isAnonymous) anonymousUsers++;
      if (user.disabled) disabledUsers++;

      // Profile existence
      if (user.hasFirestoreProfile) usersWithProfiles++;
      else usersWithoutProfiles++;

      // Account age
      totalAccountAge += user.accountAge;

      // Active users (signed in within 7 days)
      if (user.daysSinceLastLogin <= 7) activeUsers++;

      // New user counts
      const creationDate = new Date(user.creationTime || now);
      if (creationDate >= todayStart) newUsersToday++;
      if (creationDate >= weekStart) newUsersThisWeek++;
      if (creationDate >= monthStart) newUsersThisMonth++;
      if (creationDate >= lastWeekStart && creationDate < weekStart) newUsersLastWeek++;
      if (creationDate >= lastMonthStart && creationDate < monthStart) newUsersLastMonth++;
    });

    const averageAccountAge = totalUsers > 0 ? totalAccountAge / totalUsers : 0;

    // Growth rate calculations
    const dailyGrowth = newUsersToday;
    const weeklyGrowth = newUsersLastWeek > 0 ? ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100 : 0;
    const monthlyGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;

    return {
      totalUsers,
      verifiedEmails,
      unverifiedEmails,
      anonymousUsers,
      disabledUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      usersWithProfiles,
      usersWithoutProfiles,
      averageAccountAge: Math.round(averageAccountAge),
      growthRate: {
        daily: dailyGrowth,
        weekly: Number(weeklyGrowth.toFixed(1)),
        monthly: Number(monthlyGrowth.toFixed(1))
      }
    };
  }, [authUsers]);

  const refreshUsers = async () => {
    await fetchUsers();
  };

  const syncWithFirestore = async () => {
    // This function would sync Firebase Auth users with Firestore
    // For now, it's a placeholder for future implementation
    console.log('Sync with Firestore initiated');
    await refreshUsers();
  };

  return {
    authUsers,
    authStats,
    loading,
    error,
    refreshUsers,
    syncWithFirestore
  };
};

// Hook for advanced Firebase Auth analytics
export const useFirebaseAuthAnalytics = () => {
  const { authUsers, authStats } = useFirebaseAuthUsers();

  const getSignupTrendData = (days: number = 30) => {
    const now = new Date();
    const trends: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));

      const count = authUsers.filter(user => {
        const creationDate = new Date(user.creationTime || now);
        return creationDate >= dayStart && creationDate < dayEnd;
      }).length;

      trends.push({ date: dateStr, count });
    }

    return trends;
  };

  const getUsersByProvider = () => {
    const providers: { [key: string]: number } = {};
    
    authUsers.forEach(user => {
      user.providerData.forEach(provider => {
        const providerId = provider.providerId || 'unknown';
        providers[providerId] = (providers[providerId] || 0) + 1;
      });
    });

    return Object.entries(providers).map(([provider, count]) => ({
      provider: provider.replace('password', 'Email/Password').replace('google.com', 'Google'),
      count
    }));
  };

  const getActiveUsersTrend = (days: number = 7) => {
    const now = new Date();
    const trends: { date: string; activeUsers: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const activeCount = authUsers.filter(user => {
        const lastSignIn = new Date(user.lastSignInTime || user.creationTime || now);
        return lastSignIn <= date;
      }).length;

      trends.push({ date: dateStr, activeUsers: activeCount });
    }

    return trends;
  };

  return {
    authUsers,
    authStats,
    getSignupTrendData,
    getUsersByProvider,
    getActiveUsersTrend
  };
};