
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
  Zap, Loader2, Trash2, TrendingUp, Code, Image, ToggleLeft, ToggleRight, Save, Layout, Plus, List, Globe, MessageCircle
} from 'lucide-react';
import { SystemConfig, AdEntry } from '../types';

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
    list: [
      { image: "https://via.placeholder.com/800x400", link: "https://example.com", label: "SPONSORED" }
    ],
    externalScript: ""
  },
  site: {
    footerCredit: "MINHAJUL ISLAM",
    socials: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com"
    },
    status: "Healthy",
    version: "2.5.0-Stable"
  }
};

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Users' | 'System' | 'Site'>('Users');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const usersRef = ref(rtdb, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const userList = Object.entries(data).map(([id, val]) => ({ id, ...(val as any) }));
          userList.sort((a, b) => (b.tier === 'Premium' ? -1 : 1));
          setAllUsers(userList);
        } else { setAllUsers([]); }
      } catch (err) { console.error("Users error:", err); }
      setLoading(false);
    });

    const configRef = ref(rtdb, 'system/config');
    const unsubConfig = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          developer: { ...DEFAULT_CONFIG.developer, ...(data.developer || {}) },
          ads: { ...DEFAULT_CONFIG.ads, ...(data.ads || {}) },
          site: { ...DEFAULT_CONFIG.site, ...(data.site || {}) }
        });
      }
    });
    return () => { unsubUsers(); unsubConfig(); };
  }, []);

  const saveConfig = async () => {
    setIsSaving(true);
    try { await set(ref(rtdb, 'system/config'), config); alert("Core Synchronized."); } 
    catch (err) { alert("Sync Error."); }
    finally { setIsSaving(false); }
  };

  const addAdUnit = () => {
    setConfig(prev => ({ ...prev, ads: { ...prev.ads, list: [...prev.ads.list, { image: '', link: '', label: 'SPONSORED' }] } }));
  };

  const removeAdUnit = (index: number) => {
    setConfig(prev => ({ ...prev, ads: { ...prev.ads, list: prev.ads.list.filter((_, i) => i !== index) } }));
  };

  const updateAdUnit = (index: number, field: keyof AdEntry, value: string) => {
    const newList = [...config.ads.list];
    newList[index] = { ...newList[index], [field]: value };
    setConfig(prev => ({ ...prev, ads: { ...prev.ads, list: newList } }));
  };

  const filteredUsers = allUsers.filter(u => {
    const s = search.toLowerCase();
    return (u.email?.toLowerCase() || "").includes(s) || (u.displayName?.toLowerCase() || "").includes(s);
  });

  if (loading) return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-primary" size={64} />
      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary">Establishing Link...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgMain p-4 md:p-12 animate-in fade-in pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-2 text-primary text-[10px] font-black uppercase bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <ArrowLeft size={14} /> Exit Admin
            </button>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase text-textMain leading-none">Command Hub</h1>
          </div>
          <div className="flex bg-surface p-1.5 rounded-2xl border border-borderMain shadow-sm overflow-hidden">
             <button onClick={() => setActiveTab('Users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Users' ? 'bg-primary text-white shadow-lg' : 'text-textDim'}`}>Users</button>
             <button onClick={() => setActiveTab('System')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'System' ? 'bg-primary text-white shadow-lg' : 'text-textDim'}`}>System</button>
             <button onClick={() => setActiveTab('Site')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Site' ? 'bg-primary text-white shadow-lg' : 'text-textDim'}`}>Site</button>
          </div>
        </header>

        {activeTab === 'Users' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard label="Operators" value={allUsers.length} icon={<Users />} color="text-primary" />
              <StatCard label="Premium" value={allUsers.filter(u => u.tier === 'Premium').length} icon={<Shield />} color="text-accent" />
              <StatCard label="Global Credits" value={allUsers.reduce((a, b) => a + (Number(b.credits) || 0), 0)} icon={<CreditCard />} color="text-textMain" />
              <StatCard label="System Status" value={config.site.status} icon={<TrendingUp />} color="text-green-500" />
            </div>
            <div className="bg-surface rounded-[2.5rem] border border-borderMain shadow-2xl overflow-hidden backdrop-blur-3xl">
              <div className="p-8 border-b border-borderMain flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-[12px] font-black uppercase text-textDim flex items-center gap-3">Operator Registry</h3>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textDim" size={16} />
                  <input type="text" placeholder="Filter identities..." className="w-full bg-bgMain rounded-xl pl-12 pr-6 py-2.5 text-xs font-bold border border-borderMain outline-none text-textMain" onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 text-[9px] font-black text-textDim uppercase tracking-widest border-b border-borderMain">
                      <th className="px-10 py-6">Operator</th>
                      <th className="px-10 py-6">Tier</th>
                      <th className="px-10 py-6">Credits</th>
                      <th className="px-10 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-primary/5 transition-all border-b border-borderMain/40">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                             <img src={u.photoURL || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-xl object-cover" />
                             <div className="space-y-0.5"><p className="text-[11px] font-black uppercase">{u.displayName || 'Unknown'}</p><p className="text-[9px] text-textDim">{u.email}</p></div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <button onClick={() => toggleTier(u.id, u.tier)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${u.tier === 'Premium' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-100 border-borderMain text-textDim'}`}>{u.tier || 'Free'}</button>
                        </td>
                        <td className="px-10 py-6 text-xs font-black">{u.credits || 0} U</td>
                        <td className="px-10 py-6 text-right space-x-2">
                           <button onClick={() => adjustCredits(u.id, u.credits, 500)} className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white"><Zap size={14}/></button>
                           <button onClick={() => deleteUserRecord(u.id)} className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'System' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-borderMain"><Code className="text-primary"/><h3 className="text-sm font-black uppercase">Developer Identity</h3></div>
              <div className="space-y-4">
                <AdminInput label="Name" value={config.developer.name} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, name: v}}))} />
                <AdminInput label="Role" value={config.developer.role} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, role: v}}))} />
                <AdminInput label="Bio" value={config.developer.bio} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, bio: v}}))} />
                <AdminInput label="Avatar URL" value={config.developer.avatar} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, avatar: v}}))} />
                <AdminInput label="GitHub" value={config.developer.github || ''} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, github: v}}))} />
                <AdminInput label="Portfolio" value={config.developer.portfolio || ''} onChange={(v) => setConfig(prev => ({...prev, developer: {...prev.developer, portfolio: v}}))} />
              </div>
            </div>
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-borderMain">
                <div className="flex items-center gap-3"><Image className="text-primary"/><h3 className="text-sm font-black uppercase">Ad Infrastructure</h3></div>
                <button onClick={() => setConfig(prev => ({...prev, ads: {...prev.ads, enabled: !prev.ads.enabled}}))} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase ${config.ads.enabled ? 'bg-primary text-white' : 'bg-slate-100 text-textDim'}`}>{config.ads.enabled ? <ToggleRight/> : <ToggleLeft/>} Enabled</button>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-textDim tracking-widest flex items-center gap-2"><List size={12}/> Slider Units</span>
                    <button onClick={addAdUnit} className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase hover:underline"><Plus size={12}/> Add Unit</button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {config.ads.list.map((ad, idx) => (
                      <div key={idx} className="p-4 bg-bgMain rounded-2xl border border-borderMain space-y-3 relative group/ad">
                        <button onClick={() => removeAdUnit(idx)} className="absolute top-2 right-2 text-red-500/30 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                        <div className="grid grid-cols-2 gap-2">
                           <input placeholder="Label" className="text-[10px] bg-white border border-borderMain rounded-lg px-3 py-2" value={ad.label} onChange={(e) => updateAdUnit(idx, 'label', e.target.value)} />
                           <input placeholder="Redirect URL" className="text-[10px] bg-white border border-borderMain rounded-lg px-3 py-2" value={ad.link} onChange={(e) => updateAdUnit(idx, 'link', e.target.value)} />
                        </div>
                        <input placeholder="Image URL" className="w-full text-[10px] bg-white border border-borderMain rounded-lg px-3 py-2" value={ad.image} onChange={(e) => updateAdUnit(idx, 'image', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5 pt-4">
                  <label className="text-[10px] font-black uppercase text-textDim flex items-center gap-2"><Layout size={12}/> Network Injection</label>
                  <textarea value={config.ads.externalScript || ''} onChange={(e) => setConfig(prev => ({...prev, ads: {...prev.ads, externalScript: e.target.value}}))} className="w-full bg-bgMain rounded-xl px-4 py-3 text-[10px] font-mono border border-borderMain h-24" placeholder="Script tags..." />
                </div>
              </div>
            </div>
            <button onClick={saveConfig} disabled={isSaving} className="md:col-span-2 w-full py-5 bg-primary text-white font-black uppercase rounded-3xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Synchronize Core
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-borderMain"><Globe className="text-primary"/><h3 className="text-sm font-black uppercase">Social Ecosystem</h3></div>
              <div className="space-y-4">
                <AdminInput label="Facebook" value={config.site.socials.facebook} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, socials: {...prev.site.socials, facebook: v}}}))} />
                <AdminInput label="Twitter" value={config.site.socials.twitter} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, socials: {...prev.site.socials, twitter: v}}}))} />
                <AdminInput label="Instagram" value={config.site.socials.instagram} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, socials: {...prev.site.socials, instagram: v}}}))} />
                <AdminInput label="YouTube" value={config.site.socials.youtube} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, socials: {...prev.site.socials, youtube: v}}}))} />
              </div>
            </div>
            <div className="bg-surface p-8 rounded-[2.5rem] border border-borderMain space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-borderMain"><MessageCircle className="text-primary"/><h3 className="text-sm font-black uppercase">Footer & Health</h3></div>
              <div className="space-y-4">
                <AdminInput label="Footer Credit Name" value={config.site.footerCredit} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, footerCredit: v}}))} />
                <AdminInput label="System Status Text" value={config.site.status} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, status: v}}))} />
                <AdminInput label="Build Version" value={config.site.version} onChange={(v) => setConfig(prev => ({...prev, site: {...prev.site, version: v}}))} />
              </div>
            </div>
            <button onClick={saveConfig} disabled={isSaving} className="md:col-span-2 w-full py-5 bg-primary text-white font-black uppercase rounded-3xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Synchronize Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminInput = ({ label, value, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-textDim px-1 tracking-widest">{label}</label>
    <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-bgMain rounded-xl px-4 py-3 text-xs font-bold border border-borderMain outline-none text-textMain" />
  </div>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-surface p-5 md:p-8 rounded-[2rem] border border-borderMain shadow-sm flex items-center justify-between">
    <div><p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${color}`}>{label}</p><h3 className="text-xl md:text-3xl font-black text-textMain">{typeof value === 'number' ? value.toLocaleString() : value}</h3></div>
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${color}`}>{icon}</div>
  </div>
);

const toggleTier = async (id: string, current: string) => {
  const newTier = current === 'Premium' ? 'Free' : 'Premium';
  await update(ref(rtdb, `users/${id}`), { tier: newTier, credits: newTier === 'Premium' ? 6000 : 100, maxCredits: newTier === 'Premium' ? 6000 : 100 });
};

const adjustCredits = async (id: string, current: number, amount: number) => {
  await update(ref(rtdb, `users/${id}`), { credits: (Number(current) || 0) + amount, maxCredits: Math.max((Number(current) || 0) + amount, 100) });
};

const deleteUserRecord = async (id: string) => {
  if (confirm("Purge record?")) { await remove(ref(rtdb, `users/${id}`)); await remove(ref(rtdb, `metadata/${id}`)); }
};

export default AdminView;
