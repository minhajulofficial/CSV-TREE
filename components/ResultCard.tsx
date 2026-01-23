
import React, { useState } from 'react';
import { Copy, Download, CheckCircle, Loader2, Sparkles, FileText, Cpu, Trash2 } from 'lucide-react';
import { ExtractedMetadata } from '../types';

interface ResultCardProps {
  item: ExtractedMetadata;
  onRegenerate: () => void;
  onDelete: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ item, onDelete }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadCSV = () => {
    const isPrompt = !!item.prompt;
    const headers = isPrompt ? ['Filename', 'Prompt'] : ['Filename', 'Title', 'Keywords', 'Category', 'Description'];
    const row = isPrompt
      ? [item.fileName, item.prompt]
      : [item.fileName, item.title || '', (item.keywords || []).join(', '), (item.categories || []).join(', '), item.description || ''];

    const csvContent = "data:text/csv;charset=utf-8," + [headers, row].map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `CSV_TREE_${item.fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (item.status === 'processing' || item.status === 'pending') {
    return (
      <div className="bg-surface border border-borderMain rounded-[2rem] p-12 flex items-center justify-center min-h-[500px] animate-pulse">
        <div className="flex flex-col items-center gap-6 text-center">
          <Loader2 className={`animate-spin ${item.engine === 'Groq' ? 'text-accent' : 'text-primary'}`} size={48} />
          <div className="space-y-2">
            <p className="text-textMain text-lg font-bold tracking-tight">Processing {item.fileName}</p>
            <p className="text-textDim text-[10px] uppercase tracking-[0.3em] font-black">{item.engine} Engine Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-borderMain rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row min-h-[600px] shadow-xl hover:shadow-2xl transition-all duration-500 group fade-up">
      {/* Left Panel: Preview */}
      <div className="w-full lg:w-[42%] border-r border-borderMain p-10 flex flex-col gap-8 bg-bgSidebar/20">
        <div className="flex items-center justify-between">
          <h4 className="text-primary text-xs font-black uppercase tracking-[0.2em]">Visual Input</h4>
          <button onClick={onDelete} className="p-2 text-textDim hover:text-accent transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex-1 bg-bgMain rounded-[2rem] flex items-center justify-center p-8 overflow-hidden relative shadow-inner border border-borderMain">
          <img 
            src={item.thumbnail} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]" 
          />
        </div>
        <div className="flex items-center gap-2">
           <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.engine === 'Groq' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
             <Cpu size={12} className="inline mr-2" /> {item.engine} Output
           </div>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 p-10 flex flex-col gap-8 bg-surface">
        <div className="flex justify-between items-start">
          <h4 className="text-primary text-xs font-black uppercase tracking-[0.2em]">Generated Output</h4>
          <button 
            onClick={downloadCSV}
            className="bg-primary text-[#0a0c10] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto no-scrollbar pr-2 pb-4">
          {item.prompt ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-textDim text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} /> AI Optimized Prompt
                </span>
                <button onClick={() => copyToClipboard(item.prompt || '', 'prompt')} className="text-textDim hover:text-primary transition-all">
                  {copiedField === 'prompt' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="bg-bgMain border border-borderMain rounded-2xl p-6 shadow-inner">
                <p className="text-textMain text-sm font-medium leading-relaxed italic">"{item.prompt}"</p>
              </div>
            </div>
          ) : (
            <>
              <MetadataItem label="Target Title" value={item.title || ''} onCopy={() => copyToClipboard(item.title || '', 'title')} isCopied={copiedField === 'title'} />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-textDim text-[10px] font-black uppercase tracking-widest">SEO Keywords</span>
                  <button onClick={() => copyToClipboard((item.keywords || []).join(', '), 'keywords')} className="text-textDim hover:text-primary transition-all">
                    {copiedField === 'keywords' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(item.keywords || []).map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all cursor-default">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-textDim text-[10px] font-black uppercase tracking-widest">Classification</span>
                  <button onClick={() => copyToClipboard((item.categories || []).join(', '), 'categories')} className="text-textDim hover:text-primary transition-all">
                    {copiedField === 'categories' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(item.categories || []).map((cat, i) => (
                    <span key={i} className="px-4 py-1.5 bg-accent/10 text-accent border border-accent/20 text-[10px] font-black uppercase rounded-lg">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-borderMain space-y-2">
                 <span className="text-textDim text-[9px] font-black uppercase tracking-widest">Analysis Summary</span>
                 <p className="text-textDim text-xs leading-relaxed italic">{item.description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MetadataItem: React.FC<{ label: string, value: string, onCopy: () => void, isCopied: boolean }> = ({ label, value, onCopy, isCopied }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-textDim text-[10px] font-black uppercase tracking-widest">{label}</span>
      <button onClick={onCopy} className="text-textDim hover:text-primary transition-all">
        {isCopied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </div>
    <div className="bg-bgMain border border-borderMain rounded-xl p-4 shadow-inner">
      <p className="text-textMain text-sm font-bold leading-relaxed">{value}</p>
    </div>
  </div>
);

export default ResultCard;
