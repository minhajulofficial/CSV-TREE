
import React, { useState } from 'react';
import { Copy, Trash2, CheckCircle, FileText, ChevronDown } from 'lucide-react';
import { ExtractedMetadata } from '../types';

interface ResultCardProps {
  item: ExtractedMetadata;
  onRegenerate: () => void;
  onDelete: () => void;
  onUpdate: (id: string, updates: Partial<ExtractedMetadata>) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ item, onDelete, onUpdate }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-500',
    processing: 'bg-amber-100 text-amber-600',
    completed: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600'
  };

  const fileSize = "0.53 MB"; // Mocked for UI parity
  const fileType = item.fileName.split('.').pop()?.toUpperCase() || "IMAGE";

  return (
    <div className="bg-white dark:bg-surface border border-borderMain rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Thumbnail Area */}
      <div className="w-full md:w-72 bg-slate-50 dark:bg-black/20 p-6 flex flex-col gap-4 relative border-r border-borderMain">
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[item.status]}`}>
          {item.status}
        </div>
        <div className="flex-1 min-h-[160px] flex items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-borderMain/50 shadow-sm p-4">
          <img 
            src={item.thumbnail} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain" 
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-md">{item.fileName}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fileSize} • {fileType}</p>
          </div>
          <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span>Title</span>
          </div>
          <div className="relative">
            <textarea
              value={item.title || ''}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              placeholder="Waiting for AI..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-green-500/40 transition-all resize-none h-20 text-slate-700 dark:text-slate-200"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <span className="text-[10px] text-slate-400 font-bold">{(item.title || '').length} chars</span>
              <button 
                onClick={() => copyToClipboard(item.title || '', 'title')} 
                className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest hover:brightness-90"
              >
                {copiedField === 'title' ? <CheckCircle size={12} /> : <Copy size={12} />}
                Copy Title
              </button>
            </div>
          </div>
        </div>

        {/* Category and Keywords Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</span>
            <div className="relative group">
              <select 
                className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-green-500/40 transition-all cursor-pointer"
                value={item.categories?.[0] || ""}
                onChange={(e) => onUpdate(item.id, { categories: [e.target.value] })}
              >
                <option value="">Select Category...</option>
                <option value="Abstract">Abstract</option>
                <option value="Animals">Animals</option>
                <option value="Nature">Nature</option>
                <option value="People">People</option>
                <option value="Business">Business</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Keywords</span>
            <div className="relative">
              <textarea
                value={(item.keywords || []).join(', ')}
                onChange={(e) => onUpdate(item.id, { keywords: e.target.value.split(',').map(k => k.trim()) })}
                placeholder="Waiting for AI..."
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-green-500/40 transition-all resize-none h-20 text-slate-700 dark:text-slate-200"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <span className="text-[10px] text-slate-400 font-bold">Found {(item.keywords || []).length} keywords</span>
                <button 
                  onClick={() => copyToClipboard((item.keywords || []).join(', '), 'keywords')} 
                  className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest hover:brightness-90"
                >
                  {copiedField === 'keywords' ? <CheckCircle size={12} /> : <Copy size={12} />}
                  Copy Keywords
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
