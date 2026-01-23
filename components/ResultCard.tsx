
import React, { useState } from 'react';
import { Copy, Trash2, CheckCircle, FileText, ChevronDown, Sparkles, Tag, Layers } from 'lucide-react';
import { ExtractedMetadata } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResultCardProps {
  item: ExtractedMetadata;
  onRegenerate: () => void;
  onDelete: () => void;
  onUpdate: (id: string, updates: Partial<ExtractedMetadata>) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ item, onDelete, onUpdate }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { profile } = useAuth();
  const isPremium = profile?.tier === 'Premium';

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-500',
    processing: 'bg-amber-100 text-amber-600',
    completed: isPremium ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600'
  };

  const fileType = (item.fileName || "").split('.').pop()?.toUpperCase() || "ASSET";

  return (
    <div className={`bg-white dark:bg-surface border rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300 group ${isPremium ? 'border-primary/20 shadow-primary/5' : 'border-borderMain'}`}>
      {/* Thumbnail Area */}
      <div className={`w-full md:w-72 bg-slate-50 dark:bg-black/20 p-6 flex flex-col gap-4 relative border-b md:border-b-0 md:border-r ${isPremium ? 'border-primary/10' : 'border-borderMain'}`}>
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider z-10 shadow-sm ${statusColors[item.status]}`}>
          {item.status}
        </div>
        
        {isPremium && item.status === 'completed' && (
          <div className="absolute top-4 right-4 text-primary animate-pulse"><Sparkles size={14} /></div>
        )}

        <div className="flex-1 min-h-[160px] flex items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-borderMain/50 shadow-sm p-4 group-hover:scale-[1.02] transition-transform">
          <img 
            src={item.thumbnail} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain" 
          />
        </div>
        
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fileType}</span>
          {item.engine && <span className="text-[9px] font-black text-primary/60 uppercase">{item.engine} Engine</span>}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">{item.fileName || 'Untitled Asset'}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Asset Verified • High Fidelity</p>
          </div>
          <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
            <div className="flex items-center gap-2"><FileText size={12}/> Title</div>
          </div>
          <div className="relative">
            <textarea
              value={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              placeholder={item.status === 'processing' ? "Analyzing visual context..." : "System awaiting data..."}
              className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none h-20 text-slate-700 dark:text-slate-200"
            />
            <div className="absolute bottom-4 right-4">
              <button 
                onClick={() => copyToClipboard(item.title || '', 'title')} 
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${copiedField === 'title' ? 'text-green-500' : 'text-primary hover:opacity-70'}`}
              >
                {copiedField === 'title' ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copiedField === 'title' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Field - Switched to flexible input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
              <div className="flex items-center gap-2"><Layers size={12}/> Categories</div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={(item.categories || []).join(', ')}
                onChange={(e) => onUpdate(item.id, { categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })}
                placeholder="Comma separated categories..."
                className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 dark:text-slate-200"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button 
                  onClick={() => copyToClipboard((item.categories || []).join(', '), 'categories')} 
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${copiedField === 'categories' ? 'text-green-500' : 'text-primary hover:opacity-70'}`}
                >
                  {copiedField === 'categories' ? <CheckCircle size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* Keywords Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
              <div className="flex items-center gap-2"><Tag size={12}/> Keywords Cluster</div>
            </div>
            <div className="relative">
              <textarea
                value={(item.keywords || []).join(', ')}
                onChange={(e) => onUpdate(item.id, { keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                placeholder="Comma separated tags..."
                className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none h-20 text-slate-700 dark:text-slate-200"
              />
              <div className="absolute bottom-4 right-4">
                <button 
                  onClick={() => copyToClipboard((item.keywords || []).join(', '), 'keywords')} 
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${copiedField === 'keywords' ? 'text-green-500' : 'text-primary hover:opacity-70'}`}
                >
                  {copiedField === 'keywords' ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copiedField === 'keywords' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
            <span>Visual Description</span>
          </div>
          <div className="relative">
            <textarea
              value={item.description || ''}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              className="w-full bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none h-24 text-slate-700 dark:text-slate-200"
              placeholder="Detailed asset summary..."
            />
            <div className="absolute bottom-4 right-4">
              <button 
                onClick={() => copyToClipboard(item.description || '', 'desc')} 
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${copiedField === 'desc' ? 'text-green-500' : 'text-primary hover:opacity-70'}`}
              >
                {copiedField === 'desc' ? <CheckCircle size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
