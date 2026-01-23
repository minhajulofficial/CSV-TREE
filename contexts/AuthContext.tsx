
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  rtdb,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  ref,
  set,
  get,
  update,
  onValue,
  increment,
  // Fix: Import missing auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User 
} from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  // Fix: Added missing methods to the context type
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
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
      
      if (currentUser) {
        setProfileLoading(true);
        const userRef = ref(rtdb, `users/${currentUser.uid}`);
        
        try {
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            // First time login - Create full profile with 100 credits
            const initialData: UserProfile = {
              credits: 100,
              maxCredits: 100,
              tier: 'Free',
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Contributor',
              lastResetDate: new Date().toISOString()
            };
            await set(userRef, initialData);
          } else {
            // Update existing profile metadata
            await update(userRef, {
              email: currentUser.email || snapshot.val().email || '',
              displayName: currentUser.displayName || snapshot.val().displayName || 'Contributor'
            });
          }

          if (unsubscribeProfile) unsubscribeProfile();
          
          unsubscribeProfile = onValue(userRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.val() as UserProfile);
            }
            setProfileLoading(false);
          }, (err) => {
            console.error("Profile Listener Error:", err);
            setError("Session interrupted. Please refresh.");
            setProfileLoading(false);
          });
        } catch (err: any) {
          console.error("Database Initial Sync Error:", err);
          setError("Failed to connect to the cloud database.");
          setProfileLoading(false);
        }
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

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Auth Failure:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || "Failed to sign in with Google.");
      }
      throw err;
    }
  };

  // Fix: Implement missing auth methods
  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error", err);
    }
  };

  const deductCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user || !profile) return false;
    // Check if user has enough credits
    if (profile.credits < amount) return false;
    
    try {
      const userRef = ref(rtdb, `users/${user.uid}`);
      await update(userRef, { credits: increment(-amount) });
      return true;
    } catch (err) {
      console.error("Credit Deduction Error:", err);
      return false;
    }
  };

  const resetUserCredits = async () => {
    if (!user || !profile) return;
    try {
      const amount = profile.tier === 'Premium' ? 6000 : 100;
      await update(ref(rtdb, `users/${user.uid}`), { 
        credits: amount,
        maxCredits: amount,
        lastResetDate: new Date().toISOString() 
      });
    } catch (err) { 
      setError("Manual credit sync failed."); 
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, profileLoading, loginWithGoogle, logout, 
      deductCredit, resetUserCredits, error, clearError: () => setError(null), isAuthModalOpen, setAuthModalOpen,
      // Fix: Expose new methods in context provider
      loginWithEmail, registerWithEmail, resetPassword
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
