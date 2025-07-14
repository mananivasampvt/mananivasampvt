import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Increment the visitor count in Firestore if not already counted in this session.
 * Uses sessionStorage to avoid duplicate counts per session.
 */
export const trackUniqueVisitor = async () => {
  if (sessionStorage.getItem('visitorCounted')) return;

  try {
    const statsRef = doc(db, 'stats', 'visitorCount');
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        count: increment(1),
        lastVisit: serverTimestamp()
      });
    } else {
      await setDoc(statsRef, {
        count: 1,
        lastVisit: serverTimestamp()
      });
    }
    sessionStorage.setItem('visitorCounted', 'true');
  } catch (error) {
    console.error('Error tracking visitor:', error);
  }
};

/**
 * Fetch visitor count and last visit timestamp from Firestore.
 */
export const getVisitorStats = async () => {
  try {
    const statsRef = doc(db, 'stats', 'visitorCount');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      const data = statsSnap.data();
      return {
        count: data.count || 0,
        lastVisit: data.lastVisit?.toDate ? data.lastVisit.toDate() : null
      };
    }
    return { count: 0, lastVisit: null };
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return { count: 0, lastVisit: null };
  }
};
