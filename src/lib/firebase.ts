
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDo76dvf_6tPaBP-rqtN8sNKkWLFJhK6jE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "real-estate-ee44e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "real-estate-ee44e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "real-estate-ee44e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "940703523125",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:940703523125:web:99168cdcfeb73852edec7c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0WF56TMSXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Add debugging for connection status
console.log('Firebase initialized successfully');
console.log('Auth instance:', auth);
console.log('Firestore instance:', db);
console.log('Project ID:', firebaseConfig.projectId);

export default app;
