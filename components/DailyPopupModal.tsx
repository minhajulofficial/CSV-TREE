import React from 'react';
import { X, ExternalLink, Sparkles, Send } from 'lucide-react';

interface DailyPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
}

const DailyPopupModal: React.FC<DailyPopupModalProps> = ({ isOpen, onClose, title, content, buttonText, buttonLink }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0a180e] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-green-500/20">
        {/* Animated background element */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
        
        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-full z-20">
          <X size={20} />
        </button>

        <div className="p-12 md:p-14 relative z-10 text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <Sparkles size={40} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight">
              {title || "Special Alert"}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {content || "Stay tuned for the latest updates and network improvements."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href={buttonLink || "#"} 
              target="_blank" 
              onClick={onClose}
              className="w-full py-5 bg-primary text-[#0a180e] font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.5rem] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {buttonText || "Execute"} <ExternalLink size={16} />
            </a>
            <button 
              onClick={onClose}
              className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors py-2"
            >
              Acknowledge & Dismiss
            </button>
          </div>
          
          <div className="pt-4 flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 dark:text-white/5 uppercase tracking-[0.4em]">
             <Send size={10} /> Transmission Received
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPopupModal;