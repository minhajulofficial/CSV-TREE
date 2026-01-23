import React, { useState } from 'react';
import { Copy, Trash2, CheckCircle, FileText, Sparkles, Download } from 'lucide-react';
import { ExtractedMetadata } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResultCardProps {
  item: ExtractedMetadata;
  onRegenerate: () => void;
  onDelete: () => void;
  onUpdate: (id: string, updates: Partial<ExtractedMetadata>) => void;
  onDownloadCSV?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ item, onDelete, onUpdate, onDownloadCSV }) => {
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
    pending: 'text-slate-500',
    processing: 'text-amber-500 animate-pulse',
    completed: 'text-green-500',
    error: 'text-red-500'
  };

  return (
    <div className="bg-[#0a101f] border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl transition-all duration-300 group">
      {/* Left Column: Image Preview */}
      <div className="w-full md:w-[45%] bg-[#0d1526] p-8 flex flex-col gap-6 border-r border-white/5">
        <h2 className="text-amber-500 text-lg font-bold tracking-tight">Image Preview</h2>
        <div className="relative aspect-square md:aspect-auto md:flex-1 flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-inner p-4">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
           <img 
              src={item.thumbnail} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg group-hover:scale-[1.02] transition-transform duration-500" 
           />
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
           <span>Status: <span className={statusColors[item.status]}>{item.status}</span></span>
           <button onClick={onDelete} className="hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Trash2 size={12} /> Remove
           </button>
        </div>
      </div>

      {/* Right Column: Metadata Details */}
      <div className="flex-1 p-8 md:p-10 bg-[#0a101f] space-y-8 relative">
        <div className="flex justify-between items-start mb-2">
           <h2 className="text-amber-500 text-lg font-bold tracking-tight">Generated Metadata</h2>
           {item.status === 'completed' && (
             <button onClick={onDownloadCSV} className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-black px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                <Download size={14} /> Download CSV
             </button>
           )}
        </div>

        {/* Filename */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Filename:</span>
            <button onClick={() => copyToClipboard(item.fileName, 'filename')} className="text-slate-500 hover:text-white transition-colors">
              {copiedField === 'filename' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-slate-200 text-sm font-medium break-all">{item.fileName}</p>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Title:</span>
            <button onClick={() => copyToClipboard(item.title || '', 'title')} className="text-slate-500 hover:text-white transition-colors">
              {copiedField === 'title' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <textarea
            value={item.title || ''}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            placeholder="Awaiting extraction..."
            className="w-full bg-transparent border-none p-0 text-slate-200 text-sm font-medium focus:ring-0 resize-none h-10 scrollbar-hide"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Keywords:</span>
            <button onClick={() => copyToClipboard((item.keywords || []).join(', '), 'keywords')} className="text-slate-500 hover:text-white transition-colors">
              {copiedField === 'keywords' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(item.keywords || []).length > 0 ? (
              (item.keywords || []).map((tag, idx) => (
                <span key={idx} className="bg-[#2563eb] text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-blue-400/20 whitespace-nowrap">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-slate-600 text-[10px] uppercase font-black italic">No tags detected</span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Category:</span>
            <button onClick={() => copyToClipboard((item.categories || []).join(', '), 'category')} className="text-slate-500 hover:text-white transition-colors">
              {copiedField === 'category' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(item.categories || []).length > 0 ? (
              (item.categories || []).map((cat, idx) => (
                <span key={idx} className="bg-[#a855f7] text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-purple-400/20">
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-slate-600 text-[10px] uppercase font-black italic">Uncategorized</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;