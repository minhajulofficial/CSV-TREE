
import React, { useEffect, useState } from 'react';
import { 
  rtdb,
  ref,
  onValue,
  update,
  remove,
  set
} from "../services/firebase";
import { 
  Users, Shield, CreditCard, Search, ArrowLeft, 
  Zap, Loader2, Trash2, TrendingUp, Code, Image, ToggleLeft, ToggleRight, Save
} from 'lucide-react';
import { SystemConfig } from '../types';

interface AdminViewProps {
  onBack: () => void;
}

const DEFAULT_CONFIG: SystemConfig = {
  developer: {
    name: "Minhajul BD",
    role: "Lead Engineer",
    bio: "Passionate about AI and Microstock automation.",
    avatar: "https://via.placeholder.com/150",
    github: "https://github.com",
    portfolio: "https://example.com"
  },
  ads: {
    enabled: false,
    visibility: 'Free',
    image: "https://via.placeholder.com/800x400",
    link: "https://example.com",
    label: "SPONSORED"
  }
};

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Users' | 'System'>('Users');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Sync Users
    const usersRef = ref(rtdb, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const userList = Object.entries(data).map(([id, val]) => ({ 
            id, 
            ...(val as any) 
          }));
          userList.sort((a, b) => (b.tier === 'Premium' ? -1 : 1));
          setAllUsers(userList);
        } else {
          setAllUsers([]);
        }
      } catch (err) {
        console.error("Error parsing users:", err);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Read Error:", error);
      setLoading(false);
    });

    // 2. Sync System Config
    const configRef = ref(rtdb, 'system/config');
    const unsubConfig = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Merge with defaults to ensure no missing properties
        setConfig({
          developer: { ...DEFAULT_CONFIG.developer, ...(data.developer || {}) },
          ads: { ...DEFAULT_CONFIG.ads, ...(data.ads || {}) }
        });
      }
    });

    return () => { unsubUsers(); unsubConfig(); };
  }, []);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await set(ref(rtdb, 'system/config'), config);
      alert("Configuration Synchronized Successfully.");
    } catch (err) { 
      alert("Failed to update config. Check your database rules."); 
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const searchLower = search.toLowerCase();
    return (
      (u.email?.toLowerCase() || "").includes(searchLower) || 
      (u.displayName?.toLowerCase() || "").includes(searchLower)
    );
  });

  if (loading) return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-primary" size={64} />
      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Establishing Secure Link...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgMain p-4 md:p-12 animate-in fade-in duration-500 overflow-x-hidden pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <button onClick={onBack} className="group flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <ArrowLeft size={14} /> System Exit
            </button>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-textMain leading-none">Command Center</h1>
          </div>
          
          <div className="flex bg-surface p-1.5 rounded-2xl border border-borderMain shadow-sm overflow-hidden">
             <button onClick={() => setActiveTab('Users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textDim hover:text-textMain'}`}>User Management</button>
             <button onClick={() => setActiveTab('System')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'System' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textDim hover:text-textMain'}`}>System Config</button>
          </div>
        </header>

        {activeTab === 'Users' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard label="Operators" value={allUsers.length} icon={<Users />} color="text-primary" />
              <StatCard label="Premium" value={allUsers.filter(u => u.tier === 'Premium').length} icon={<Shield />} color="text-accent" />
              <StatCard label="Energy" value={allUsers.reduce((a, b) => a + (Number(b.credits) || 0), 0)} icon={<CreditCard />} color="text-textMain" />
              <StatCard label="Health" value="Online" icon={<TrendingUp />} color="text-green-500" />
            </div>

            <div className="bg-surface rounded-[2.5rem] border border-borderMain shadow-2xl overflow-hidden backdrop-blur-3xl">
              <div className="p-8 border-b border-borderMain flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-textDim flex items-center gap-3"><Zap size={16} className="text-primary" /> Personnel Registry</h3>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textDim" size={16} />
                  <input type="text" placeholder="Filter identities..." className="w-full bg-bgMain rounded-xl pl-12 pr-6 py-2.5 text-xs font-bold border border-borderMain outline-none focus:border-primary/40 text-textMain" onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 text-[9px] font-black text-textDim uppercase tracking-widest border-b border-borderMain">
                      <th className="px-10 py-6">Operator</th>
                      <th className="px-10 py-6">Clearance</th>
                      <th className="px-10 py-6">Energy</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderMain/40 text-textMain">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-primary/5 transition-all group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                             <img src={u.photoURL || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-xl object-cover border border-borderMain" />
                             <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase truncate max-w-[200px]">{u.displayName || 'Unknown'}</p>
                                <p className="text-[9px] text-textDim truncate max-w-[200px]">{u.email}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <button onClick={() => toggleTier(u.id, u.tier)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${u.tier === 'Premium' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-100 border-borderMain text-textDim'}`}>
                              {u.tier || 'Free'}
                           </button>
                        </td>
                        <td className="px-10 py-6 text-xs font-black tabular-nums">{u.credits || 0} units</td>
                        <td className="px-10 py-6 text-right space-x-2">
                           <button onClick={() => adjustCredits(u.id, u.credits, 500)} className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"><Zap size={14} /></button>
                           <button onClick={() => deleteUserRecord(u.id)} className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            {/* Developer Config */}
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-borderMain">
                <Code className="text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest">Developer Identity</h3>
              </div>
              <div className="space-y-4">
                <AdminInput label="Name" value={config.developer.name} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, name: v}}))} />
                <AdminInput label="Role" value={config.developer.role} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, role: v}}))} />
                <AdminInput label="Bio" value={config.developer.bio} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, bio: v}}))} />
                <AdminInput label="Avatar URL" value={config.developer.avatar} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, avatar: v}}))} />
                <AdminInput label="GitHub" value={config.developer.github || ''} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, github: v}}))} />
                <AdminInput label="Portfolio" value={config.developer.portfolio || ''} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, portfolio: v}}))} />
              </div>
            </div>

            {/* Ad Management */}
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-borderMain">
                <div className="flex items-center gap-3">
                  <Image className="text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Ad Ecosystem</h3>
                </div>
                <button 
                  onClick={() => setConfig(prev => ({...prev, ads: {...prev.ads, enabled: !prev.ads.enabled}}))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${config.ads.enabled ? 'bg-primary text-white' : 'bg-slate-100 text-textDim'}`}
                >
                  {config.ads.enabled ? <ToggleRight /> : <ToggleLeft />}
                  Status: {config.ads.enabled ? 'Live' : 'Off'}
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-textDim px-1">Visibility Rules</label>
                   <select 
                      className="w-full bg-bgMain rounded-xl px-4 py-3 text-xs font-bold border border-borderMain outline-none text-textMain"
                      value={config.ads.visibility}
                      onChange={(e) => setConfig(prev => ({...prev, ads: {...prev.ads, visibility: e.target.value as any}}))}
                   >
                      <option value="Free">Free Users Only</option>
                      <option value="All">Global (Everyone)</option>
                   </select>
                </div>
                <AdminInput label="Ad Label" value={config.ads.label} onChange={(v) => setConfig(prev => ({...prev, ads: {...prev.ads, label: v}}))} />
                <AdminInput label="Image URL" value={config.ads.image} onChange={(v) => setConfig(prev => ({...prev, ads: {...prev.ads, image: v}}))} />
                <AdminInput label="Redirect Link" value={config.ads.link} onChange={(v) => setConfig(prev => ({...prev, ads: {...prev.ads, link: v}}))} />
              </div>
            </div>

            <button 
              onClick={saveConfig} 
              disabled={isSaving}
              className="md:col-span-2 w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              Synchronize Configuration Clusters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-textDim px-1 tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full bg-bgMain rounded-xl px-4 py-3 text-xs font-bold border border-borderMain outline-none focus:border-primary/40 transition-all text-textMain placeholder:opacity-30" 
      placeholder={`Set ${label.toLowerCase()}...`}
    />
  </div>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-surface p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-borderMain shadow-sm flex items-center justify-between group">
    <div>
      <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 md:mb-3 ${color}`}>{label}</p>
      <h3 className="text-xl md:text-3xl font-black tracking-tight text-textMain">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
    </div>
    <div className={`p-3 md:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
  </div>
);

const toggleTier = async (id: string, current: string) => {
  try {
    const newTier = current === 'Premium' ? 'Free' : 'Premium';
    await update(ref(rtdb, `users/${id}`), { 
      tier: newTier,
      credits: newTier === 'Premium' ? 6000 : 100,
      maxCredits: newTier === 'Premium' ? 6000 : 100
    });
  } catch (err) { alert("Clearance modification failed."); }
};

const adjustCredits = async (id: string, current: number, amount: number) => {
  try {
    await update(ref(rtdb, `users/${id}`), { 
      credits: (Number(current) || 0) + amount,
      maxCredits: Math.max((Number(current) || 0) + amount, 100)
    });
  } catch (err) { alert("Energy refuel failed."); }
};

const deleteUserRecord = async (id: string) => {
  if (confirm("Purge personnel record permanently?")) {
    await remove(ref(rtdb, `users/${id}`));
    await remove(ref(rtdb, `metadata/${id}`));
  }
};

export default AdminView;
