
import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, User as UserIcon, Loader2, 
  Sun, Moon, Crown, RefreshCw, Sparkles, Shield,
  Settings, Code, ExternalLink, Github, Globe, Menu, X, PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppView, SystemConfig } from '../types';
import AuthModal from './AuthModal';
import { rtdb, ref, onValue } from '../services/firebase';

const ADMIN_EMAILS = ["minhajulofficial.bd@gmail.com"];

interface NavbarProps {
  onSwitchView: (view: AppView) => void;
  onManageKeys: () => void;
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSwitchView, onManageKeys, toggleSidebar }) => {
  const { user, profile, logout, loading, profileLoading, setAuthModalOpen, resetUserCredits } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const devRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const configRef = ref(rtdb, 'system/config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) setConfig(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (devRef.current && !devRef.current.contains(event.target as Node)) setIsDevOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');
  const isPremium = profile?.tier === 'Premium';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-bgMain/80 backdrop-blur-2xl border-b border-borderMain flex items-center justify-between px-4 md:px-10 z-[60] transition-colors">
        <div className="flex items-center gap-4 md:gap-10">
          <button onClick={toggleSidebar} className="md:hidden p-2 text-textDim hover:text-primary transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1 text-xl md:text-2xl font-black tracking-tighter group cursor-pointer" onClick={() => onSwitchView('Home')}>
            <span className="text-primary transition-all">CSV</span>
            <span className="text-accent">TREE</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Developer Profile Icon */}
          <div className="relative" ref={devRef}>
            <button 
              onClick={() => setIsDevOpen(!isDevOpen)}
              className={`p-2.5 rounded-xl transition-all ${isDevOpen ? 'bg-primary/10 text-primary' : 'text-textDim hover:text-primary hover:bg-primary/5'}`}
              title="Developer Profile"
            >
              <Code size={20} />
            </button>
            
            {isDevOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-white dark:bg-surface border border-borderMain rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 z-[100]">
                {config ? (
                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 p-1 border border-primary/20 overflow-hidden shadow-lg">
                      <img src={config.developer?.avatar || "https://via.placeholder.com/150"} alt="Dev" className="w-full h-full object-cover rounded-[1.75rem]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-textMain uppercase tracking-widest">{config.developer?.name || "The Architect"}</h4>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{config.developer?.role || "Engineering Lead"}</p>
                    </div>
                    <p className="text-[11px] text-textDim font-bold leading-relaxed italic opacity-80">
                      {config.developer?.bio || "Architecting digital solutions for the next generation of contributors."}
                    </p>
                    <div className="flex gap-4 pt-2">
                      {config.developer?.github && (
                        <a href={config.developer.github} target="_blank" className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-textDim hover:text-primary hover:bg-primary/10 transition-all"><Github size={18} /></a>
                      )}
                      {config.developer?.portfolio && (
                        <a href={config.developer.portfolio} target="_blank" className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-textDim hover:text-primary hover:bg-primary/10 transition-all"><Globe size={18} /></a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 size={32} className="animate-spin text-primary opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-textDim animate-pulse">Syncing Dev Intel...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => onSwitchView('Tutorials')}
            className="p-2.5 rounded-xl text-textDim hover:text-primary hover:bg-primary/5 transition-all" 
            title="Mastery Guide"
          >
            <PlayCircle size={20} />
          </button>

          <button onClick={onManageKeys} className="hidden md:flex p-2.5 rounded-xl text-textDim hover:text-primary hover:bg-primary/5 transition-all" title="Manage API Keys">
            <Settings size={20} />
          </button>

          <button onClick={toggleTheme} className="hidden md:flex p-2.5 rounded-xl bg-bgSidebar border border-borderMain text-textDim hover:text-primary transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="hidden md:block h-6 w-px bg-borderMain mx-1" />
          
          {loading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border transition-all shadow-sm ${isPremium ? 'border-primary/50 bg-primary/5 shadow-primary/10' : 'bg-bgSidebar border-borderMain hover:border-primary/30'}`}
              >
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[10px] font-black text-textMain uppercase tracking-wider truncate max-w-[80px]">{user.displayName?.split(' ')[0] || 'Member'}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${isPremium ? 'text-primary' : 'text-textDim'}`}>
                    {profileLoading ? '...' : (profile?.credits ?? 0)} Credits
                  </span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className={`w-8 h-8 rounded-full border ${isPremium ? 'border-primary' : 'border-borderMain'}`} />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary border ${isPremium ? 'bg-primary/20 border-primary' : 'bg-primary/10 border-primary/20'}`}><UserIcon size={14} /></div>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-4 w-[300px] md:w-[340px] bg-surface border border-borderMain rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
                  <div className={`p-8 pb-6 border-b border-borderMain ${isPremium ? 'bg-gradient-to-b from-primary/10 to-transparent' : 'bg-gradient-to-b from-slate-500/5 to-transparent'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-primary overflow-hidden shadow-lg ${isPremium ? 'border-primary/20 bg-primary/5' : 'border-slate-500/5 bg-slate-500/5'}`}>
                        {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-black text-textMain truncate tracking-tight">{user.displayName || user.email}</h4>
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mt-1 ${isPremium ? 'text-primary' : 'text-textDim'}`}>
                          {isPremium ? <Sparkles size={10} fill="currentColor" /> : <Crown size={10} />} {profile?.tier || 'Free'} Member
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase text-textDim tracking-widest">
                          <span>Account Balance</span>
                          <button onClick={resetUserCredits} className="text-primary hover:underline flex items-center gap-1"><RefreshCw size={10} /> Sync</button>
                       </div>
                       <div className="h-1.5 bg-bgMain rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${isPremium ? 'bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-400'}`} style={{ width: `${((profile?.credits || 0) / (profile?.maxCredits || 100)) * 100}%` }} />
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-textMain tracking-tighter">{profile?.credits ?? 0}</span>
                          <span className="text-[9px] font-bold text-textDim uppercase tracking-widest">/ {profile?.maxCredits || 100} units</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {isAdmin && (
                      <button onClick={() => { onSwitchView('Admin'); setIsProfileOpen(false); }} className="w-full py-4 px-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <Shield size={14} /> Admin Hub
                      </button>
                    )}
                    <button onClick={toggleTheme} className="md:hidden w-full py-4 px-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-borderMain text-textDim hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                       {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Switch Theme
                    </button>
                    
                    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isPremium ? 'bg-primary/5 border-primary/10' : 'bg-bgMain/50 border-borderMain'}`}>
                       <Sparkles size={14} className="text-primary mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Platform Status</p>
                          <p className="text-[9px] text-textDim font-bold leading-relaxed italic uppercase">Nodes provisioned & secure.</p>
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
            <button onClick={() => setAuthModalOpen(true)} className="px-5 md:px-6 py-2 md:py-2.5 rounded-xl bg-primary text-[#0a0c10] text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
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
