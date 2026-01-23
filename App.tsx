
import React, { useState, useEffect } from 'react';
import { Upload, Download, X, ArrowLeft, Play, FileCode, Film, FileImage, AlertCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Ad Sliding Timer
  useEffect(() => {
    const ads = sysConfig?.ads?.list || [];
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sysConfig?.ads?.list?.length]);

  // Handle External Ad Scripts Injection
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
          if (scripts[i].src) {
            s.src = scripts[i].src;
            s.async = true;
          } else {
            s.textContent = scripts[i].textContent;
          }
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
    if (!user) {
      setItems([]);
      return;
    }
    const metadataRef = ref(rtdb, `metadata/${user.uid}`);
    const unsubscribe = onValue(metadataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({
          ...(val as any),
          id
        })).reverse();
        setItems(list);
      } else {
        setItems([]);
      }
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
      video.onloadedmetadata = () => {
        video.currentTime = 0.5;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
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
    } catch (e) {
      console.error("Preview error for:", file.name, e);
    }
    return {
      id: '',
      thumbnail,
      status: 'pending',
      fileName: file.name || 'unnamed_file'
    };
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
      } catch (err) {
        console.error("File Prep Error:", err);
      }
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
        if (success) {
          await update(itemRef, { ...result, status: 'completed', engine: detectedEngine });
        } else {
          await update(itemRef, { status: 'error' });
        }
      } catch (error: any) {
        console.error("Processing Error for", item.fileName, ":", error);
        await update(itemRef, { status: 'error' });
        if (error.message?.includes("API Key")) {
          setGlobalError(`Critical Error: ${error.message}`);
          break;
        }
      }
    }
    setIsProcessing(false);
    if (items.some(i => i.status === 'completed')) {
      setSuccessModalOpen(true);
    }
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
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `CSV_TREE_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">
          
          {/* TOP AD SECTION (HERO SLIDER) */}
          {showAd && adsList.length > 0 && (
            <div className="mb-12 animate-in slide-in-from-top-4 duration-700">
              <div className="relative group overflow-hidden rounded-[2rem] border border-borderMain bg-white dark:bg-surface shadow-2xl h-24 md:h-32">
                <div 
                  className="flex transition-transform duration-700 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
                >
                  {adsList.map((ad, idx) => (
                    <a key={idx} href={ad.link} target="_blank" className="min-w-full h-full relative group/item">
                      <div className="absolute top-3 right-5 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">{ad.label || 'SPONSORED'}</div>
                      <img src={ad.image} alt={`Ad ${idx}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center px-8 md:px-12">
                         <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-primary font-black uppercase tracking-[0.2em] text-[8px]">
                              <AlertCircle size={10} /> Recommended Unit
                            </div>
                            <p className="text-white text-base md:text-xl font-black italic uppercase tracking-tighter leading-none max-w-sm">Elevate Your Content Workflow</p>
                            <button className="mt-2 bg-white text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all shadow-lg">View <ExternalLink size={10} /></button>
                         </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Slider Controls */}
                {adsList.length > 1 && (
                  <>
                    <button onClick={() => setCurrentAdIndex(prev => (prev - 1 + adsList.length) % adsList.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"><ChevronLeft size={16}/></button>
                    <button onClick={() => setCurrentAdIndex(prev => (prev + 1) % adsList.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"><ChevronRight size={16}/></button>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {adsList.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all ${currentAdIndex === idx ? 'w-4 bg-primary' : 'w-1 bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {globalError && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-xs font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={20} />
              {globalError}
              <button onClick={() => setGlobalError(null)} className="ml-auto hover:opacity-70"><X size={16} /></button>
            </div>
          )}

          <PlatformPills selected={settings.platform} onSelect={(p) => setSettings(s => ({ ...s, platform: p }))} />
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
            onDragLeave={() => setIsDragging(false)} 
            onDrop={handleDrop} 
            className={`group relative rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center gap-6 transition-all duration-700 border-2 border-dashed overflow-hidden ${isDragging ? 'bg-green-50/50 border-green-500 scale-[1.01]' : 'bg-white dark:bg-surface border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md'}`}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 transition-transform group-hover:scale-110">
              <Upload size={40} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">Drag & Drop files here</h2>
              <p className="text-slate-400 font-bold">or click to browse</p>
            </div>
            <div className="flex items-center gap-4 md:gap-6 text-slate-300 dark:text-slate-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-6">
              <div className="flex items-center gap-1.5"><FileImage size={14} /> IMAGE</div>
              <div className="flex items-center gap-1.5"><FileCode size={14} /> VECTOR</div>
              <div className="flex items-center gap-1.5"><Film size={14} /> VIDEO</div>
            </div>
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*,.svg,.ai,.eps" />
          </div>

          {items.length > 0 && (
            <div className="mt-16 md:mt-28 space-y-10 animate-in fade-in duration-1000">
              <div className="md:sticky top-20 z-30 space-y-6">
                <div className="flex items-center justify-center mb-8">
                  <button 
                    onClick={startBatchProcess}
                    disabled={isProcessing || pendingCount === 0}
                    className="bg-green-500 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                    {isProcessing ? 'Processing Cluster...' : `Process Files (${items.length})`}
                  </button>
                </div>
                <div className="bg-white dark:bg-surface border border-borderMain rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-8 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto no-scrollbar">
                    <span className="flex items-center gap-2 whitespace-nowrap">Total: <span className="text-slate-800 dark:text-white">{items.length}</span></span>
                    <span className="flex items-center gap-2 whitespace-nowrap">Completed: <span className="text-green-500">{completedCount}</span></span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <button 
                      onClick={() => user && remove(ref(rtdb, `metadata/${user.uid}`))}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all whitespace-nowrap"
                    >
                      <X size={14} /> Clear
                    </button>
                    <button 
                      onClick={downloadAllCSV}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-black/20 transition-all whitespace-nowrap"
                    >
                      <Download size={14} /> Export
                    </button>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                    style={{ width: `${(completedCount / items.length) * 100}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-6 md:space-y-8 pb-20">
                {items.map(item => (
                  <ResultCard 
                    key={item.id} 
                    item={item} 
                    onRegenerate={() => processBatch([item])} 
                    onDelete={() => user && remove(ref(rtdb, `metadata/${user.uid}/${item.id}`))}
                    onUpdate={updateItemLocal}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer onNavigate={setView} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setSuccessModalOpen(false)} count={items.filter(i => i.status === 'completed').length} onExport={downloadAllCSV} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <style>{`
        .premium-glow {
          background-image: radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
          background-attachment: fixed;
        }
      `}</style>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={`animate-spin ${className}`} width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default App;
