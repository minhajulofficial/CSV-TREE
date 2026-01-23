import React, { useState, useEffect } from 'react';
import { X, Play, ShieldCheck, Sparkles, Upload, FileText, Download, CheckCircle2, Loader2, Info, Diamond, Hexagon, HelpCircle } from 'lucide-react';
import { rtdb, ref, onValue } from '../services/firebase';
import { SystemConfig } from '../types';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    const configRef = ref(rtdb, 'system/config');
    onValue(configRef, (snapshot) => {
      if (snapshot.exists()) setConfig(snapshot.val());
    });
  }, []);

  if (!isOpen) return null;

  const steps = config?.tutorial?.steps || [
    { id: '1', title: "Upload Assets", text: "Drop your Images, SVG, AI, EPS, or Videos (MP4/MOV) into the central cluster hub." },
    { id: '2', title: "Target Sync", text: "Select the platform (e.g. AdobeStock) to align metadata with their specific SEO rules." },
    { id: '3', title: "AI Processing", text: "Our Vision AI analyzes subject, composition, and mood to generate high-fidelity tags." },
    { id: '4', title: "Review & Export", text: "Review the production queue, fine-tune results, and export everything into a ready-to-use CSV." }
  ];

  const getStepIcon = (index: number) => {
    const icons = [<Upload size={20} />, <ShieldCheck size={20} />, <Sparkles size={20} />, <FileText size={20} />, <Diamond size={20} />, <Hexagon size={20} />, <HelpCircle size={20} />];
    return icons[index % icons.length];
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0a180e] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 rounded-full z-20">
          <X size={18} />
        </button>

        <div className="p-10 md:p-12 relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full text-[9px] font-black text-green-500 uppercase tracking-[0.3em] mb-2">
              <Play size={8} fill="currentColor" /> Guide Center
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Extraction Protocol</h2>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <TutorialStep 
                key={step.id}
                number={String(idx + 1).padStart(2, '0')} 
                icon={getStepIcon(idx)} 
                title={step.title} 
                text={step.text} 
              />
            ))}
          </div>

          <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-3xl">
             <div className="flex items-center gap-3 text-green-500 font-black uppercase text-[9px] tracking-widest mb-2">
                <CheckCircle2 size={14} /> Tip
             </div>
             <p className="text-xs text-slate-500 dark:text-green-100/60 font-medium leading-relaxed">
               {config?.site?.footerCredit ? `Mastered by ${config.site.footerCredit}. ` : ''}Process multiple files simultaneously to maximize throughput and save energy.
             </p>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-green-500 text-[#0a180e] font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
             <Download size={16} /> Deploy Vision
          </button>
        </div>
      </div>
    </div>
  );
};

const TutorialStep: React.FC<{ number: string, icon: React.ReactNode, title: string, text: string }> = ({ number, icon, title, text }) => (
  <div className="flex gap-6 group">
    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{title}</h4>
        <span className="text-[8px] font-black text-slate-300 dark:text-white/10 uppercase">#{number}</span>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{text}</p>
    </div>
  </div>
);

export default TutorialModal;