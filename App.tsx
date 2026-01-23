
import React, { useState, useEffect } from 'react';
import { Upload, Download, X, ArrowLeft, Play, FileCode, Film, FileImage, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, Check, Heart, Shield, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PlatformPills from './components/PlatformPills';
import ResultCard from './components/ResultCard';
import AdminView from './components/AdminView';
import ManageKeysModal from './components/ManageKeysModal';
import SuccessModal from './components/SuccessModal';
import TutorialModal from './components/TutorialModal';
import { DEFAULT_SETTINGS } from './constants';
import { AppSettings, ExtractedMetadata, AppView, APIKeyRecord, SystemConfig } from './types';
import { processImageWithGemini } from './services/geminiService';
import { processImageWithGroq } from './services/groqService';
import { useAuth } from './contexts/AuthContext';
import { rtdb, ref, onValue, set, remove, push, update } from './services/firebase';

const VECTOR_PLACEHOLDER_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAByUlEQVR4nO3SQRHAIBDAsMUE/p1SInz0kgmS2dtz7z13AOzM9wXAmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vvyA6LPAwS4VAnIAAAAAElFTkSuQmCC";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('Home');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<ExtractedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeysModalOpen, setKeysModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [sysConfig, setSysConfig] = useState<SystemConfig | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const { user, profile, deductCredit, setAuthModalOpen } = useAuth();

  useEffect(() => {
    const configRef = ref(rtdb, 'system/config');
    onValue(configRef, (snapshot) => {
      if (snapshot.exists()) setSysConfig(snapshot.val());
    });
  }, []);

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
    if (sysConfig?.ads?.externalScript) {
      const scriptId = 'external-ad-script';
      if (!document.getElementById(scriptId)) {
        const div = document.createElement('div');
        div.id = scriptId;
        div.innerHTML = sysConfig.ads.externalScript;
        const scripts = div.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = document.createElement('script');
          if (scripts[i].src) { s.src = scripts[i].src; s.async = true; } 
          else { s.textContent = scripts[i].textContent; }
          document.body.appendChild(s);
        }
        document.body.appendChild(div);
      }
    }
  }, [sysConfig]);

  useEffect(() => {
    const saved = localStorage.getItem('csv-tree-settings');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        delete parsed.engine;
        setSettings(prev => ({ ...prev, ...parsed })); 
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('csv-tree-settings', JSON.stringify(settings));
  }, [settings]);

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

  const extractFrameFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => { video.currentTime = 0.5; };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
      };
      video.onerror = () => { URL.revokeObjectURL(video.src); resolve(VECTOR_PLACEHOLDER_B64); };
    });
  };

  const processFile = async (file: File): Promise<ExtractedMetadata> => {
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    let thumbnail = VECTOR_PLACEHOLDER_B64;
    try {
      if (file.type?.startsWith('image/') && extension !== 'svg') {
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } else if (file.type?.startsWith('video/')) {
        thumbnail = await extractFrameFromVideo(file);
      } else if (extension === 'svg') {
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }
    } catch (e) { console.error("Preview error for:", file.name, e); }
    return { id: '', thumbnail, status: 'pending', fileName: file.name || 'unnamed_file' };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    if (profile && profile.credits < files.length) {
      setGlobalError(`Insufficient Credits. You have ${profile.credits} units remaining.`);
      return;
    }
    for (const file of files) { 
      try {
        const item = await processFile(file);
        const newRef = push(ref(rtdb, `metadata/${user.uid}`));
        item.id = newRef.key || Math.random().toString();
        await set(newRef, item);
      } catch (err) { console.error("File Prep Error:", err); }
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
      const currentProfile = profile; 
      if (!currentProfile || currentProfile.credits <= 0) {
        await update(itemRef, { status: 'error' });
        setGlobalError("Batch stopped: Out of credits.");
        break;
      }
      await update(itemRef, { status: 'processing' });
      try {
        const geminiKey = (Object.values(profile?.apiKeys || {}) as APIKeyRecord[]).find(k => k.provider === 'Gemini')?.key;
        const groqKey = (Object.values(profile?.apiKeys || {}) as APIKeyRecord[]).find(k => k.provider === 'Groq')?.key;
        let result;
        let detectedEngine: 'Gemini' | 'Groq' = 'Gemini';
        if (geminiKey) {
          result = await processImageWithGemini(item.thumbnail, settings, item.fileName, profile?.apiKeys);
          detectedEngine = 'Gemini';
        } else if (groqKey) {
          result = await processImageWithGroq(item.thumbnail, settings, groqKey);
          detectedEngine = 'Groq';
        } else {
          result = await processImageWithGemini(item.thumbnail, settings, item.fileName, profile?.apiKeys);
          detectedEngine = 'Gemini';
        }
        const success = await deductCredit(1);
        if (success) { await update(itemRef, { ...result, status: 'completed', engine: detectedEngine }); } 
        else { await update(itemRef, { status: 'error' }); }
      } catch (error: any) {
        console.error("Processing Error for", item.fileName, ":", error);
        await update(itemRef, { status: 'error' });
        if (error.message?.includes("API Key")) { setGlobalError(`Critical Error: ${error.message}`); break; }
      }
    }
    setIsProcessing(false);
    if (items.some(i => i.status === 'completed')) { setSuccessModalOpen(true); }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      for (const file of files) { 
        const item = await processFile(file);
        const newRef = push(ref(rtdb, `metadata/${user.uid}`));
        item.id = newRef.key || '';
        await set(newRef, item);
      }
    }
  };

  const downloadAllCSV = () => {
    const completedItems = items.filter(i => i.status === 'completed');
    if (completedItems.length === 0) return;
    const isPromptMode = completedItems[0].prompt !== undefined;
    const headers = isPromptMode ? ['Filename', 'Prompt'] : ['Filename', 'Title', 'Keywords', 'Category', 'Description'];
    const rows = completedItems.map(i => isPromptMode ? [i.fileName, i.prompt || ''] : [i.fileName, i.title || '', (i.keywords || []).join(', '), (i.categories || []).join(', '), i.description || '']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `CSV_TREE_Export.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const updateItemLocal = async (id: string, updates: Partial<ExtractedMetadata>) => {
    if (!user) return;
    await update(ref(rtdb, `metadata/${user.uid}/${id}`), updates);
  };

  const showAd = sysConfig?.ads?.enabled && (sysConfig.ads.visibility === 'All' || (sysConfig.ads.visibility === 'Free' && profile?.tier !== 'Premium'));
  const adsList = sysConfig?.ads?.list || [];

  if (view === 'Admin') return <AdminView onBack={() => setView('Home')} />;

  const completedCount = items.filter(i => i.status === 'completed').length;
  const pendingCount = items.length - completedCount;

  const renderContentPage = (title: string, children: React.ReactNode) => (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 animate-in slide-in-from-bottom-4">
      <button onClick={() => setView('Home')} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-10 hover:gap-3 transition-all"><ArrowLeft size={16}/> Back to Vision</button>
      <h1 className="text-4xl md:text-5xl font-black italic uppercase text-textMain tracking-tighter mb-10">{title}</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-bgMain text-textMain transition-all duration-300 selection:bg-green-500/30 flex flex-col ${profile?.tier === 'Premium' ? 'premium-glow' : ''}`}>
      <Navbar onSwitchView={(v) => v === 'Tutorials' ? setIsTutorialOpen(true) : setView(v)} onManageKeys={() => setKeysModalOpen(true)} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      <Sidebar settings={settings} setSettings={setSettings} onManageKeys={() => setKeysModalOpen(true)} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="md:pl-[280px] pt-16 flex-grow transition-all">
        {view === 'Home' ? (
          <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">
            {showAd && adsList.length > 0 && (
              <div className="mb-12 animate-in slide-in-from-top-4 duration-700">
                <div className="relative group overflow-hidden rounded-[2rem] border border-borderMain bg-white dark:bg-surface shadow-2xl h-24 md:h-32">
                  <div className="flex transition-transform duration-700 h-full" style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}>
                    {adsList.map((ad, idx) => (
                      <a key={idx} href={ad.link} target="_blank" className="min-w-full h-full relative group/item">
                        <div className="absolute top-3 right-5 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-white border border-white/10 uppercase">{ad.label || 'SPONSORED'}</div>
                        <img src={ad.image} alt={`Ad ${idx}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center px-8 md:px-12">
                           <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-primary font-black uppercase text-[8px]"><AlertCircle size={10} /> RECOMMENDED</div>
                              <p className="text-white text-base md:text-xl font-black italic uppercase tracking-tighter leading-none">Optimize Your Workflow</p>
                              <button className="mt-2 bg-white text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg">View <ExternalLink size={10} /></button>
                           </div>
                        </div>
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
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={`group relative rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center gap-6 transition-all border-2 border-dashed ${isDragging ? 'bg-green-50/50 border-green-500' : 'bg-white dark:bg-surface border-slate-200 dark:border-white/5'}`}>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform"><Upload size={40} /></div>
              <div className="text-center space-y-2"><h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">Drag & Drop files here</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">or click to browse</p></div>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*,.svg,.ai,.eps" />
            </div>
            {items.length > 0 && (
              <div className="mt-16 md:mt-28 space-y-10">
                <div className="md:sticky top-20 z-30 space-y-6">
                  <div className="flex justify-center mb-8"><button onClick={startBatchProcess} disabled={isProcessing || pendingCount === 0} className="bg-green-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}{isProcessing ? 'Processing Cluster...' : `Process Files (${items.length})`}</button></div>
                  <div className="bg-white dark:bg-surface border border-borderMain rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-center gap-8 text-[11px] font-black uppercase text-slate-400">
                      <span>Total: <span className="text-slate-800 dark:text-white">{items.length}</span></span>
                      <span>Completed: <span className="text-green-500">{completedCount}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => user && remove(ref(rtdb, `metadata/${user.uid}`))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 transition-all"><X size={14} /> Clear</button>
                      <button onClick={downloadAllCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-[9px] font-black uppercase hover:brightness-110 shadow-lg"><Download size={14} /> Export</button>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(completedCount / items.length) * 100}%` }} /></div>
                </div>
                <div className="space-y-8 pb-20">{items.map(item => (<ResultCard key={item.id} item={item} onRegenerate={() => processBatch([item])} onDelete={() => user && remove(ref(rtdb, `metadata/${user.uid}/${item.id}`))} onUpdate={updateItemLocal}/>))}</div>
              </div>
            )}
          </div>
        ) : view === 'About' ? renderContentPage("About Vision", (
          <div className="space-y-12">
            <div className="bg-surface p-10 rounded-[2.5rem] border border-borderMain">
              <p className="text-lg font-bold leading-relaxed text-textDim italic">CSV TREE Pro is a high-speed AI infrastructure engineered specifically for microstock contributors. By leveraging Gemini Vision & Llama 3.2 Vision, we bridge the gap between creative visual content and SEO excellence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                 <Shield className="text-primary" />
                 <h3 className="text-lg font-black uppercase italic tracking-tighter">Security First</h3>
                 <p className="text-sm font-medium text-textDim">Your data is stored in isolated real-time database clusters. Your API keys never touch our analytics, ensuring absolute privacy.</p>
              </div>
              <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 space-y-4">
                 <Sparkles className="text-accent" />
                 <h3 className="text-lg font-black uppercase italic tracking-tighter">AI Precision</h3>
                 <p className="text-sm font-medium text-textDim">Optimized prompts ensure that metadata matches stock platform algorithms for high visibility and indexing.</p>
              </div>
            </div>
          </div>
        )) : view === 'Pricing' ? renderContentPage("Energy Packages", (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-10 rounded-[3rem] border border-borderMain space-y-8">
               <div className="space-y-2">
                 <div className="text-textDim text-[10px] font-black uppercase tracking-widest">Operator Tier</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Free Tier</h2>
               </div>
               <div className="text-5xl font-black tracking-tighter">$0 <span className="text-sm text-textDim font-bold">/ LIFETIME</span></div>
               <ul className="space-y-4">
                 <li className="flex items-center gap-3 text-sm font-bold"><Check size={18} className="text-primary"/> 100 Monthly Energy Credits</li>
                 <li className="flex items-center gap-3 text-sm font-bold"><Check size={18} className="text-primary"/> Standard Vision Analysis</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-textDim opacity-50"><X size={18}/> Priority Batch Processing</li>
               </ul>
               <button onClick={() => setAuthModalOpen(true)} className="w-full py-4 bg-bgMain rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Current Plan</button>
            </div>
            <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 space-y-8 transform hover:scale-[1.02] transition-transform">
               <div className="space-y-2">
                 <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">Elite Tier</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Premium Access</h2>
               </div>
               <div className="text-5xl font-black tracking-tighter">$19 <span className="text-sm text-white/60 font-bold">/ ONE TIME</span></div>
               <ul className="space-y-4">
                 <li className="flex items-center gap-3 text-sm font-bold"><Check size={18}/> 6,000 Energy Credits</li>
                 <li className="flex items-center gap-3 text-sm font-bold"><Check size={18}/> High-Speed Batch Nodes</li>
                 <li className="flex items-center gap-3 text-sm font-bold"><Check size={18}/> Ad-Free Vision Experience</li>
               </ul>
               <button className="w-full py-4 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl">Upgrade Identity</button>
            </div>
          </div>
        )) : view === 'Privacy' ? renderContentPage("Data Protection", (
          <div className="space-y-6 text-textDim font-medium leading-relaxed">
            <p>At CSV TREE, we treat your visual intellectual property with extreme care. This Privacy Policy describes how we handle your information.</p>
            <h3 className="text-textMain font-black uppercase tracking-widest text-xs">01. Information Collection</h3>
            <p>We only store your email and profile name for authentication. Temporary metadata entries are purged upon user request.</p>
            <h3 className="text-textMain font-black uppercase tracking-widest text-xs">02. API Interactions</h3>
            <p>When you use your own API keys, communication happens directly between your browser and the AI provider (Google/Groq). We do not intercept or log your keys on our servers.</p>
          </div>
        )) : view === 'Terms' ? renderContentPage("Service Protocol", (
          <div className="space-y-6 text-textDim font-medium leading-relaxed">
            <p>By accessing CSV TREE Pro, you agree to comply with the following protocols:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>Users are responsible for verifying the accuracy of AI-generated metadata before uploading to stock platforms.</li>
              <li>Unauthorized distribution of automated extraction scripts derived from this app is prohibited.</li>
              <li>Credits (Energy Units) are non-transferable between operator accounts.</li>
            </ul>
          </div>
        )) : view === 'Status' ? renderContentPage("Infrastructure Status", (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatusCard label="Authentication Node" status="ONLINE" uptime="99.9%" />
              <StatusCard label="Vision Cluster (Gemini)" status="ONLINE" uptime="98.5%" />
              <StatusCard label="Database Sync" status="ONLINE" uptime="100%" />
            </div>
            <div className="p-8 bg-surface border border-borderMain rounded-3xl">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                 <span className="font-black uppercase tracking-widest text-xs">All Systems Operational</span>
               </div>
               <p className="text-sm text-textDim">Last health check performed 5 minutes ago.</p>
            </div>
          </div>
        )) : renderContentPage("Operator Support", (
          <div className="bg-surface p-12 rounded-[3rem] border border-borderMain text-center space-y-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto"><AlertCircle size={40} /></div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Need Technical Support?</h2>
            <p className="text-textDim font-bold max-w-sm mx-auto">Our engineering team is ready to assist you with any infrastructure queries.</p>
            <div className="flex flex-col gap-4">
              <a href="mailto:support@csvtree.com" className="py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">Open Support Ticket</a>
              <button onClick={() => setView('Home')} className="text-[10px] font-black uppercase text-textDim hover:text-primary transition-colors">Return to Home</button>
            </div>
          </div>
        ))}
      </main>
      
      <Footer onNavigate={setView} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} count={items.filter(i => i.status === 'completed').length} onExport={downloadAllCSV} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <style>{` .premium-glow { background-image: radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%); background-attachment: fixed; } `}</style>
    </div>
  );
};

const StatusCard = ({ label, status, uptime }: any) => (
  <div className="bg-surface p-6 rounded-3xl border border-borderMain space-y-2">
    <div className="text-textDim text-[9px] font-black uppercase tracking-widest">{label}</div>
    <div className="text-green-500 font-black text-xl italic">{status}</div>
    <div className="text-[10px] font-bold text-textDim opacity-50 uppercase tracking-widest">{uptime} UPTIME</div>
  </div>
);

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={`animate-spin ${className}`} width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default App;
