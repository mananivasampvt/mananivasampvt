// Firebase Authentication Sync Service
// Handles communication with backend APIs for user synchronization

export interface SyncResult {
  success: boolean;
  totalAuthUsers: number;
  totalFirestoreUsers: number;
  missingUsers: number;
  syncedUsers: Array<{
    uid: string;
    email: string | null;
    displayName: string | null;
  }>;
  error?: string;
}

export interface AuthUserCount {
  success: boolean;
  totalUsers: number;
  users: Array<{
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
    creationTime: string;
    lastSignInTime: string | null;
    disabled: boolean;
  }>;
  error?: string;
}

class FirebaseAuthSyncService {
  private baseUrl: string;

  constructor() {
    // Detect environment and set appropriate base URL
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    // For development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    
    // For production - update with your actual domain
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // Fallback
    return '';
  }

  /**
   * Sync Firebase Authentication users with Firestore profiles
   * Creates missing Firestore documents for Firebase Auth users
   */
  async syncFirebaseUsers(): Promise<SyncResult> {
    try {
      console.log('🔄 Starting Firebase user sync...');
      
      const response = await fetch(`${this.baseUrl}/api/sync-firebase-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add authentication if required
        // headers: {
        //   'Authorization': `Bearer ${await this.getAuthToken()}`,
        //   'Content-Type': 'application/json',
        // },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      
      if (result.success) {
        console.log('✅ Firebase user sync completed successfully!');
        console.log(`📊 Total Firebase Auth users: ${result.totalAuthUsers}`);
        console.log(`📊 Total Firestore users: ${result.totalFirestoreUsers}`);
        console.log(`🔄 Synced ${result.missingUsers} missing profiles`);
        
        if (result.syncedUsers.length > 0) {
          console.log('👥 Synced users:', result.syncedUsers);
        }
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error syncing Firebase users:', error);
      return {
        success: false,
        totalAuthUsers: 0,
        totalFirestoreUsers: 0,
        missingUsers: 0,
        syncedUsers: [],
        error: error.message || 'Failed to sync Firebase users'
      };
    }
  }

  /**
   * Get the total count of Firebase Authentication users
   * This bypasses Firestore and gets data directly from Firebase Auth
   */
  async getFirebaseAuthUserCount(): Promise<AuthUserCount> {
    try {
      console.log('📊 Fetching Firebase Auth user count...');
      
      const response = await fetch(`${this.baseUrl}/api/firebase-auth-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AuthUserCount = await response.json();
      
      if (result.success) {
        console.log(`✅ Firebase Auth user count: ${result.totalUsers}`);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching Firebase Auth user count:', error);
      return {
        success: false,
        totalUsers: 0,
        users: [],
        error: error.message || 'Failed to fetch Firebase Auth user count'
      };
    }
  }

  /**
   * Get authentication token for secure API calls
   * Uncomment and implement if backend requires authentication
   */
  // private async getAuthToken(): Promise<string> {
  //   const { auth } = await import('@/lib/firebase');
  //   const user = auth.currentUser;
  //   
  //   if (!user) {
  //     throw new Error('User not authenticated');
  //   }
  //   
  //   return await user.getIdToken();
  // }

  /**
   * Test the backend connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Backend connection successful'
        };
      } else {
        return {
          success: false,
          message: `Backend connection failed: ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Backend connection error: ${error.message}`
      };
    }
  }

  /**
   * Schedule automatic sync (client-side implementation)
   * Note: For production, implement this as a server-side cron job
   */
  scheduleAutoSync(intervalMinutes: number = 60): () => void {
    console.log(`🕐 Scheduling auto-sync every ${intervalMinutes} minutes`);
    
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled sync...');
        const result = await this.syncFirebaseUsers();
        
        if (result.success && result.missingUsers > 0) {
          console.log(`✅ Scheduled sync completed: ${result.missingUsers} users synced`);
        }
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log('🛑 Auto-sync stopped');
    };
  }
}

// Export singleton instance
export const firebaseAuthSyncService = new FirebaseAuthSyncService();

// Export class for custom instances
export { FirebaseAuthSyncService };

// Utility functions
export const formatSyncResult = (result: SyncResult): string => {
  if (!result.success) {
    return `❌ Sync failed: ${result.error}`;
  }

  if (result.missingUsers === 0) {
    return `✅ All users are synced (${result.totalAuthUsers} total)`;
  }

  return `✅ Synced ${result.missingUsers} missing users (${result.totalAuthUsers} total)`;
};

export const formatUserCount = (authCount: AuthUserCount): string => {
  if (!authCount.success) {
    return `❌ Failed to get user count: ${authCount.error}`;
  }

  return `👥 ${authCount.totalUsers} users in Firebase Authentication`;
};