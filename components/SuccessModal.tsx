
import React from 'react';
import { X, CheckCircle, Download, Send, Link2, Facebook, Twitter, MessageCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onExport: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, count, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-12 text-center">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle size={48} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">Processing Complete!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">
          CSV Metadata Generated Successfully for <span className="font-black text-slate-800 dark:text-white">{count}</span> files.
        </p>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onExport}
            className="flex-[1.5] py-4 bg-green-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>

        <button className="w-full py-4 border border-green-500/30 text-green-500 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-green-50 transition-all mb-12 shadow-sm">
          <Send size={20} /> Join our Telegram Community
        </button>

        <div className="space-y-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Share this tool</span>
          <div className="flex justify-center gap-4">
            <SocialBtn icon={<Link2 size={20} />} className="bg-slate-100 text-slate-500" />
            <SocialBtn icon={<Facebook size={20} />} className="bg-blue-600 text-white" />
            <SocialBtn icon={<Twitter size={20} />} className="bg-black text-white" />
            <SocialBtn icon={<MessageCircle size={20} />} className="bg-green-500 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialBtn: React.FC<{ icon: React.ReactNode, className: string }> = ({ icon, className }) => (
  <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${className}`}>
    {icon}
  </button>
);

export default SuccessModal;
