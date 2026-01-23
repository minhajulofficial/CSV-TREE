
import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, User as UserIcon, Loader2, 
  Sun, Moon, Crown, RefreshCw, Sparkles, AlertCircle, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppView } from '../types';
import AuthModal from './AuthModal';

const ADMIN_EMAILS = ["minhajulofficial.bd@gmail.com"];

interface NavbarProps {
  onSwitchView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSwitchView }) => {
  const { user, profile, logout, loading, profileLoading, setAuthModalOpen, resetUserCredits, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-bgMain/80 backdrop-blur-2xl border-b border-borderMain flex items-center justify-between px-10 z-50 transition-colors">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-1 text-2xl font-black tracking-tighter group cursor-pointer" onClick={() => onSwitchView('Home')}>
            <span className="text-primary transition-all">CSV</span>
            <span className="text-accent">TREE</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-bgSidebar border border-borderMain text-textDim hover:text-primary transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="h-6 w-px bg-borderMain" />
          
          {loading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-bgSidebar border border-borderMain hover:border-primary/30 transition-all shadow-sm">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] font-black text-textMain uppercase tracking-wider">{user.displayName?.split(' ')[0] || 'User'}</span>
                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest">
                    {profileLoading ? '...' : (profile?.credits ?? 0)} Credits
                  </span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-borderMain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><UserIcon size={14} /></div>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-4 w-[340px] bg-surface border border-borderMain rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
                  <div className="p-8 pb-6 border-b border-borderMain bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/5 flex items-center justify-center text-primary overflow-hidden shadow-lg">
                        {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-black text-textMain truncate tracking-tight">{user.displayName || user.email}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-primary font-black uppercase tracking-widest mt-1">
                          <Crown size={10} fill="currentColor" /> {profile?.tier || 'Free'} Member
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase text-textDim tracking-widest">
                          <span>Account Balance</span>
                          <button onClick={resetUserCredits} className="text-primary hover:underline flex items-center gap-1"><RefreshCw size={10} /> Sync</button>
                       </div>
                       <div className="h-1.5 bg-bgMain rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${((profile?.credits || 0) / (profile?.maxCredits || 100)) * 100}%` }} />
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-textMain tracking-tighter">{profile?.credits ?? 0}</span>
                          <span className="text-[9px] font-bold text-textDim uppercase tracking-widest">/ {profile?.maxCredits || 100} credits</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {isAdmin && (
                      <button onClick={() => { onSwitchView('Admin'); setIsProfileOpen(false); }} className="w-full py-4 px-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <Shield size={14} /> Admin Command Center
                      </button>
                    )}
                    
                    {error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] text-red-500 font-bold uppercase tracking-widest flex items-start gap-2">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="p-4 bg-bgMain/50 border border-borderMain rounded-2xl flex items-start gap-3">
                       <Sparkles size={14} className="text-primary mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Platform Sync</p>
                          <p className="text-[9px] text-textDim font-bold leading-relaxed italic uppercase">System engines are automatically provisioned.</p>
                       </div>
                    </div>
                  </div>

                  <button onClick={logout} className="w-full py-5 border-t border-borderMain text-textDim hover:text-accent hover:bg-accent/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="px-6 py-2.5 rounded-xl bg-primary text-[#0a0c10] text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
              Sign In
            </button>
          )}
        </div>
      </nav>
      <AuthModal />
    </>
  );
};

export default Navbar;
