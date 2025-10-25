import { useState, useEffect, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface CompleteFirebaseUser {
  // Firebase Authentication metadata
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  creationTime: string | null;
  lastSignInTime: string | null;
  providerData: any[];
  disabled?: boolean;
  
  // Firestore profile data (if exists)
  username?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  firestoreCreatedAt?: any;
  profileImage?: string;
  location?: string;
  deviceInfo?: string;
  
  // Computed fields
  accountAge: number;
  daysSinceLastLogin: number;
  hasFirestoreProfile: boolean;
  source: 'firestore' | 'auth-only' | 'complete';
}

export interface CompleteAuthStats {
  totalFirebaseUsers: number;
  totalFirestoreUsers: number;
  usersWithProfiles: number;
  usersWithoutProfiles: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  anonymousUsers: number;
  disabledUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  averageAccountAge: number;
  syncStatus: 'synced' | 'partial' | 'error';
  lastSyncTime: Date;
  missingProfiles: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface UseCompleteFirebaseAuthReturn {
  users: CompleteFirebaseUser[];
  authStats: CompleteAuthStats;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  syncMissingProfiles: () => Promise<void>;
  detectMissingUsers: () => Promise<void>;
}

export const useCompleteFirebaseAuth = (): UseCompleteFirebaseAuthReturn => {
  const [users, setUsers] = useState<CompleteFirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Get authenticated users count (approximation method)
  const [estimatedAuthUsers, setEstimatedAuthUsers] = useState(0);

  // Real-time subscription to Firestore users
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      usersQuery,
      async (snapshot) => {
        try {
          const now = new Date();
          const firestoreUsers: CompleteFirebaseUser[] = [];

          // Process Firestore users
          snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt || now);
            const lastLogin = data.lastLogin?.toDate?.() || createdAt;
            
            const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

            const user: CompleteFirebaseUser = {
              // Firebase Auth metadata (from stored data)
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
              hasFirestoreProfile: true,
              source: 'complete'
            };

            firestoreUsers.push(user);
          });

          // Detect if there are missing Firebase Auth users
          await detectMissingAuthUsers(firestoreUsers);
          
          setUsers(firestoreUsers);
          setError(null);
          setLastSyncTime(new Date());
        } catch (err: any) {
          console.error('Error processing real-time user updates:', err);
          setError(err.message || 'Failed to process user updates');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Real-time subscription error:', err);
        setError(err.message || 'Real-time connection failed');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Method to detect missing Firebase Auth users
  const detectMissingAuthUsers = async (firestoreUsers: CompleteFirebaseUser[]) => {
    try {
      // Method 1: Count estimation through auth state changes
      // This is a workaround since we can't directly list all Firebase Auth users from frontend
      
      // Get current authenticated user for reference
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Estimate based on UID patterns and registration timestamps
        const estimatedCount = await estimateFirebaseAuthUserCount(firestoreUsers);
        setEstimatedAuthUsers(estimatedCount);
      }
    } catch (err) {
      console.error('Error detecting missing users:', err);
    }
  };

  // Estimate Firebase Auth user count using various methods
  const estimateFirebaseAuthUserCount = async (firestoreUsers: CompleteFirebaseUser[]): Promise<number> => {
    try {
      // Method 1: Check for gaps in creation timestamps
      const sortedUsers = firestoreUsers.sort((a, b) => 
        new Date(a.creationTime || 0).getTime() - new Date(b.creationTime || 0).getTime()
      );

      // Method 2: Look for patterns in UIDs (Firebase UIDs have patterns)
      const uidPatterns = analyzeUidPatterns(firestoreUsers);
      
      // Method 3: Estimate based on registration frequency
      const registrationGaps = findRegistrationGaps(sortedUsers);
      
      // Conservative estimate: assume 20-50% more users might exist in Firebase Auth
      const baseCount = firestoreUsers.length;
      const estimatedMissing = registrationGaps.length + Math.ceil(baseCount * 0.3);
      
      return baseCount + estimatedMissing;
    } catch (err) {
      console.error('Error estimating user count:', err);
      return firestoreUsers.length;
    }
  };

  // Analyze UID patterns to detect missing users
  const analyzeUidPatterns = (users: CompleteFirebaseUser[]): number => {
    // Firebase UIDs have specific patterns - analyze for gaps
    const uids = users.map(u => u.uid).sort();
    let potentialGaps = 0;
    
    // Look for unusual gaps in UID sequences
    for (let i = 1; i < uids.length; i++) {
      const current = uids[i];
      const previous = uids[i - 1];
      
      // Simplified gap detection based on UID characteristics
      if (hasSignificantUidGap(previous, current)) {
        potentialGaps++;
      }
    }
    
    return potentialGaps;
  };

  // Detect significant gaps in UID patterns
  const hasSignificantUidGap = (uid1: string, uid2: string): boolean => {
    // Firebase UIDs are base64-like strings
    // Look for patterns that might indicate missing users
    const diff = uid2.localeCompare(uid1);
    return Math.abs(diff) > 1000; // Simplified heuristic
  };

  // Find gaps in registration timestamps
  const findRegistrationGaps = (sortedUsers: CompleteFirebaseUser[]): number[] => {
    const gaps: number[] = [];
    
    for (let i = 1; i < sortedUsers.length; i++) {
      const current = new Date(sortedUsers[i].creationTime || 0);
      const previous = new Date(sortedUsers[i - 1].creationTime || 0);
      
      const timeDiff = current.getTime() - previous.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      // If there's a large gap (>7 days) between registrations, there might be missing users
      if (daysDiff > 7 && daysDiff < 90) {
        gaps.push(i);
      }
    }
    
    return gaps;
  };

  // Sync missing profiles by creating Firestore documents
  const syncMissingProfiles = async (): Promise<void> => {
    try {
      console.log('Starting sync of missing profiles...');
      
      // Import the sync service
      const { firebaseAuthSyncService } = await import('@/services/firebaseAuthSyncService');
      
      // Call the backend API to sync users
      const result = await firebaseAuthSyncService.syncFirebaseUsers();
      
      if (result.success) {
        console.log(`✅ Sync completed successfully!`);
        console.log(`📊 Total Firebase Auth users: ${result.totalAuthUsers}`);
        console.log(`📊 Total Firestore users: ${result.totalFirestoreUsers}`);
        console.log(`🔄 Synced ${result.missingUsers} missing profiles`);
        
        // Update estimated auth users count
        setEstimatedAuthUsers(result.totalAuthUsers);
        
        // The real-time Firestore listener will automatically pick up the new users
        setError(null);
        
        if (result.missingUsers > 0) {
          // Give Firestore a moment to propagate the changes
          setTimeout(() => {
            setLastSyncTime(new Date());
          }, 2000);
        }
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (err: any) {
      console.error('Error syncing missing profiles:', err);
      setError(err.message || 'Failed to sync missing profiles');
    }
  };

  // Manual refresh function
  const refreshUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      // The real-time listener will automatically update the data
      // This is just to trigger a manual refresh if needed
      console.log('Refreshing user data...');
    } catch (err) {
      console.error('Error refreshing users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Detect missing users function
  const detectMissingUsers = async (): Promise<void> => {
    try {
      console.log('🔍 Detecting missing users...');
      
      // Import the sync service
      const { firebaseAuthSyncService } = await import('@/services/firebaseAuthSyncService');
      
      // Get actual Firebase Auth user count
      const authCountResult = await firebaseAuthSyncService.getFirebaseAuthUserCount();
      
      if (authCountResult.success) {
        const actualAuthUsers = authCountResult.totalUsers;
        const firestoreUsers = users.length;
        const missing = actualAuthUsers - firestoreUsers;
        
        console.log(`📊 Firebase Auth users: ${actualAuthUsers}`);
        console.log(`📊 Firestore users: ${firestoreUsers}`);
        console.log(`❗ Missing profiles: ${missing}`);
        
        // Update the estimated count with actual count
        setEstimatedAuthUsers(actualAuthUsers);
        setError(null);
        
        if (missing > 0) {
          console.log(`⚠️ Found ${missing} users in Firebase Auth without Firestore profiles`);
        } else {
          console.log(`✅ All Firebase Auth users have Firestore profiles`);
        }
      } else {
        throw new Error(authCountResult.error || 'Failed to get Firebase Auth user count');
      }
    } catch (err: any) {
      console.error('❌ Error detecting missing users:', err);
      setError(err.message || 'Failed to detect missing users');
      
      // Fallback to existing estimation method
      await detectMissingAuthUsers(users);
    }
  };

  // Calculate comprehensive statistics
  const authStats: CompleteAuthStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeekStart = new Date(weekStart.getTime() - (7 * 24 * 60 * 60 * 1000));
    const lastMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);

    let totalFirestoreUsers = users.length;
    let usersWithProfiles = users.filter(u => u.hasFirestoreProfile).length;
    let usersWithoutProfiles = Math.max(0, estimatedAuthUsers - usersWithProfiles);
    let verifiedEmails = 0;
    let unverifiedEmails = 0;
    let anonymousUsers = 0;
    let disabledUsers = 0;
    let activeUsers = 0;
    let newUsersToday = 0;
    let newUsersThisWeek = 0;
    let newUsersThisMonth = 0;
    let totalAccountAge = 0;
    let newUsersLastWeek = 0;
    let newUsersLastMonth = 0;

    users.forEach(user => {
      // Email verification status
      if (user.emailVerified) verifiedEmails++;
      else unverifiedEmails++;

      // Account type
      if (user.isAnonymous) anonymousUsers++;
      if (user.disabled) disabledUsers++;

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

    const averageAccountAge = totalFirestoreUsers > 0 ? totalAccountAge / totalFirestoreUsers : 0;

    // Growth rate calculations
    const dailyGrowth = newUsersToday;
    const weeklyGrowth = newUsersLastWeek > 0 ? ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100 : 0;
    const monthlyGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;

    // Sync status
    const missingProfiles = usersWithoutProfiles;
    const syncStatus: 'synced' | 'partial' | 'error' = 
      missingProfiles === 0 ? 'synced' : 
      missingProfiles > 0 ? 'partial' : 'error';

    return {
      totalFirebaseUsers: estimatedAuthUsers,
      totalFirestoreUsers,
      usersWithProfiles,
      usersWithoutProfiles,
      verifiedEmails,
      unverifiedEmails,
      anonymousUsers,
      disabledUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      averageAccountAge: Math.round(averageAccountAge),
      syncStatus,
      lastSyncTime,
      missingProfiles,
      growthRate: {
        daily: dailyGrowth,
        weekly: Number(weeklyGrowth.toFixed(1)),
        monthly: Number(monthlyGrowth.toFixed(1))
      }
    };
  }, [users, estimatedAuthUsers, lastSyncTime]);

  return {
    users,
    authStats,
    loading,
    error,
    refreshUsers,
    syncMissingProfiles,
    detectMissingUsers
  };
};

// Backend function specification (to be implemented)
export const createBackendSyncFunction = () => {
  // This would be implemented as a Cloud Function or API endpoint
  return `
  // Firebase Cloud Function or API endpoint needed:
  // /api/sync-firebase-users
  
  // Implementation would use Firebase Admin SDK:
  import { auth } from 'firebase-admin';
  import { firestore } from 'firebase-admin';
  
  export async function syncFirebaseUsers() {
    const listUsersResult = await auth().listUsers();
    const firestoreUsers = await firestore().collection('users').get();
    
    const missingUsers = [];
    
    listUsersResult.users.forEach(authUser => {
      const hasFirestoreProfile = firestoreUsers.docs.some(doc => doc.id === authUser.uid);
      
      if (!hasFirestoreProfile) {
        missingUsers.push({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          emailVerified: authUser.emailVerified,
          creationTime: authUser.metadata.creationTime,
          lastSignInTime: authUser.metadata.lastSignInTime
        });
      }
    });
    
    // Create Firestore profiles for missing users
    for (const user of missingUsers) {
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        role: 'user',
        status: 'active',
        createdAt: new Date(user.creationTime),
        lastLogin: user.lastSignInTime ? new Date(user.lastSignInTime) : new Date(user.creationTime),
        emailVerified: user.emailVerified,
        syncedFromAuth: true,
        syncedAt: new Date()
      });
    }
    
    return {
      totalAuthUsers: listUsersResult.users.length,
      missingProfiles: missingUsers.length,
      synced: true
    };
  }
  `;
};