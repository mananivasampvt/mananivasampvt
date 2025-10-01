import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface VisitorStats {
  uniqueVisitors: number;
  pageViews: number;
  lastVisit: Date | null;
  dailyStats: {
    date: string;
    uniqueVisitors: number;
    pageViews: number;
  }[];
}

export interface VisitorSession {
  id: string;
  fingerprint: string;
  ipHash: string;
  firstVisit: Date;
  lastVisit: Date;
  pageViews: number;
  userAgent: string;
  isBot: boolean;
  location?: {
    country?: string;
    city?: string;
  };
}

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /facebook/i,
  /twitter/i,
  /linkedin/i,
  /whatsapp/i,
  /telegram/i,
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterestbot/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /node/i
];

// Generate browser fingerprint
const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled,
    typeof localStorage !== 'undefined',
    typeof sessionStorage !== 'undefined',
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Simple IP hash (client-side approximation)
const generateClientHash = (): string => {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Detect if request is from a bot
const isBot = (): boolean => {
  const userAgent = navigator.userAgent;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
};

// Get visitor session ID from localStorage with expiration
const getVisitorSessionId = (): string => {
  const VISITOR_SESSION_KEY = 'visitor_session_v2';
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  const stored = localStorage.getItem(VISITOR_SESSION_KEY);
  if (stored) {
    try {
      const { sessionId, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < SESSION_DURATION) {
        return sessionId;
      }
    } catch (e) {
      // Invalid stored data, continue to create new session
    }
  }
  
  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(VISITOR_SESSION_KEY, JSON.stringify({
    sessionId,
    timestamp: Date.now()
  }));
  
  return sessionId;
};

// Check if this is a page reload within the same session
const isPageReload = (): boolean => {
  const SESSION_PAGE_KEY = 'session_page_visited';
  const hasVisited = sessionStorage.getItem(SESSION_PAGE_KEY);
  
  if (!hasVisited) {
    sessionStorage.setItem(SESSION_PAGE_KEY, 'true');
    return false;
  }
  
  return true;
};

// Get today's date string
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Enhanced visitor tracking with unique visitor identification
 */
export const trackEnhancedVisitor = async (): Promise<void> => {
  try {
    // Skip bot traffic
    if (isBot()) {
      console.log('Bot detected, skipping visitor tracking');
      return;
    }

    const fingerprint = generateFingerprint();
    const clientHash = generateClientHash();
    const sessionId = getVisitorSessionId();
    const isReload = isPageReload();
    const today = getTodayString();
    
    // Always increment page views
    await incrementPageViews(today);
    
    // Check if this is a unique visitor
    const isUniqueVisitor = await checkAndTrackUniqueVisitor(
      sessionId,
      fingerprint,
      clientHash,
      isReload
    );
    
    if (isUniqueVisitor) {
      await incrementUniqueVisitors(today);
      console.log('New unique visitor tracked');
    } else {
      console.log('Returning visitor - page view tracked');
    }
    
  } catch (error) {
    console.error('Error in enhanced visitor tracking:', error);
  }
};

/**
 * Increment page views counter
 */
const incrementPageViews = async (date: string): Promise<void> => {
  const statsRef = doc(db, 'visitorStats', 'global');
  const dailyStatsRef = doc(db, 'dailyVisitorStats', date);
  
  // Update global page views
  const globalStats = await getDoc(statsRef);
  if (globalStats.exists()) {
    await updateDoc(statsRef, {
      pageViews: increment(1),
      lastUpdate: serverTimestamp()
    });
  } else {
    await setDoc(statsRef, {
      uniqueVisitors: 0,
      pageViews: 1,
      lastUpdate: serverTimestamp()
    });
  }
  
  // Update daily page views
  const dailyStats = await getDoc(dailyStatsRef);
  if (dailyStats.exists()) {
    await updateDoc(dailyStatsRef, {
      pageViews: increment(1),
      lastUpdate: serverTimestamp()
    });
  } else {
    await setDoc(dailyStatsRef, {
      date,
      uniqueVisitors: 0,
      pageViews: 1,
      lastUpdate: serverTimestamp()
    });
  }
};

/**
 * Check if visitor is unique and track accordingly
 */
const checkAndTrackUniqueVisitor = async (
  sessionId: string,
  fingerprint: string,
  clientHash: string,
  isReload: boolean
): Promise<boolean> => {
  try {
    // Check if visitor already exists by fingerprint or session
    const visitorsRef = collection(db, 'visitorSessions');
    const fingerprintQuery = query(
      visitorsRef,
      where('fingerprint', '==', fingerprint),
      limit(1)
    );
    
    const existingByFingerprint = await getDocs(fingerprintQuery);
    
    if (!existingByFingerprint.empty) {
      // Update existing visitor session
      const visitorDoc = existingByFingerprint.docs[0];
      await updateDoc(visitorDoc.ref, {
        lastVisit: serverTimestamp(),
        pageViews: increment(1),
        sessionId // Update with current session ID
      });
      return false; // Not a unique visitor
    }
    
    // Check by session ID as backup
    const sessionQuery = query(
      visitorsRef,
      where('sessionId', '==', sessionId),
      limit(1)
    );
    
    const existingBySession = await getDocs(sessionQuery);
    
    if (!existingBySession.empty) {
      // Update existing session
      const sessionDoc = existingBySession.docs[0];
      await updateDoc(sessionDoc.ref, {
        lastVisit: serverTimestamp(),
        pageViews: increment(1)
      });
      return false; // Not a unique visitor
    }
    
    // This is a new unique visitor
    await addDoc(visitorsRef, {
      sessionId,
      fingerprint,
      clientHash,
      firstVisit: serverTimestamp(),
      lastVisit: serverTimestamp(),
      pageViews: 1,
      userAgent: navigator.userAgent,
      isBot: false,
      location: await getApproximateLocation()
    });
    
    return true; // This is a unique visitor
    
  } catch (error) {
    console.error('Error checking unique visitor:', error);
    return false;
  }
};

/**
 * Increment unique visitors counter
 */
const incrementUniqueVisitors = async (date: string): Promise<void> => {
  const statsRef = doc(db, 'visitorStats', 'global');
  const dailyStatsRef = doc(db, 'dailyVisitorStats', date);
  
  // Update global unique visitors
  const globalStats = await getDoc(statsRef);
  if (globalStats.exists()) {
    await updateDoc(statsRef, {
      uniqueVisitors: increment(1),
      lastVisit: serverTimestamp(),
      lastUpdate: serverTimestamp()
    });
  } else {
    await setDoc(statsRef, {
      uniqueVisitors: 1,
      pageViews: 0,
      lastVisit: serverTimestamp(),
      lastUpdate: serverTimestamp()
    });
  }
  
  // Update daily unique visitors
  const dailyStats = await getDoc(dailyStatsRef);
  if (dailyStats.exists()) {
    await updateDoc(dailyStatsRef, {
      uniqueVisitors: increment(1),
      lastVisit: serverTimestamp(),
      lastUpdate: serverTimestamp()
    });
  } else {
    await setDoc(dailyStatsRef, {
      date,
      uniqueVisitors: 1,
      pageViews: 0,
      lastVisit: serverTimestamp(),
      lastUpdate: serverTimestamp()
    });
  }
};

/**
 * Get approximate location (using a free service)
 */
const getApproximateLocation = async (): Promise<{ country?: string; city?: string }> => {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    }
  } catch (error) {
    console.log('Could not get location:', error);
  }
  return {};
};

/**
 * Get enhanced visitor statistics
 */
export const getEnhancedVisitorStats = async (): Promise<VisitorStats> => {
  try {
    const statsRef = doc(db, 'visitorStats', 'global');
    const statsSnap = await getDoc(statsRef);
    
    let uniqueVisitors = 0;
    let pageViews = 0;
    let lastVisit: Date | null = null;
    
    if (statsSnap.exists()) {
      const data = statsSnap.data();
      uniqueVisitors = data.uniqueVisitors || 0;
      pageViews = data.pageViews || 0;
      lastVisit = data.lastVisit?.toDate ? data.lastVisit.toDate() : null;
    }
    
    // Get daily stats for the last 7 days
    const dailyStats = await getDailyStats(7);
    
    return {
      uniqueVisitors,
      pageViews,
      lastVisit,
      dailyStats
    };
  } catch (error) {
    console.error('Error fetching enhanced visitor stats:', error);
    return {
      uniqueVisitors: 0,
      pageViews: 0,
      lastVisit: null,
      dailyStats: []
    };
  }
};

/**
 * Get daily statistics for the last N days
 */
export const getDailyStats = async (days: number = 7): Promise<{ date: string; uniqueVisitors: number; pageViews: number; }[]> => {
  try {
    const dailyStatsRef = collection(db, 'dailyVisitorStats');
    const recentStatsQuery = query(
      dailyStatsRef,
      orderBy('date', 'desc'),
      limit(days)
    );
    
    const querySnapshot = await getDocs(recentStatsQuery);
    const stats = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.date,
        uniqueVisitors: data.uniqueVisitors || 0,
        pageViews: data.pageViews || 0
      };
    });
    
    return stats.reverse(); // Show oldest to newest
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }
};

/**
 * Get visitor sessions (for admin analysis)
 */
export const getVisitorSessions = async (maxResults: number = 50): Promise<VisitorSession[]> => {
  try {
    const visitorsRef = collection(db, 'visitorSessions');
    const recentVisitorsQuery = query(
      visitorsRef,
      orderBy('lastVisit', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(recentVisitorsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fingerprint: data.fingerprint,
        ipHash: data.clientHash,
        firstVisit: data.firstVisit?.toDate ? data.firstVisit.toDate() : new Date(),
        lastVisit: data.lastVisit?.toDate ? data.lastVisit.toDate() : new Date(),
        pageViews: data.pageViews || 1,
        userAgent: data.userAgent || 'Unknown',
        isBot: data.isBot || false,
        location: data.location || {}
      };
    });
  } catch (error) {
    console.error('Error fetching visitor sessions:', error);
    return [];
  }
};