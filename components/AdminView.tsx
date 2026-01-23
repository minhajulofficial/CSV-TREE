import React, { useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  deleteDoc
} from "../services/firebase";
import { 
  Users, Shield, CreditCard, Search, ArrowLeft, 
  Zap, Star, Loader2, Trash2, Mail, ExternalLink,
  ShieldCheck, AlertCircle, TrendingUp
} from 'lucide-react';

interface AdminViewProps {
  onBack: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('tier', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Admin view sync error:", err);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const adjustCredits = async (id: string, current: number, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', id), { 
        credits: (current || 0) + amount,
        maxCredits: Math.max((current || 0) + amount, 100)
      });
    } catch (err) { alert("Action failed: Insufficient permissions."); }
  };

  const toggleTier = async (id: string, current: string) => {
    try {
      const newTier = current === 'Premium' ? 'Free' : 'Premium';
      await updateDoc(doc(db, 'users', id), { 
        tier: newTier,
        credits: newTier === 'Premium' ? 6000 : 100,
        maxCredits: newTier === 'Premium' ? 6000 : 100
      });
    } catch (err) { alert("Failed to modify clearance level."); }
  };

  const deleteUserRecord = async (id: string) => {
    if (confirm("Permanently delete this operator record? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (err) { alert("Deletion failed."); }
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center gap-6 animate-in fade-in">
      <div className="relative">
        <Loader2 className="animate-spin text-primary" size={64} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="text-primary/40" size={24} />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary">Secure Uplink Established</p>
        <p className="text-[10px] text-textDim font-bold uppercase tracking-widest">Decrypting Infrastructure Database...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgMain p-6 md:p-12 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <button onClick={onBack} className="group flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <ArrowLeft size={14} /> System Exit
            </button>
            <div className="space-y-1">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase text-textMain leading-none">Command Center</h1>
              <div className="flex items-center gap-3">
                <p className="text-textDim text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Global Node Control</p>
                <div className="h-px w-12 bg-borderMain" />
                <span className="flex items-center gap-1.5 text-green-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
                  <ShieldCheck size={12} /> Live Sync Active
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-black text-textDim uppercase tracking-widest ml-4">Search Identity</span>
            <div className="flex bg-surface p-2.5 rounded-2xl border border-borderMain shadow-xl w-full md:w-[450px] group focus-within:border-primary/40 transition-all">
              <Search className="text-textDim ml-3 mt-2 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Operator name, email address or ID..." 
                className="bg-transparent border-none focus:outline-none px-4 py-2 text-xs font-bold text-textMain w-full"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Operators" value={allUsers.length} icon={<Users />} color="text-primary" trend="+4% this week" />
          <StatCard label="Premium Clearance" value={allUsers.filter(u => u.tier === 'Premium').length} icon={<Shield />} color="text-accent" trend="High clearance" />
          <StatCard label="Total Energy Flow" value={allUsers.reduce((a, b) => a + (b.credits || 0), 0)} icon={<CreditCard />} color="text-textMain" trend="Credits deployed" />
          <StatCard label="Uptime Status" value="99.9%" icon={<TrendingUp />} color="text-green-500" trend="Active Nodes" />
        </div>

        <div className="bg-surface rounded-[2.5rem] border border-borderMain shadow-2xl overflow-hidden backdrop-blur-3xl">
          <div className="p-8 border-b border-borderMain flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-textDim flex items-center gap-3">
              <Zap size={16} className="text-primary" /> Personnel Registry
            </h3>
            <div className="text-[9px] font-black text-textDim uppercase tracking-widest px-4 py-2 bg-bgMain rounded-lg border border-borderMain">
              Displaying {filteredUsers.length} active records
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5 text-[9px] font-black text-textDim uppercase tracking-widest border-b border-borderMain">
                  <th className="px-10 py-6">Operator Details</th>
                  <th className="px-10 py-6">Clearance Level</th>
                  <th className="px-10 py-6">Energy Balance</th>
                  <th className="px-10 py-6 text-right">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain/40">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-primary/5 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-black text-primary text-2xl shadow-inner overflow-hidden border border-primary/10">
                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.displayName?.[0] || 'O'}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${u.tier === 'Premium' ? 'bg-primary' : 'bg-slate-300'}`} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight text-textMain">{u.displayName || 'Unknown Operator'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-textDim font-bold">
                            <Mail size={12} className="opacity-40" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${u.tier === 'Premium' ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_-5px_rgba(37,99,235,0.4)]' : 'bg-slate-100 dark:bg-white/10 border-borderMain text-textDim'}`}>
                        {u.tier === 'Premium' ? 'Diamond Clear' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black tabular-nums text-textMain leading-none">{u.credits?.toLocaleString() || 0}</span>
                          <span className="text-[9px] text-textDim font-black uppercase tracking-widest opacity-40">/ {u.maxCredits?.toLocaleString() || 100} units</span>
                        </div>
                        <div className="w-32 h-1 bg-bgMain rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${u.tier === 'Premium' ? 'bg-primary' : 'bg-textDim/30'}`} style={{ width: `${Math.min(((u.credits || 0) / (u.maxCredits || 100)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button onClick={() => adjustCredits(u.id, u.credits, 500)} title="Refuel Credits" className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-[#0a0c10] transition-all">
                          <Zap size={16} />
                        </button>
                        <button onClick={() => toggleTier(u.id, u.tier)} title="Toggle Tier" className="p-3 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all">
                          <Star size={16} />
                        </button>
                        <div className="w-px h-6 bg-borderMain mx-1" />
                        <button onClick={() => deleteUserRecord(u.id)} title="Purge Record" className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <AlertCircle size={48} />
                        <p className="text-[12px] font-black uppercase tracking-[0.5em]">No Personnel Records Match Current Query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="text-center pb-12">
          <p className="text-[10px] font-black text-textDim uppercase tracking-[0.4em] opacity-40 italic">System Integrity Verified — End of Transmission</p>
        </footer>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, trend }: any) => (
  <div className="bg-surface p-8 rounded-[2rem] border border-borderMain shadow-xl flex items-center justify-between group hover:border-primary/30 transition-all relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    <div className="space-y-3 relative z-10">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ${color}`}>{label}</p>
      <div className="space-y-1">
        <h3 className="text-4xl font-black tracking-tighter tabular-nums text-textMain leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p className="text-[9px] font-bold text-textDim/60 uppercase tracking-widest flex items-center gap-1.5">
           <ExternalLink size={10} className="opacity-40" /> {trend}
        </p>
      </div>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner border border-borderMain/10`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

export default AdminView;