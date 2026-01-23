
import React from 'react';
import { X, Play, ShieldCheck, Sparkles, Upload, FileText, Download, CheckCircle2 } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0a180e] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 rounded-full z-20">
          <X size={20} />
        </button>

        <div className="p-12 md:p-16 relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-2">
              <Play size={10} fill="currentColor" /> Mastery Guide
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">How to extract Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TutorialStep 
              number="01" 
              icon={<Upload size={24} />} 
              title="Upload Assets" 
              text="Drag and drop your Images, Vectors (SVG, AI, EPS), or Videos (MP4, MOV) into the central hub."
            />
            <TutorialStep 
              number="02" 
              icon={<ShieldCheck size={24} />} 
              title="Target Sync" 
              text="Select your distribution platform (AdobeStock, Freepik, etc.) to optimize SEO for their specific algorithms."
            />
            <TutorialStep 
              number="03" 
              icon={<Sparkles size={24} />} 
              title="AI Processing" 
              text="Initialize the batch. Our Vision clusters analyze subject matter, color theory, and composition."
            />
            <TutorialStep 
              number="04" 
              icon={<FileText size={24} />} 
              title="Review & Export" 
              text="Fine-tune titles and keywords in the production queue, then export everything as a high-fidelity CSV."
            />
          </div>

          <div className="p-8 bg-green-500/5 border border-green-500/10 rounded-3xl space-y-4">
             <div className="flex items-center gap-3 text-green-500 font-black uppercase text-[10px] tracking-widest">
                <CheckCircle2 size={16} /> Pro Tip
             </div>
             <p className="text-sm text-slate-500 dark:text-green-100/60 font-medium leading-relaxed">
               For **Video** and **SVG**, the system automatically extracts optimized visual markers. For **AI** and **EPS** files, ensure they are placed alongside a preview if metadata extraction feels inaccurate. 
             </p>
          </div>

          <button onClick={onClose} className="w-full py-5 bg-green-500 text-[#0a180e] font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             <Download size={18} /> Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

const TutorialStep: React.FC<{ number: string, icon: React.ReactNode, title: string, text: string }> = ({ number, icon, title, text }) => (
  <div className="space-y-4 group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
      <span className="text-[10px] font-black text-slate-300 dark:text-white/10 tabular-nums">STEP {number}</span>
    </div>
    <div className="space-y-2">
      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{title}</h4>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{text}</p>
    </div>
  </div>
);

export default TutorialModal;
