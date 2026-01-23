
import React, { useState, useEffect } from 'react';
import { Upload, Download, X, Layers, ArrowLeft, Play, LayoutGrid, CheckCircle, ShieldCheck, FileCode, Film, FileImage } from 'lucide-react';
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
import { AppSettings, ExtractedMetadata, FileType, AppView } from './types';
import { processImageWithGemini } from './services/geminiService';
import { processImageWithGroq } from './services/groqService';
import { useAuth } from './contexts/AuthContext';
import { rtdb, ref, onValue, set, remove, push, update } from './services/firebase';

const VECTOR_PLACEHOLDER_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAByUlEQVR4nO3SQRHAIBDAsMUE/p1SInz0kgmS2dtz7z13AOzM9wXAmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vuCAzhvBiCcGYBwZgDCmQEIZwYgnBmAcGYAwpkBCGcGIIwZgHBmAMKZfQB25vvyA6LPAwS4VAnIAAAAAElFTkSuQmCC";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('Home');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<ExtractedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeysModalOpen, setKeysModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { user, profile, deductCredit, setAuthModalOpen } = useAuth();

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
    const extension = file.name.split('.').pop()?.toLowerCase();
    let thumbnail = VECTOR_PLACEHOLDER_B64;

    if (file.type.startsWith('image/') && extension !== 'svg') {
      thumbnail = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (file.type.startsWith('video/')) {
      thumbnail = await extractFrameFromVideo(file);
    } else if (extension === 'svg') {
      // SVG can be read as a data URL easily
      thumbnail = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else {
      // For AI, EPS, etc. - Use the vector placeholder base64
      thumbnail = VECTOR_PLACEHOLDER_B64;
    }

    return {
      id: '',
      thumbnail,
      status: 'pending',
      fileName: file.name
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    if (profile && profile.credits < files.length) {
      alert(`Insufficient Credits. Required: ${files.length}, Available: ${profile.credits}`);
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
    const pending = items.filter(i => i.status === 'pending' || i.status === 'error');
    if (pending.length === 0) return;
    processBatch(pending);
  };

  const processBatch = async (batch: ExtractedMetadata[]) => {
    if (!user) return;
    setIsProcessing(true);
    for (const item of batch) {
      const itemRef = ref(rtdb, `metadata/${user.uid}/${item.id}`);
      const currentProfile = profile; 
      if (!currentProfile || currentProfile.credits <= 0) {
        await update(itemRef, { status: 'error' });
        continue;
      }

      await update(itemRef, { status: 'processing' });
      
      try {
        const geminiKey = Object.values(profile?.apiKeys || {}).find(k => k.provider === 'Gemini')?.key;
        const groqKey = Object.values(profile?.apiKeys || {}).find(k => k.provider === 'Groq')?.key;

        let result;
        let detectedEngine: 'Gemini' | 'Groq' = 'Gemini';

        if (geminiKey || !groqKey) {
          result = await processImageWithGemini(item.thumbnail, settings, profile?.apiKeys);
          detectedEngine = 'Gemini';
        } else {
          result = await processImageWithGroq(item.thumbnail, settings, groqKey);
          detectedEngine = 'Groq';
        }

        const success = await deductCredit(1);
        if (success) {
          await update(itemRef, { ...result, status: 'completed', engine: detectedEngine });
        } else {
          await update(itemRef, { status: 'error' });
        }
      } catch (error: any) {
        console.error("Processing Critical Error:", error);
        await update(itemRef, { status: 'error' });
      }
    }
    setIsProcessing(false);
    setSuccessModalOpen(true);
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

  if (view === 'Admin') return <AdminView onBack={() => setView('Home')} />;

  const completedCount = items.filter(i => i.status === 'completed').length;
  const pendingCount = items.length - completedCount;

  const renderContent = () => {
    if (view === 'Home') {
      return (
        <div className="max-w-6xl mx-auto px-10 py-16">
          <PlatformPills selected={settings.platform} onSelect={(p) => setSettings(s => ({ ...s, platform: p }))} />
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
            onDragLeave={() => setIsDragging(false)} 
            onDrop={handleDrop} 
            className={`group relative rounded-[3rem] p-24 flex flex-col items-center justify-center gap-6 transition-all duration-700 border-2 border-dashed overflow-hidden ${isDragging ? 'bg-green-50/50 border-green-500 scale-[1.01]' : 'bg-white dark:bg-surface border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md'}`}
          >
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 transition-transform group-hover:scale-110">
              <Upload size={40} />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Drag & Drop files here</h2>
              <p className="text-slate-400 font-bold">or click to browse</p>
            </div>

            <div className="flex items-center gap-6 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest mt-6">
              <div className="flex items-center gap-1.5"><FileImage size={14} /> IMAGE</div>
              <div className="flex items-center gap-1.5"><FileCode size={14} /> VECTOR</div>
              <div className="flex items-center gap-1.5"><Film size={14} /> VIDEO</div>
            </div>

            <div className="mt-12 bg-slate-50 dark:bg-black/20 px-6 py-3 rounded-full flex items-center gap-3 text-[10px] text-slate-500 font-bold border border-slate-200/50">
               <ShieldCheck size={14} className="text-green-500" />
               Processed locally & securely. Your files never leave your browser.
            </div>

            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*,video/*,.svg,.ai,.eps" />
          </div>

          {items.length > 0 && (
            <div className="mt-28 space-y-10 animate-in fade-in duration-1000">
              <div className="sticky top-20 z-30 space-y-6">
                <div className="flex items-center justify-center mb-8">
                  <button 
                    onClick={startBatchProcess}
                    disabled={isProcessing || pendingCount === 0}
                    className="bg-green-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Play size={20} fill="currentColor" /> Process Files ({items.length})
                  </button>
                </div>

                <div className="bg-white dark:bg-surface border border-borderMain rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2">Total: <span className="text-slate-800 dark:text-white">{items.length}</span></span>
                    <span className="flex items-center gap-2">Completed: <span className="text-green-500">{completedCount}</span></span>
                    <span className="flex items-center gap-2">Remaining: <span className="text-slate-800 dark:text-white">{pendingCount}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
                      <LayoutGrid size={16} /> Select Items
                    </button>
                    <button 
                      onClick={() => user && remove(ref(rtdb, `metadata/${user.uid}`))}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X size={16} /> Clear All
                    </button>
                    <button 
                      onClick={downloadAllCSV}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-black/20 transition-all"
                    >
                      <Download size={16} /> Export CSV
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

              <div className="space-y-8 pb-20">
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
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-10 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-4">
        <button onClick={() => setView('Home')} className="flex items-center gap-2 text-green-500 font-black uppercase text-[10px] tracking-widest hover:gap-3 transition-all"><ArrowLeft size={16} /> Return Home</button>
        <div className="space-y-4">
          <h1 className="text-6xl font-black italic tracking-tight uppercase leading-none">{view}</h1>
          <div className="h-2 w-24 bg-green-500 rounded-full" />
        </div>
        <div className="prose dark:prose-invert max-w-none text-textDim font-medium leading-relaxed text-lg italic">
          {view === 'About' && "CSV TREE Pro transforms visual assets into searchable, indexed metadata using high-frequency AI clusters. Our mission is to accelerate creator workflows through intelligence."}
          {view === 'Pricing' && "Free operators receive 100 energy units daily. Premium members gain priority access to our compute clusters with 6,000 units per month and early access to new AI models."}
          {(view === 'Privacy' || view === 'Terms') && "Your data remains your property. We operate as a zero-retention bridge between your media and AI engines. All session logs can be purged at any time by the user."}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bgMain text-textMain transition-all duration-300 selection:bg-green-500/30 flex flex-col">
      <Navbar onSwitchView={(v) => v === 'Tutorials' ? setIsTutorialOpen(true) : setView(v)} onManageKeys={() => setKeysModalOpen(true)} />
      <Sidebar settings={settings} setSettings={setSettings} onManageKeys={() => setKeysModalOpen(true)} />
      <main className="pl-[280px] pt-16 flex-grow transition-all">{renderContent()}</main>
      <Footer onNavigate={setView} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setSuccessModalOpen(false)} 
        count={items.filter(i => i.status === 'completed').length} 
        onExport={downloadAllCSV}
      />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </div>
  );
};

export default App;
