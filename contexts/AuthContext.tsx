import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  increment,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  type User 
} from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  deductCredit: (amount?: number) => Promise<boolean>;
  resetUserCredits: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Sync Auth State and Firestore Profile
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser as User | null);
      
      if (currentUser) {
        setProfileLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Ensure user exists in Firestore
        const snapshot = await getDoc(userDocRef);
        if (!snapshot.exists()) {
          const initialData: UserProfile = {
            credits: 100,
            maxCredits: 100,
            tier: 'Free',
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Unknown Operator',
            lastResetDate: new Date().toISOString()
          };
          await setDoc(userDocRef, initialData);
        } else {
          // Update basic info if needed
          await updateDoc(userDocRef, {
            email: currentUser.email || snapshot.data().email,
            displayName: currentUser.displayName || snapshot.data().displayName
          });
        }

        if (unsubscribeProfile) unsubscribeProfile();
        
        unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
          setProfileLoading(false);
        });
      } else {
        setProfile(null);
        setProfileLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const deductCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.credits < amount) return false;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { credits: increment(-amount) });
      return true;
    } catch (err) { return false; }
  };

  const resetUserCredits = async () => {
    if (!user || !profile) return;
    try {
      const amount = profile.tier === 'Premium' ? 6000 : 100;
      await updateDoc(doc(db, 'users', user.uid), { 
        credits: amount,
        maxCredits: amount,
        lastResetDate: new Date().toISOString() 
      });
    } catch (err) { setError("Manual sync failed."); }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try { 
      await signInWithPopup(auth, googleProvider); 
    } 
    catch (err: any) { 
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
        throw err;
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try { await signInWithEmailAndPassword(auth, email, pass); } 
    catch (err: any) { setError(err.message); throw err; }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await fbUpdateProfile(res.user, { displayName: name });
      // Firestore initialization is handled by useEffect
    } catch (err: any) { setError(err.message); throw err; }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try { await sendPasswordResetEmail(auth, email); } 
    catch (err: any) { setError(err.message); throw err; }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (err: any) { console.error("Logout error", err); }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, profileLoading, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout, 
      deductCredit, resetUserCredits, error, clearError: () => setError(null), isAuthModalOpen, setAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};