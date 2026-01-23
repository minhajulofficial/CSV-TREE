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
  type Firestore
} from "firebase/firestore";

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

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// Explicitly set the client ID if provided externally, though usually handled by Firebase
googleProvider.setCustomParameters({
  'prompt': 'select_account'
});

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

export type { Auth, User, Firestore };
export default app;