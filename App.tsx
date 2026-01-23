import React, { useState, useEffect } from 'react';
import { Upload, X, Play, AlertCircle, ExternalLink, Loader2, CheckCircle2, MessageCircle, Lock, FileText, Activity, Send, Fingerprint, Database } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PlatformPills from './components/PlatformPills';
import ResultCard from './components/ResultCard';
import AdminView from './components/AdminView';
import ManageKeysModal from './components/ManageKeysModal';
import SuccessModal from './components/SuccessModal';
import TutorialModal from './components/TutorialModal';
import DailyPopupModal from './components/DailyPopupModal';
import { DEFAULT_SETTINGS } from './constants';
import { AppSettings, ExtractedMetadata, AppView, APIKeyRecord, SystemConfig } from './types';
import { processImageWithGemini } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { rtdb, ref, onValue, set, remove, push, update } from './services/firebase';

const VECTOR_PLACEHOLDER_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAByUlEQVR4nO3SQRHAIBDAsMUE/p1SInz0kgmS2dtz7z13AOzM9wXAmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vvyA6LPAwS4VAnIAAAAAElFTkSuQmCC";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('Home');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<ExtractedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeysModalOpen, setKeysModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDailyPopupOpen, setIsDailyPopupOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [sysConfig, setSysConfig] = useState<SystemConfig | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { user, profile, deductCredit, setAuthModalOpen } = useAuth();

  useEffect(() => {
    const configRef = ref(rtdb, 'system/config');
    onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.val();
        setSysConfig(config);
        
        if (config?.dailyPopup?.enabled) {
          const lastPopupDate = localStorage.getItem('last_daily_popup');
          const today = new Date().toDateString();
          if (lastPopupDate !== today) {
            setIsDailyPopupOpen(true);
            localStorage.setItem('last_daily_popup', today);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (view !== 'Home') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [view]);

  useEffect(() => {
    const ads = sysConfig?.ads?.list || [];
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sysConfig?.ads?.list?.length]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    const metadataRef = ref(rtdb, `metadata/${user.uid}`);
    const unsubscribe = onValue(metadataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as any), id })).reverse();
        setItems(list);
      } else { setItems([]); }
    });
    return () => unsubscribe();
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const processFile = async (file: File): Promise<ExtractedMetadata> => {
    return { id: '', thumbnail: VECTOR_PLACEHOLDER_B64, status: 'pending', fileName: file.name || 'asset' };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    for (const file of files) { 
      const item = await processFile(file);
      const newRef = push(ref(rtdb, `metadata/${user.uid}`));
      item.id = newRef.key || Math.random().toString();
      await set(newRef, item);
    }
  };

  const startBatchProcess = async () => {
    if (!user) { setAuthModalOpen(true); return; }
    const pending = items.filter(i => i.status === 'pending' || i.status === 'error');
    if (pending.length === 0) return;
    processBatch(pending);
  };

  const processBatch = async (batch: ExtractedMetadata[]) => {
    if (!user) return;
    setIsProcessing(true);
    setGlobalError(null);
    for (const item of batch) {
      const itemRef = ref(rtdb, `metadata/${user.uid}/${item.id}`);
      if (!profile || profile.credits <= 0) {
        await update(itemRef, { status: 'error' });
        setGlobalError("Depleted credits.");
        break;
      }
      await update(itemRef, { status: 'processing' });
      try {
        const result = await processImageWithGemini(item.thumbnail, settings, item.fileName);
        const success = await deductCredit(1);
        if (success) { 
          await update(itemRef, { ...result, status: 'completed', engine: 'Gemini' }); 
        } else { 
          await update(itemRef, { status: 'error' }); 
        }
      } catch (error: any) {
        await update(itemRef, { status: 'error' });
      }
    }
    setIsProcessing(false);
    if (items.some(i => i.status === 'completed')) { setSuccessModalOpen(true); }
  };

  const downloadAllCSV = () => {
    const completedItems = items.filter(i => i.status === 'completed');
    if (completedItems.length === 0) return;
    const headers = ['Filename', 'Title', 'Keywords', 'Description', 'Categories'];
    const rows = completedItems.map(i => [i.fileName, i.title || '', (i.keywords || []).join(', '), i.description || '', (i.categories || []).join(', ')]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `${settings.platform}_Metadata_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderViewContent = () => {
    switch (view) {
      case 'Admin':
        return <AdminView onBack={() => setView('Home')} />;
      case 'Tutorials':
        return <div className="py-10 max-w-4xl mx-auto"><TutorialModal isOpen={true} onClose={() => setView('Home')} /></div>;
      case 'Pricing':
        return (
          <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-500 py-10">
            <div className="text-center space-y-4">
               <h2 className="text-5xl font-black uppercase tracking-tighter">Operational Subscriptions</h2>
               <p className="text-textDim font-bold uppercase tracking-widest text-xs">Unlock high-throughput AI extraction</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <PricingCard tier="BASE" price="0" features={["100 Daily Credits", "Standard Vision API", "Community Support", "Manual CSV Export"]} current={profile?.tier === 'Free'} />
               <PricingCard tier="COMMAND" price="19.99" features={["6,000 Monthly Credits", "Fast-Path Extraction", "Priority Server Nodes", "Custom SEO Presets", "Dedicated Support Line"]} active current={profile?.tier === 'Premium'} />
               <PricingCard tier="ENTERPRISE" price="Custom" features={["Unlimited Extraction", "API Integration", "Whitelabel Exports", "Multi-Agent Support", "Custom Model Training"]} />
            </div>
          </div>
        );
      case 'About':
        return (
          <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-500 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic">About the Protocol</h2>
              <p className="text-primary font-black uppercase tracking-widest text-xs">The Future of Metadata Engineering</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white dark:bg-surface border border-borderMain p-10 rounded-[3rem] shadow-xl space-y-6">
                <h4 className="text-xl font-black uppercase italic tracking-tight">Our Origin</h4>
                <p className="text-textDim font-medium leading-relaxed">CSV TREE was founded in late 2024 by <span className="text-primary font-black">MINHAJUL ISLAM</span> to solve the most tedious task in microstock: metadata tagging.</p>
              </div>
              <div className="bg-white dark:bg-surface border border-borderMain p-10 rounded-[3rem] shadow-xl space-y-6">
                <h4 className="text-xl font-black uppercase italic tracking-tight">The Tech Stack</h4>
                <p className="text-textDim font-medium leading-relaxed">Utilizing Google's <span className="text-accent font-black">Gemini 3 Flash</span> models, our system analyzes textures, subjects, and resonance to generate data.</p>
              </div>
            </div>
          </div>
        );
      case 'Status':
        return (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 py-10">
             <div className="text-center space-y-4 mb-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">System Readiness</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                   <Activity size={14} /> All Nodes Operational
                </div>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <StatusRow label="AI Analysis Node" status="Operational" latency="45ms" />
                <StatusRow label="Metadata DB" status="Operational" latency="12ms" />
                <StatusRow label="Auth Gateway" status="Secure" latency="8ms" />
                <StatusRow label="Asset Storage" status="Healthy" latency="110ms" />
             </div>
          </div>
        );
      case 'Privacy':
        return <LegalView title="Data Privacy Protocol" icon={<Lock size={32} />} content="CSV TREE operates on a 'Privacy First' directive. Metadata history is encrypted and exclusively linked to your account identity." />;
      case 'Terms':
        return <LegalView title="Operational Terms" icon={<FileText size={32} />} content="Usage of CSV TREE implies agreement to our fair-use policy. Credits are non-refundable digital resources." />;
      case 'Support':
        return (
          <div className="max-w-2xl mx-auto text-center space-y-12 py-10 animate-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto border border-primary/20"><MessageCircle size={48} /></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Signal Support</h2>
              <p className="text-textDim font-bold uppercase tracking-widest text-[11px]">Direct transmission to command headquarters</p>
            </div>
            <div className="grid gap-6">
              <a href="#" className="group p-8 bg-white dark:bg-surface border border-borderMain rounded-[2.5rem] shadow-xl hover:border-primary transition-all flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-lg font-black uppercase italic">Telegram Link</h4>
                  <p className="text-[10px] text-textDim font-bold uppercase tracking-widest">Instant response fleet</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><Send size={24} /></div>
              </a>
              <a href="#" className="group p-8 bg-white dark:bg-surface border border-borderMain rounded-[2.5rem] shadow-xl hover:border-accent transition-all flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-lg font-black uppercase italic">Email Dispatch</h4>
                  <p className="text-[10px] text-textDim font-bold uppercase tracking-widest">Formal inquiry node</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all"><X size={24} /></div>
              </a>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const adsList = sysConfig?.ads?.list || [];
  const showAd = !!sysConfig?.ads?.enabled && (sysConfig?.ads?.visibility === 'All' || profile?.tier === 'Free');

  return (
    <div className={`min-h-screen bg-bgMain text-textMain transition-all duration-300 selection:bg-green-500/30 flex flex-col ${profile?.tier === 'Premium' ? 'premium-glow' : ''}`}>
      <Navbar 
        onSwitchView={(v) => setView(v)} 
        onManageKeys={() => setKeysModalOpen(true)} 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
      />
      
      {view === 'Home' && (
        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          onManageKeys={() => setKeysModalOpen(true)} 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
      <main className={`${isSidebarOpen ? 'md:pl-[280px]' : ''} pt-16 flex-grow transition-all duration-300`}>
        {view === 'Home' ? (
          <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">
            {showAd && adsList.length > 0 && (
              <div className="mb-12 animate-in slide-in-from-top-4 duration-700">
                <div className="relative group overflow-hidden rounded-[2rem] border border-borderMain bg-white dark:bg-surface shadow-2xl h-24 md:h-32">
                  <div className="flex transition-transform duration-700 h-full" style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}>
                    {adsList.map((ad, idx) => (
                      <a key={idx} href={ad.link} target="_blank" className="min-w-full h-full relative group/item">
                        <img src={ad.image} alt={`Ad ${idx}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {globalError && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-xs font-black text-red-500 uppercase">
                <AlertCircle size={20} /> {globalError} <button onClick={() => setGlobalError(null)} className="ml-auto hover:opacity-70"><X size={16} /></button>
              </div>
            )}
            <PlatformPills selected={settings.platform} onSelect={(p) => setSettings(s => ({ ...s, platform: p }))} />
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
              onDragLeave={() => setIsDragging(false)} 
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }} 
              className={`group relative rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center gap-6 border-2 border-dashed transition-all ${isDragging ? 'bg-green-50/50 border-green-500' : 'bg-white dark:bg-surface border-slate-200 dark:border-white/5'}`}
            >
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform"><Upload size={40} /></div>
              <div className="text-center space-y-2"><h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Upload Assets</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">DRAG & DROP IMAGES OR VIDEOS</p></div>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*" />
            </div>
            {items.length > 0 && (
              <div className="mt-16 md:mt-28 space-y-10 pb-20">
                <div className="flex justify-center mb-8"><button onClick={startBatchProcess} disabled={isProcessing} className="bg-green-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}{isProcessing ? 'Processing Cluster...' : `Process All Assets (${items.length})`}</button></div>
                {items.map(item => (<ResultCard key={item.id} item={item} onRegenerate={() => {}} onDelete={() => user && remove(ref(rtdb, `metadata/${user.uid}/${item.id}`))} onUpdate={(id, u) => update(ref(rtdb, `metadata/${user.uid}/${id}`), u)} onDownloadCSV={downloadAllCSV}/>))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-10 min-h-[70vh]">
            {renderViewContent()}
          </div>
        )}
      </main>
      <Footer onNavigate={(v) => setView(v)} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} count={items.filter(i => i.status === 'completed').length} onExport={downloadAllCSV} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <DailyPopupModal isOpen={isDailyPopupOpen} onClose={() => setIsDailyPopupOpen(false)} title={sysConfig?.dailyPopup?.title || "System Alert"} content={sysConfig?.dailyPopup?.content || ""} buttonText={sysConfig?.dailyPopup?.buttonText || "Execute"} buttonLink={sysConfig?.dailyPopup?.buttonLink || "#"} />
    </div>
  );
};

const PricingCard = ({ tier, price, features, active, current }: any) => (
  <div className={`p-10 rounded-[3rem] border transition-all hover:-translate-y-2 ${active ? 'border-primary bg-primary/5 shadow-2xl scale-105 z-10' : 'border-borderMain bg-white dark:bg-surface shadow-xl'}`}>
     {current && <div className="text-center mb-6"><span className="text-[10px] font-black bg-primary/20 text-primary px-4 py-1.5 rounded-full uppercase tracking-widest">ACTIVE PROTOCOL</span></div>}
     <div className="space-y-2 mb-8">
        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-textDim italic">{tier}</h4>
        <div className="flex items-baseline gap-1">
           <span className="text-5xl font-black tracking-tighter">{price === "Custom" ? "" : "$"}{price}</span>
           {price !== "Custom" && <span className="text-textDim text-sm font-bold uppercase">/mo</span>}
        </div>
     </div>
     <ul className="space-y-4 mb-10 min-h-[160px]">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-xs font-bold text-textMain/80">
             <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> {f}
          </li>
        ))}
     </ul>
     <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${active ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 text-textDim hover:bg-slate-200'}`}>Initialize Tier</button>
  </div>
);

const StatusRow = ({ label, status, latency }: any) => (
  <div className="bg-white dark:bg-surface border border-borderMain p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all hover:border-primary/30">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary border border-borderMain"><Activity size={24} /></div>
      <div className="space-y-1">
        <span className="text-sm font-black uppercase tracking-widest block">{label}</span>
        <span className="text-[10px] text-textDim font-bold uppercase tracking-[0.2em]">{latency}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
      <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">{status}</span>
    </div>
  </div>
);

const LegalView = ({ title, content, icon }: any) => (
  <div className="max-w-3xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto border border-primary/20">{icon}</div>
      <h2 className="text-4xl font-black uppercase tracking-tighter italic">{title}</h2>
    </div>
    <div className="bg-white dark:bg-surface border border-borderMain p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <p className="text-xl font-medium leading-relaxed text-textMain/90 relative z-10 italic">"{content}"</p>
      <div className="mt-12 pt-8 border-t border-borderMain flex justify-between items-center text-[10px] font-black uppercase text-textDim tracking-[0.3em]">
         <div className="flex items-center gap-2"><Fingerprint size={14} /> Encrypted Access</div>
         <div className="flex items-center gap-2"><Database size={14} /> Rev. 2024.12</div>
      </div>
    </div>
  </div>
);

export default App;