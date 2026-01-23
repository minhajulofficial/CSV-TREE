
import React, { useState, useEffect } from 'react';
import { Upload, Download, ChevronRight, X, Layers, Cpu, Sparkles, ArrowLeft } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PlatformPills from './components/PlatformPills';
import ResultCard from './components/ResultCard';
import AdminView from './components/AdminView';
import ManageKeysModal from './components/ManageKeysModal';
import { DEFAULT_SETTINGS } from './constants';
import { AppSettings, ExtractedMetadata, FileType, AppView } from './types';
import { processImageWithGemini } from './services/geminiService';
import { processImageWithGroq } from './services/groqService';
import { useAuth } from './contexts/AuthContext';
import { rtdb, ref, onValue, set, remove, push, update } from './services/firebase';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('Home');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<ExtractedMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeysModalOpen, setKeysModalOpen] = useState(false);
  const { user, profile, deductCredit, setAuthModalOpen } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('csv-tree-settings');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Clean up any legacy engine settings
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
    }, (error) => {
      console.error("Metadata Sync Failure:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const processFile = async (file: File) => {
    const reader = new FileReader();
    return new Promise<ExtractedMetadata>((resolve) => {
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        resolve({
          id: '',
          thumbnail: base64,
          status: 'pending',
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    if (profile && profile.credits < files.length) {
      alert(`Insufficient Credits. Required: ${files.length}, Available: ${profile.credits}`);
      return;
    }

    const batch: ExtractedMetadata[] = [];
    for (const file of files) { 
      try {
        const item = await processFile(file);
        const newRef = push(ref(rtdb, `metadata/${user.uid}`));
        item.id = newRef.key || Math.random().toString();
        await set(newRef, item);
        batch.push(item);
      } catch (err) {
        console.error("File Prep Error:", err);
      }
    }
    processBatch(batch);
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
        // Intelligence: Automate Engine Detection
        const geminiKey = Object.values(profile?.apiKeys || {}).find(k => k.provider === 'Gemini')?.key;
        const groqKey = Object.values(profile?.apiKeys || {}).find(k => k.provider === 'Groq')?.key;

        let result;
        let detectedEngine: 'Gemini' | 'Groq' = 'Gemini';

        // Preference: If user has their own Gemini key, use it.
        // If not, but they have a Groq key, use Groq.
        // Else fallback to Gemini (with system key if available).
        if (geminiKey) {
          result = await processImageWithGemini(item.thumbnail, settings, profile?.apiKeys);
          detectedEngine = 'Gemini';
        } else if (groqKey) {
          result = await processImageWithGroq(item.thumbnail, settings, groqKey);
          detectedEngine = 'Groq';
        } else {
          result = await processImageWithGemini(item.thumbnail, settings, profile?.apiKeys);
          detectedEngine = 'Gemini';
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
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (!user) { setAuthModalOpen(true); return; }
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      const batch: ExtractedMetadata[] = [];
      for (const file of files) { 
        const item = await processFile(file);
        const newRef = push(ref(rtdb, `metadata/${user.uid}`));
        item.id = newRef.key || '';
        await set(newRef, item);
        batch.push(item);
      }
      processBatch(batch);
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

  if (view === 'Admin') return <AdminView onBack={() => setView('Home')} />;

  const renderContent = () => {
    if (view === 'Home') {
      return (
        <div className="max-w-6xl mx-auto px-10 py-16">
          <PlatformPills selected={settings.platform} onSelect={(p) => setSettings(s => ({ ...s, platform: p }))} />
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
            onDragLeave={() => setIsDragging(false)} 
            onDrop={handleDrop} 
            className={`group relative rounded-[3rem] p-24 flex flex-col items-center justify-center gap-14 transition-all duration-700 ${isDragging ? 'bg-primary/10 border-primary/50 scale-[1.02]' : 'bg-surface border-white/5 shadow-2xl'} border-2 border-dashed overflow-hidden`}
          >
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/10 blur-[150px] rounded-full opacity-30" />
            <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-accent/10 blur-[150px] rounded-full opacity-30" />
            
            <div className={`w-36 h-36 rounded-[3rem] flex items-center justify-center transition-all duration-500 glass-panel shadow-2xl relative z-10 border-white/10 ${isDragging ? 'bg-primary text-white scale-110 -rotate-12' : 'text-primary group-hover:scale-110 group-hover:rotate-6 bg-primary/5'}`}>
              <Upload size={54} strokeWidth={1.5} />
            </div>

            <div className="text-center space-y-10 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                   <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all bg-primary/10 text-primary border border-primary/20`}>
                      <Sparkles size={12} className="animate-pulse" /> Global AI Pulse Active
                   </div>
                </div>
                <h1 className="text-7xl font-black tracking-tighter text-textMain drop-shadow-2xl uppercase italic leading-none">
                   {settings.mode === 'Metadata' ? 'Metadata Vision' : 'Prompt Engineer'}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-5">
                {(['Images', 'Vectors', 'Videos'] as FileType[]).map(type => (
                  <button 
                    key={type} 
                    onClick={() => setSettings(s => ({ ...s, fileType: type }))} 
                    className={`px-12 py-4 rounded-2xl text-[10px] font-black transition-all border-2 uppercase tracking-[0.3em] active:scale-95 ${settings.fileType === type ? `bg-primary text-white border-transparent shadow-2xl scale-110` : 'border-borderMain bg-white dark:bg-bgSidebar text-textDim hover:text-primary hover:border-primary/20'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <label className={`group/btn relative px-16 py-6 rounded-2xl font-black cursor-pointer transition-all duration-500 shadow-xl inline-flex items-center gap-5 overflow-hidden bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95`}>
                  <span className="relative z-10 tracking-[0.3em] uppercase text-xs">Initialize Batch</span>
                  <ChevronRight size={20} strokeWidth={4} className="relative z-10 group-hover/btn:translate-x-1.5 transition-transform" />
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-28 space-y-16 animate-in fade-in duration-1000">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-borderMain pb-12">
                <div className="space-y-3">
                   <h2 className="text-4xl font-black italic tracking-tighter text-textMain uppercase">Production Queue</h2>
                   <div className="flex items-center gap-3 text-textDim text-[10px] font-black uppercase tracking-widest opacity-60">
                     <Layers size={14} className="text-primary" /> 
                     <span>Synced {items.length} Units from Cloud</span>
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 bg-surface p-4 rounded-3xl border border-borderMain shadow-2xl">
                   <button onClick={downloadAllCSV} className="flex items-center gap-3 text-[10px] font-black text-white bg-primary px-10 py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                      <Download size={18} /> Bulk Export
                   </button>
                   <button onClick={() => user && remove(ref(rtdb, `metadata/${user.uid}`))} className="flex items-center gap-3 text-[10px] font-black text-textMain bg-bgMain border border-borderMain px-8 py-4 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 active:scale-95 transition-all uppercase tracking-[0.2em]">
                      <X size={18} /> Purge Queue
                   </button>
                </div>
              </div>
              <div className="space-y-16">
                {items.map(item => <ResultCard key={item.id} item={item} onRegenerate={() => processBatch([item])} onDelete={() => user && remove(ref(rtdb, `metadata/${user.uid}/${item.id}`))} />)}
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-10 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-4">
        <button onClick={() => setView('Home')} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:gap-3 transition-all"><ArrowLeft size={16} /> Return Home</button>
        <div className="space-y-4">
          <h1 className="text-6xl font-black italic tracking-tight uppercase leading-none">{view}</h1>
          <div className="h-2 w-24 bg-primary rounded-full" />
        </div>
        <div className="prose dark:prose-invert max-w-none text-textDim font-medium leading-relaxed text-lg italic">
          {view === 'About' && "CSV TREE Pro transforms visual assets into searchable, indexed metadata using high-frequency AI clusters. Our mission is to accelerate creator workflows through intelligence."}
          {view === 'Pricing' && "Free operators receive 100 energy units daily. Premium members gain priority access to our compute clusters with 6,000 units per month and early access to new AI models."}
          {view === 'Tutorials' && "Select your distribution target (e.g., AdobeStock), configure your title and tag length constraints in the sidebar, then drop your media to begin extraction."}
          {(view === 'Privacy' || view === 'Terms') && "Your data remains your property. We operate as a zero-retention bridge between your media and AI engines. All session logs can be purged at any time by the user."}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bgMain text-textMain transition-all duration-300 selection:bg-primary/30 flex flex-col">
      <Navbar onSwitchView={setView} onManageKeys={() => setKeysModalOpen(true)} />
      <Sidebar settings={settings} setSettings={setSettings} onManageKeys={() => setKeysModalOpen(true)} />
      <main className="pl-[280px] pt-16 flex-grow transition-all">{renderContent()}</main>
      <Footer onNavigate={setView} />
      <ManageKeysModal isOpen={isKeysModalOpen} onClose={() => setKeysModalOpen(false)} />
    </div>
  );
};

export default App;
