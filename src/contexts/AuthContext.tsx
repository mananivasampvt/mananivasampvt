
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  roleLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const fetchUserRole = async (user: User) => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      setRoleLoading(true);
      
      // Check if we're online before making the request
      if (!navigator.onLine) {
        console.log('📱 Offline mode: Using cached user role or default');
        const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
        setUserRole(cachedRole || 'user');
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || 'user';
        setUserRole(role);
        
        // Cache the role for offline use
        localStorage.setItem(`userRole_${user.uid}`, role);
      } else {
        // If user document doesn't exist, treat as regular user
        setUserRole('user');
        localStorage.setItem(`userRole_${user.uid}`, 'user');
      }
    } catch (error: any) {
      console.error('🔥 Error fetching user role:', error);
      
      // Handle offline scenarios
      if (error.code === 'failed-precondition' || error.code === 'unavailable' || !navigator.onLine) {
        console.log('📡 Connection issue detected, using cached role');
        const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
        setUserRole(cachedRole || 'user');
      } else {
        setUserRole('user'); // Default to regular user on other errors
      }
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        await fetchUserRole(user);
      } else {
        setUserRole(null);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    login,
    logout,
    loading,
    roleLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
