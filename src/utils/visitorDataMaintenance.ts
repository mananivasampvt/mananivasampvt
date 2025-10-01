import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Background service for visitor data maintenance
 */
export class VisitorDataMaintenanceService {
  private static instance: VisitorDataMaintenanceService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SESSION_RETENTION_DAYS = 30; // Keep visitor sessions for 30 days
  private readonly MAX_SESSIONS = 10000; // Maximum number of visitor sessions to keep

  static getInstance(): VisitorDataMaintenanceService {
    if (!VisitorDataMaintenanceService.instance) {
      VisitorDataMaintenanceService.instance = new VisitorDataMaintenanceService();
    }
    return VisitorDataMaintenanceService.instance;
  }

  /**
   * Start the background maintenance service
   */
  start(): void {
    if (this.cleanupInterval) {
      console.log('Visitor data maintenance service is already running');
      return;
    }

    console.log('Starting visitor data maintenance service');
    
    // Run cleanup immediately
    this.performMaintenance();
    
    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performMaintenance();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop the background maintenance service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Visitor data maintenance service stopped');
    }
  }

  /**
   * Perform all maintenance tasks
   */
  private async performMaintenance(): Promise<void> {
    try {
      console.log('Running visitor data maintenance...');
      
      await Promise.all([
        this.cleanupOldSessions(),
        this.cleanupExcessSessions(),
        this.cleanupOldDailyStats()
      ]);
      
      console.log('Visitor data maintenance completed');
    } catch (error) {
      console.error('Error during visitor data maintenance:', error);
    }
  }

  /**
   * Remove visitor sessions older than retention period
   */
  private async cleanupOldSessions(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.SESSION_RETENTION_DAYS);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      const sessionsRef = collection(db, 'visitorSessions');
      const oldSessionsQuery = query(
        sessionsRef,
        where('lastVisit', '<', cutoffTimestamp),
        limit(100) // Process in batches to avoid overwhelming Firestore
      );

      const querySnapshot = await getDocs(oldSessionsQuery);
      
      if (querySnapshot.empty) {
        console.log('No old visitor sessions to clean up');
        return;
      }

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(`Cleaned up ${querySnapshot.docs.length} old visitor sessions`);
      
      // If we deleted the maximum batch size, there might be more to delete
      if (querySnapshot.docs.length === 100) {
        // Schedule another cleanup run
        setTimeout(() => this.cleanupOldSessions(), 1000);
      }
    } catch (error) {
      console.error('Error cleaning up old visitor sessions:', error);
    }
  }

  /**
   * Remove excess visitor sessions to keep database size manageable
   */
  private async cleanupExcessSessions(): Promise<void> {
    try {
      const sessionsRef = collection(db, 'visitorSessions');
      
      // Count total sessions (this is an approximation since Firestore doesn't have a direct count)
      const allSessionsQuery = query(
        sessionsRef,
        orderBy('lastVisit', 'desc'),
        limit(this.MAX_SESSIONS + 500) // Get a bit more than max to check if cleanup is needed
      );

      const querySnapshot = await getDocs(allSessionsQuery);
      
      if (querySnapshot.docs.length <= this.MAX_SESSIONS) {
        console.log(`Session count (${querySnapshot.docs.length}) is within limits`);
        return;
      }

      // Delete the oldest sessions beyond the limit
      const excessSessions = querySnapshot.docs.slice(this.MAX_SESSIONS);
      const deletePromises = excessSessions.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(`Cleaned up ${excessSessions.length} excess visitor sessions`);
    } catch (error) {
      console.error('Error cleaning up excess visitor sessions:', error);
    }
  }

  /**
   * Remove daily stats older than 90 days
   */
  private async cleanupOldDailyStats(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days of daily stats
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const dailyStatsRef = collection(db, 'dailyVisitorStats');
      const oldStatsQuery = query(
        dailyStatsRef,
        where('date', '<', cutoffDateString),
        limit(50) // Process in batches
      );

      const querySnapshot = await getDocs(oldStatsQuery);
      
      if (querySnapshot.empty) {
        console.log('No old daily stats to clean up');
        return;
      }

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(`Cleaned up ${querySnapshot.docs.length} old daily stats`);
    } catch (error) {
      console.error('Error cleaning up old daily stats:', error);
    }
  }

  /**
   * Get maintenance statistics
   */
  async getMaintenanceStats(): Promise<{
    totalSessions: number;
    oldSessions: number;
    totalDailyStats: number;
    lastMaintenance: Date | null;
  }> {
    try {
      const [sessionsSnapshot, dailyStatsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'visitorSessions'), limit(1000))),
        getDocs(query(collection(db, 'dailyVisitorStats'), limit(100)))
      ]);

      // Count old sessions
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.SESSION_RETENTION_DAYS);
      
      let oldSessionsCount = 0;
      sessionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.lastVisit && data.lastVisit.toDate() < cutoffDate) {
          oldSessionsCount++;
        }
      });

      return {
        totalSessions: sessionsSnapshot.docs.length,
        oldSessions: oldSessionsCount,
        totalDailyStats: dailyStatsSnapshot.docs.length,
        lastMaintenance: new Date() // In a real implementation, this would be stored
      };
    } catch (error) {
      console.error('Error getting maintenance stats:', error);
      return {
        totalSessions: 0,
        oldSessions: 0,
        totalDailyStats: 0,
        lastMaintenance: null
      };
    }
  }
}

// Create and export singleton instance
export const visitorDataMaintenance = VisitorDataMaintenanceService.getInstance();