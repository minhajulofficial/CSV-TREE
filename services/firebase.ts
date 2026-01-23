
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User
} from "firebase/auth";
import { 
  getFirestore, 
  increment, 
  arrayUnion, 
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  deleteDoc,
  enableMultiTabIndexedDbPersistence,
  type Firestore
} from "firebase/firestore";

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD6cgBbnYqYd2zRVUMyjyD8fvd8V7hMPKo",
  authDomain: "meta-data-webapp.firebaseapp.com",
  databaseURL: "https://meta-data-webapp-default-rtdb.firebaseio.com",
  projectId: "meta-data-webapp",
  storageBucket: "meta-data-webapp.firebasestorage.app",
  messagingSenderId: "237370136180",
  appId: "1:237370136180:web:ef952a4c17237d7403a321",
  measurementId: "G-QC4GZLC0R4"
};

// Fix Firebase initialization by ensuring app is correctly typed and initialized once
// Modular Firebase v9+ approach
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Enable offline persistence if in browser context
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in one tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support persistence.');
    }
  });
}

export const googleProvider = new GoogleAuthProvider();

// Re-exporting functions to be used across the app from a single source
export { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  increment,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  deleteDoc
};

// Exporting types for usage in context and other services
export type { Auth, User, Firestore };
export default app;
