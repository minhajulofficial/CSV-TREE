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

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser as User | null);
      setLoading(false);

      if (currentUser) {
        setAuthModalOpen(false);
        setProfileLoading(true);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        if (unsubscribeProfile) unsubscribeProfile();
        
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
            setProfileLoading(false);
          } else {
            // New user setup for Google or Email login
            const initialSetup = {
              credits: 100,
              maxCredits: 100,
              tier: 'Free',
              lastResetDate: new Date().toISOString()
            };
            setDoc(userDocRef, initialSetup, { merge: true })
              .then(() => setProfileLoading(false))
              .catch(err => {
                console.warn("Profile Initialization Error:", err.message);
                setProfileLoading(false);
              });
          }
        }, (err) => {
          console.error("Profile sync error:", err);
          setProfileLoading(false);
        });
      } else {
        setProfile(null);
        setProfileLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
      }
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
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { 
        credits: amount,
        maxCredits: amount,
        lastResetDate: new Date().toISOString() 
      });
    } catch (err) { setError("Sync failed."); }
  };

  const clearError = () => setError(null);

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
    try { 
      await signInWithEmailAndPassword(auth, email, pass); 
    } 
    catch (err: any) { 
      setError(err.message); 
      throw err; 
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await fbUpdateProfile(res.user, { displayName: name });
    } catch (err: any) { 
      setError(err.message); 
      throw err; 
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try { await sendPasswordResetEmail(auth, email); } 
    catch (err: any) { 
      setError(err.message); 
      throw err; 
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (err: any) { console.error("Logout error", err); }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, profileLoading, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout, 
      deductCredit, resetUserCredits, error, clearError, isAuthModalOpen, setAuthModalOpen
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