import React, { useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from "../services/firebase";
import { Users, Shield, CreditCard, Search, ArrowLeft, Zap, Star, Loader2 } from 'lucide-react';

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
    } catch (err) {
      console.error("Credit update failed:", err);
    }
  };

  const toggleTier = async (id: string, current: string) => {
    try {
      const newTier = current === 'Premium' ? 'Free' : 'Premium';
      await updateDoc(doc(db, 'users', id), { 
        tier: newTier,
        credits: newTier === 'Premium' ? 6000 : 100,
        maxCredits: newTier === 'Premium' ? 6000 : 100
      });
    } catch (err) {
      console.error("Tier update failed:", err);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fetching Command Logs...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgMain p-8 md:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button onClick={onBack} className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
              <ArrowLeft size={14} /> Back to Terminal
            </button>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-textMain">Command Center</h1>
            <p className="text-textDim text-[10px] font-bold uppercase tracking-[0.4em]">Infrastructure Management</p>
          </div>
          
          <div className="flex bg-surface p-2 rounded-2xl border border-borderMain shadow-sm w-full md:w-96">
            <Search className="text-textDim ml-3 mt-2.5" size={18} />
            <input 
              type="text" 
              placeholder="Filter operators..." 
              className="bg-transparent border-none focus:outline-none px-4 py-2 text-xs font-bold text-textMain w-full"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Total Operators" value={allUsers.length} icon={<Users />} color="text-primary" />
          <StatCard label="Premium Fleet" value={allUsers.filter(u => u.tier === 'Premium').length} icon={<Shield />} color="text-accent" />
          <StatCard label="Global Credit Reserve" value={allUsers.reduce((a, b) => a + (b.credits || 0), 0)} icon={<CreditCard />} color="text-textMain" />
        </div>

        <div className="bg-surface rounded-[2.5rem] border border-borderMain shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-borderMain">
                  <th className="px-10 py-6 text-[10px] font-black text-textDim uppercase tracking-widest">Operator Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-textDim uppercase tracking-widest">Access Level</th>
                  <th className="px-10 py-6 text-[10px] font-black text-textDim uppercase tracking-widest">Fuel Units</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-textDim uppercase tracking-widest">Control Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMain">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner overflow-hidden">
                          {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.displayName?.[0] || 'O'}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-textMain">{u.displayName || 'Unknown Unit'}</p>
                          <p className="text-[10px] text-textDim font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${u.tier === 'Premium' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-100 dark:bg-white/10 border-borderMain text-textDim'}`}>
                        {u.tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black tabular-nums text-textMain">{u.credits || 0}</span>
                        <span className="text-[9px] text-textDim font-black uppercase tracking-widest">/ {u.maxCredits || 100}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => adjustCredits(u.id, u.credits, 500)} className="px-4 py-2 rounded-xl bg-primary text-[#0a0c10] text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10">
                        <Zap size={12} className="inline mr-1" /> Refuel
                      </button>
                      <button onClick={() => toggleTier(u.id, u.tier)} className="px-4 py-2 rounded-xl bg-bgMain border border-borderMain text-textMain text-[9px] font-black uppercase tracking-widest hover:bg-surface active:scale-95 transition-all">
                        <Star size={12} className="inline mr-1" /> {u.tier === 'Premium' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-textDim text-[10px] font-black uppercase tracking-[0.4em]">No matching operator logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-surface p-8 rounded-[2rem] border border-borderMain shadow-xl flex items-center justify-between group hover:border-primary/30 transition-all">
    <div className="space-y-1">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>{label}</p>
      <h3 className="text-4xl font-black tracking-tighter tabular-nums text-textMain">{value.toLocaleString()}</h3>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

export default AdminView;