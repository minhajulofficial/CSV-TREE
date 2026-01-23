import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, error, clearError, isAuthModalOpen, setAuthModalOpen } = useAuth();

  // Handle closing modal on successful auth
  useEffect(() => {
    if (user && isAuthModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen, setAuthModalOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) { 
      setLoading(false); 
      clearError(); 
      setMode('login');
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isAuthModalOpen, clearError]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'signup') {
        await registerWithEmail(email, password, name);
      } else {
        await resetPassword(email);
        alert('Check your email for reset link.');
        setMode('login');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);
    try { 
      await loginWithGoogle(); 
    } catch (err: any) {
      setLoading(false);
      console.error("Auth Popup Error:", err);
    }
  };

  const isDomainError = error?.includes('unauthorized-domain') || error?.includes('auth/unauthorized-domain');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0c10]/90 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => !loading && setAuthModalOpen(false)} 
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[440px] bg-white dark:bg-[#12161f] rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <button 
          onClick={() => !loading && setAuthModalOpen(false)} 
          disabled={loading}
          className="absolute top-8 right-8 p-2 text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-10 md:p-12 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">
              <Sparkles size={12} /> Secure Gateway
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {mode === 'login' ? 'Authentication' : mode === 'signup' ? 'Create Identity' : 'Recovery'}
            </h2>
            <p className="text-slate-500 dark:text-gray-500 text-sm font-medium opacity-80">
              {mode === 'login' ? 'Access your metadata workspace' : 'Join the microstock automation network'}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-2xl flex flex-col gap-2 text-xs border ${isDomainError ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest">{isDomainError ? 'Domain Unauthorized' : 'System Error'}</p>
                  <p className="font-medium leading-relaxed">
                    {isDomainError 
                      ? "This domain isn't authorized in Firebase. Please add this URL to 'Authorized Domains' in your Firebase Authentication settings." 
                      : error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {mode !== 'reset' && (
              <button 
                onClick={handleGoogleAuth} 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} />}
                Continue with Google
              </button>
            )}

            {mode !== 'reset' && (
              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-gray-600">OR</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase px-1 tracking-widest">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required 
                      type="text" 
                      placeholder="Your name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      disabled={loading} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all disabled:opacity-50" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase px-1 tracking-widest">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    required 
                    type="email" 
                    placeholder="name@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={loading} 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all disabled:opacity-50" 
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button" 
                        disabled={loading} 
                        onClick={() => { setMode('reset'); clearError(); }} 
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      disabled={loading} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all disabled:opacity-50" 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-[#0a0c10] py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Create Account' : 'Recover Access'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearError(); }} 
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                {mode === 'login' ? "New Operator? Create Account" : "Registered Identity? Authenticate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;