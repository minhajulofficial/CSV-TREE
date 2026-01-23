import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  auth, 
  rtdb, 
  onAuthStateChanged, 
  ref, 
  onValue, 
  update, 
  remove
} from "./services/firebase";
import { Loader2, Shield, Users, CreditCard, LogOut, ExternalLink } from 'lucide-react';

// Updated with user's specific email
const ADMIN_EMAILS = ["minhajulofficial.bd@gmail.com"]; 

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || '')) {
        if (!loading) window.location.href = "index.html";
      } else {
        setUser(currentUser);
        initSync();
      }
      setLoading(false);
    });
    return unsub;
  }, [loading]);

  // Fix: Converted Firestore query/snapshot to RTDB onValue as Firestore exports were missing
  const initSync = () => {
    const usersRef = ref(rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...(val as any) }));
        // Manual sort as RTDB query capabilities are more limited than Firestore
        list.sort((a, b) => (b.tier === 'Premium' ? -1 : 1));
        setAllUsers(list);
      } else {
        setAllUsers([]);
      }
    });
    return unsubscribe;
  };

  // Fix: Converted updateDoc to RTDB update
  const adjustCredits = async (id: string, current: number, amount: number) => {
    try {
      await update(ref(rtdb, `users/${id}`), { 
        credits: (current || 0) + amount,
        maxCredits: Math.max((current || 0) + amount, 100)
      });
    } catch (err) {
      console.error("Failed to adjust credits:", err);
    }
  };

  // Fix: Converted updateDoc to RTDB update
  const toggleTier = async (id: string, current: string) => {
    try {
      const newTier = current === 'Premium' ? 'Free' : 'Premium';
      await update(ref(rtdb, `users/${id}`), { 
        tier: newTier,
        credits: newTier === 'Premium' ? 6000 : 100,
        maxCredits: newTier === 'Premium' ? 6000 : 100
      });
    } catch (err) {
      console.error("Failed to toggle tier:", err);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-bgMain dark:bg-black">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Secure Uplink...</p>
    </div>
  );

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-bgMain dark:bg-black text-textMain">
      <aside className="w-72 border-r border-borderMain flex flex-col p-8 bg-white dark:bg-[#0f1216]">
        <div className="flex items-center gap-1 text-2xl font-black tracking-tighter mb-16 italic group cursor-pointer" onClick={() => window.location.href = 'index.html'}>
          <span className="text-primary group-hover:text-primary/80 transition-colors">CSV</span><span className="text-accent group-hover:text-accent/80 transition-colors">MASTER</span>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="w-full p-4 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-primary/10">
            <Shield size={16} /> Dashboard
          </div>
          <a href="index.html" className="w-full p-4 rounded-xl text-textDim hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
            <ExternalLink size={16} /> Public Site
          </a>
        </nav>
        <div className="mt-auto p-4 bg-bgMain dark:bg-white/5 rounded-2xl flex items-center gap-4">
          <img src={user?.photoURL || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-borderMain" />
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase truncate">{user?.displayName || 'Admin'}</p>
            <button onClick={() => auth.signOut()} className="text-[8px] text-accent font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
              <LogOut size={10} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight italic uppercase">Control Center</h1>
            <p className="text-textDim text-[10px] font-bold uppercase tracking-widest">System Resource Management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard label="Total Operators" value={allUsers.length} icon={<Users />} color="text-primary" />
            <StatCard label="Premium Fleet" value={allUsers.filter(u => u.tier === 'Premium').length} icon={<Shield />} color="text-accent" />
            <StatCard label="Total Credits" value={allUsers.reduce((a, b) => a + (b.credits || 0), 0)} icon={<CreditCard />} color="text-textMain" />
          </div>

          <div className="bg-white dark:bg-[#12161f] rounded-[2.5rem] overflow-hidden border border-borderMain shadow-xl">
            <div className="p-8 border-b border-borderMain flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight italic">Registry Database</h2>
              <input 
                type="text" 
                placeholder="Search operators..." 
                className="bg-bgMain dark:bg-white/5 border border-borderMain rounded-xl px-6 py-3 text-xs font-bold focus:outline-none focus:border-primary/30 w-80 text-textMain"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-textDim uppercase tracking-[0.2em] border-b border-borderMain bg-slate-50 dark:bg-white/5">
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Tier</th>
                    <th className="px-8 py-6">Credits</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-borderMain/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary overflow-hidden">
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.displayName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase">{u.displayName || 'Anonymous'}</p>
                            <p className="text-[9px] text-textDim">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.tier === 'Premium' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 dark:bg-white/10 text-textDim'}`}>
                          {u.tier || 'Free'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black tabular-nums">{u.credits || 0} / {u.maxCredits || 100}</p>
                      </td>
                      <td className="px-10 py-6 text-right space-x-2">
                        <button onClick={() => adjustCredits(u.id, u.credits || 0, 100)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase hover:bg-primary hover:text-white transition-all">Refuel</button>
                        <button onClick={() => toggleTier(u.id, u.tier)} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[9px] font-black uppercase hover:bg-accent hover:text-white transition-all">Tier</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-textDim text-[10px] font-black uppercase tracking-widest">No matching records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white dark:bg-[#12161f] p-8 rounded-[2rem] border border-borderMain shadow-lg flex items-center justify-between group hover:border-primary/30 transition-all">
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${color}`}>{label}</p>
      <h3 className="text-4xl font-black tracking-tight tabular-nums">{value.toLocaleString()}</h3>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 group-hover:scale-110 transition-transform ${color}`}>{icon}</div>
  </div>
);

const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(<AdminPanel />);
}