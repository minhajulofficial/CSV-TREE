import React, { useState, useEffect } from 'react';
import { Upload, Download, X, Play, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
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
import { AppSettings, ExtractedMetadata, AppView, APIKeyRecord, SystemConfig, Platform } from './types';
import { processImageWithGemini } from './services/geminiService';
import { processImageWithGroq } from './services/groqService';
import { useAuth } from './contexts/AuthContext';
import { rtdb, ref, onValue, set, remove, push, update } from './services/firebase';

const VECTOR_PLACEHOLDER_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAByUlEQVR4nO3SQRHAIBDAsMUE/p1SInz0kgmS2dtz7z13AOzM9wXAmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vvyA6LPAwS4VAnIAAAAAElFTkSuQmCC";

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
        
        // Handle Daily Popup logic
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
    const ads = sysConfig?.ads?.list || [];
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sysConfig?.ads?.list?.length]);

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

  const sanitizeImage = (source: string | HTMLImageElement | HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
      const process = (drawable: HTMLImageElement | HTMLVideoElement) => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1024;
        let width = drawable instanceof HTMLVideoElement ? drawable.videoWidth : drawable.width;
        let height = drawable instanceof HTMLVideoElement ? drawable.videoHeight : drawable.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width || 800;
        canvas.height = height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      if (typeof source === 'string') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => process(img);
        img.onerror = () => resolve(VECTOR_PLACEHOLDER_B64);
        img.src = source;
      } else {
        process(source);
      }
    });
  };

  const extractFrameFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => { video.currentTime = 0.5; };
      video.onseeked = async () => {
        const sanitized = await sanitizeImage(video);
        URL.revokeObjectURL(video.src);
        resolve(sanitized);
      };
      video.onerror = () => { 
        URL.revokeObjectURL(video.src); 
        resolve(VECTOR_PLACEHOLDER_B64); 
      };
    });
  };

  const processFile = async (file: File): Promise<ExtractedMetadata> => {
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    let thumbnail = VECTOR_PLACEHOLDER_B64;
    
    try {
      if (file.type?.startsWith('image/') && extension !== 'svg') {
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const sanitized = await sanitizeImage(e.target?.result as string);
            resolve(sanitized);
          };
          reader.readAsDataURL(file);
        });
      } else if (file.type?.startsWith('video/')) {
        thumbnail = await extractFrameFromVideo(file);
      } else if (extension === 'svg' || file.type === 'image/svg+xml') {
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
              const sanitized = await sanitizeImage(img);
              resolve(sanitized);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (e) { 
      console.error("Preparation error for:", file.name, e); 
    }
    
    return { id: '', thumbnail, status: 'pending', fileName: file.name || 'asset' };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    if (profile && profile.credits < files.length) {
      setGlobalError(`Energy levels low. Current: ${profile.credits} units.`);
      return;
    }
    for (const file of files) { 
      try {
        const item = await processFile(file);
        const newRef = push(ref(rtdb, `metadata/${user.uid}`));
        item.id = newRef.key || Math.random().toString();
        await set(newRef, item);
      } catch (err) { console.error("Batch prep failure:", err); }
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
        setGlobalError("Depleted. Refuel at command center.");
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
          result = await processImageWithGemini(item.thumbnail, settings, item.fileName);
          detectedEngine = 'Gemini';
        }

        const success = await deductCredit(1);
        if (success) { 
          await update(itemRef, { ...result, status: 'completed', engine: detectedEngine }); 
        } else { 
          await update(itemRef, { status: 'error' }); 
        }
      } catch (error: any) {
        console.error("Critical Engine Failure:", error);
        await update(itemRef, { status: 'error' });
        if (error.message?.toLowerCase().includes("api key") || error.message?.toLowerCase().includes("process input image") || error.message?.toLowerCase().includes("decommissioned")) { 
          setGlobalError(`System Interruption: ${error.message}`); 
          break; 
        }
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
    let headers: string[] = [];
    let rows: any[][] = [];

    if (isPromptMode) {
      headers = ['Filename', 'Prompt'];
      rows = completedItems.map(i => [i.fileName, i.prompt || '']);
    } else {
      // Platform Specific Header Mapping
      switch (settings.platform) {
        case 'AdobeStock':
          headers = ['Filename', 'Title', 'Keywords'];
          rows = completedItems.map(i => [i.fileName, i.title || '', (i.keywords || []).join(', ')]);
          break;
        case 'Shutterstock':
          headers = ['Filename', 'Description', 'Keywords', 'Categories'];
          rows = completedItems.map(i => [i.fileName, i.title || '', (i.keywords || []).join(', '), (i.categories || []).join(', ')]);
          break;
        case 'Freepik':
          headers = ['File name', 'Title', 'Keywords'];
          rows = completedItems.map(i => [i.fileName, i.title || '', (i.keywords || []).join(',')]);
          break;
        case 'Vecteezy':
          headers = ['Filename', 'Title', 'Description', 'Keywords'];
          rows = completedItems.map(i => [i.fileName, i.title || '', i.description || '', (i.keywords || []).join(', ')]);
          break;
        default:
          headers = ['Filename', 'Title', 'Keywords', 'Description', 'Categories'];
          rows = completedItems.map(i => [i.fileName, i.title || '', (i.keywords || []).join(', '), i.description || '', (i.categories || []).join(', ')]);
      }
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `${settings.platform}_Metadata_${Date.now()}.csv`);
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
                              <p className="text-white text-base md:text-xl font-black italic uppercase tracking-tighter leading-none">Optimize Workflow</p>
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
              <div className="text-center space-y-2"><h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">Upload Assets</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">or drag & drop images/videos</p></div>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*,.svg,.ai,.eps" />
            </div>
            {items.length > 0 && (
              <div className="mt-16 md:mt-28 space-y-10">
                <div className="md:sticky top-20 z-30 space-y-6">
                  <div className="flex justify-center mb-8"><button onClick={startBatchProcess} disabled={isProcessing || pendingCount === 0} className="bg-green-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}{isProcessing ? 'Processing Cluster...' : `Process All Assets (${items.length})`}</button></div>
                  <div className="bg-white dark:bg-surface border border-borderMain rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-center gap-8 text-[11px] font-black uppercase text-slate-400">
                      <span>Total: <span className="text-slate-800 dark:text-white">{items.length}</span></span>
                      <span>Completed: <span className="text-green-500">{completedCount}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => user && remove(ref(rtdb, `metadata/${user.uid}`))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 transition-all"><X size={14} /> Clear</button>
                      <button onClick={downloadAllCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-[9px] font-black uppercase hover:brightness-110 shadow-lg"><Download size={14} /> Export CSV</button>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(completedCount / items.length) * 100}%` }} /></div>
                </div>
                <div className="space-y-12 pb-20">{items.map(item => (<ResultCard key={item.id} item={item} onRegenerate={() => processBatch([item])} onDelete={() => user && remove(ref(rtdb, `metadata/${user.uid}/${item.id}`))} onUpdate={updateItemLocal} onDownloadCSV={downloadAllCSV}/>))}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 text-center">
             <h2 className="text-2xl font-black uppercase tracking-widest opacity-20">View Restricted</h2>
          </div>
        )}
      </main>
      <Footer onNavigate={setView} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} count={items.filter(i => i.status === 'completed').length} onExport={downloadAllCSV} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <DailyPopupModal 
        isOpen={isDailyPopupOpen} 
        onClose={() => setIsDailyPopupOpen(false)}
        title={sysConfig?.dailyPopup?.title || "System Message"}
        content={sysConfig?.dailyPopup?.content || ""}
        buttonText={sysConfig?.dailyPopup?.buttonText || "Check It Out"}
        buttonLink={sysConfig?.dailyPopup?.buttonLink || "#"}
      />
    </div>
  );
};

export default App;