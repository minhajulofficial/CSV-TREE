
import { initializeApp, getApps, getApp } from "firebase/app";
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
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue,
  push,
  child,
  serverTimestamp,
  increment,
  type Database
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD6cgBbnYqYd2zRVUMyjyD8fvd8V7hMPKo",
  authDomain: "meta-data-webapp.firebaseapp.com",
  databaseURL: "https://meta-data-webapp-default-rtdb.firebaseio.com",
  projectId: "meta-data-webapp",
  storageBucket: "meta-data-webapp.appspot.com",
  messagingSenderId: "237370136180",
  appId: "1:237370136180:web:ef952a4c17237d7403a321",
  measurementId: "G-QC4GZLC0R4"
};

// Initialize App once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const rtdb: Database = getDatabase(app);

export const googleProvider = new GoogleAuthProvider();
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
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
  child,
  serverTimestamp,
  increment
};

export type { Auth, User, Database };
export default app;
