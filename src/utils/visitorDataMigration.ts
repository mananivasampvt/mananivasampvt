import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Migration script to upgrade from old visitor tracking to enhanced visitor tracking
 * This should be run once when deploying the new system
 */
export const migrateVisitorData = async (): Promise<void> => {
  console.log('Starting visitor data migration...');
  
  try {
    // Get old visitor stats
    const oldStatsRef = doc(db, 'stats', 'visitorCount');
    const oldStatsSnap = await getDoc(oldStatsRef);
    
    if (oldStatsSnap.exists()) {
      const oldData = oldStatsSnap.data();
      const oldCount = oldData.count || 0;
      const oldLastVisit = oldData.lastVisit;
      
      console.log(`Found old visitor data: ${oldCount} visitors`);
      
      // Create new global stats with migrated data
      const newStatsRef = doc(db, 'visitorStats', 'global');
      await setDoc(newStatsRef, {
        uniqueVisitors: oldCount,
        pageViews: Math.floor(oldCount * 1.5), // Estimate page views as 1.5x unique visitors
        lastVisit: oldLastVisit,
        lastUpdate: new Date()
      });
      
      // Create today's daily stats with the migrated data
      const today = new Date().toISOString().split('T')[0];
      const dailyStatsRef = doc(db, 'dailyVisitorStats', today);
      await setDoc(dailyStatsRef, {
        date: today,
        uniqueVisitors: 0, // Start fresh for today
        pageViews: 0,
        lastUpdate: new Date()
      });
      
      console.log('Migration completed successfully!');
      console.log(`Migrated ${oldCount} unique visitors`);
      console.log(`Estimated ${Math.floor(oldCount * 1.5)} page views`);
    } else {
      console.log('No old visitor data found, initializing new system...');
      
      // Initialize new system with zero counts
      const newStatsRef = doc(db, 'visitorStats', 'global');
      await setDoc(newStatsRef, {
        uniqueVisitors: 0,
        pageViews: 0,
        lastVisit: null,
        lastUpdate: new Date()
      });
      
      // Create today's daily stats
      const today = new Date().toISOString().split('T')[0];
      const dailyStatsRef = doc(db, 'dailyVisitorStats', today);
      await setDoc(dailyStatsRef, {
        date: today,
        uniqueVisitors: 0,
        pageViews: 0,
        lastUpdate: new Date()
      });
      
      console.log('New visitor tracking system initialized');
    }
    
  } catch (error) {
    console.error('Error during visitor data migration:', error);
    throw error;
  }
};

/**
 * Initialize daily stats for the past week (for demo purposes)
 */
export const initializeDemoData = async (): Promise<void> => {
  console.log('Initializing demo data for the past week...');
  
  try {
    const batch = writeBatch(db);
    const today = new Date();
    
    // Create demo data for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate realistic demo data
      const baseVisitors = Math.floor(Math.random() * 50) + 20; // 20-70 visitors
      const visitors = i === 0 ? Math.floor(baseVisitors * 0.7) : baseVisitors; // Today has fewer visitors
      const pageViews = Math.floor(visitors * (1.3 + Math.random() * 0.7)); // 1.3-2.0 pages per visitor
      
      const dailyStatsRef = doc(db, 'dailyVisitorStats', dateString);
      batch.set(dailyStatsRef, {
        date: dateString,
        uniqueVisitors: visitors,
        pageViews: pageViews,
        lastUpdate: new Date()
      });
    }
    
    await batch.commit();
    
    // Update global stats with sum of demo data
    const dailyStatsSnap = await getDocs(collection(db, 'dailyVisitorStats'));
    let totalVisitors = 0;
    let totalPageViews = 0;
    
    dailyStatsSnap.forEach(doc => {
      const data = doc.data();
      totalVisitors += data.uniqueVisitors || 0;
      totalPageViews += data.pageViews || 0;
    });
    
    const globalStatsRef = doc(db, 'visitorStats', 'global');
    await setDoc(globalStatsRef, {
      uniqueVisitors: totalVisitors,
      pageViews: totalPageViews,
      lastVisit: new Date(),
      lastUpdate: new Date()
    });
    
    console.log(`Demo data initialized: ${totalVisitors} total visitors, ${totalPageViews} total page views`);
    
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
};

/**
 * Clean up old visitor tracking data (run after migration is confirmed working)
 */
export const cleanupOldVisitorData = async (): Promise<void> => {
  console.log('Cleaning up old visitor tracking data...');
  
  try {
    // This would delete the old visitor tracking document
    // Uncomment when you're confident the new system is working
    /*
    const oldStatsRef = doc(db, 'stats', 'visitorCount');
    await deleteDoc(oldStatsRef);
    console.log('Old visitor data cleaned up');
    */
    
    console.log('Cleanup skipped - uncomment code when ready');
  } catch (error) {
    console.error('Error cleaning up old visitor data:', error);
    throw error;
  }
};