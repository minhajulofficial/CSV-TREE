
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Zap,
  Layout,
  Cpu,
  Target,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings }) => {
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState({
    engine: true,
    mode: true,
    customization: true,
    settings: true
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isExtractionMode = settings.mode === 'Metadata';

  return (
    <aside className="w-[280px] fixed left-0 top-16 bottom-0 bg-bgSidebar border-r border-borderMain overflow-y-auto px-6 py-10 z-40 select-none no-scrollbar transition-all duration-300 shadow-2xl">
      
      {/* Engine Selection */}
      <div className="mb-10 group">
        <header 
          onClick={() => toggleSection('engine')}
          className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-5 cursor-pointer hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md transition-colors ${expanded.engine ? 'bg-primary/10 text-primary' : ''}`}>
              {expanded.engine ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            AI Engine
          </div>
          <Cpu size={14} className="opacity-40 group-hover:rotate-12 transition-transform" />
        </header>
        {expanded.engine && (
          <div className="flex bg-bgMain border border-borderMain p-1.5 rounded-2xl gap-1 shadow-inner relative">
            <button 
              onClick={() => updateSetting('engine', 'Gemini')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[0.85rem] transition-all ${settings.engine === 'Gemini' ? 'bg-primary text-[#0a0c10] shadow-lg scale-[1.02]' : 'text-textDim hover:text-textMain'}`}
            >
              Gemini
            </button>
            <button 
              onClick={() => updateSetting('engine', 'Groq')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[0.85rem] transition-all relative ${settings.engine === 'Groq' ? 'bg-accent text-white shadow-lg scale-[1.02]' : 'text-textDim hover:text-textMain'}`}
            >
              Groq
            </button>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="mb-12">
        <header 
          onClick={() => toggleSection('mode')}
          className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-6 cursor-pointer hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md transition-colors ${expanded.mode ? 'bg-primary/10 text-primary' : ''}`}>
              {expanded.mode ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            Mode Selection
          </div>
          <Zap size={14} className="opacity-40" />
        </header>
        {expanded.mode && (
          <div className="space-y-3">
            <ModeButton 
              label="Metadata Pro" 
              icon={<Sparkles size={18} />} 
              active={settings.mode === 'Metadata'} 
              onClick={() => updateSetting('mode', 'Metadata')} 
              description="Batch SEO extraction"
            />
            <ModeButton 
              label="Prompt Engineer" 
              icon={<ImageIcon size={18} />} 
              active={settings.mode === 'ImageToPrompt'} 
              onClick={() => updateSetting('mode', 'ImageToPrompt')} 
              description="Reverse generation"
            />
          </div>
        )}
      </div>

      {/* Metadata Customization */}
      {isExtractionMode && (
        <div className="mb-12">
          <header 
            onClick={() => toggleSection('customization')}
            className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-8 cursor-pointer hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md transition-colors ${expanded.customization ? 'bg-primary/10 text-primary' : ''}`}>
                {expanded.customization ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              Output Rules
            </div>
            <Sliders size={14} className="opacity-40" />
          </header>
          {expanded.customization && (
            <div className="space-y-8 px-1">
              <SidebarSlider label="Title Length" min={settings.minTitle} max={settings.maxTitle} limit={50} 
                onMinChange={(v) => updateSetting('minTitle', v)} 
                onMaxChange={(v) => updateSetting('maxTitle', v)} 
              />
              <SidebarSlider label="Tags Amount" min={settings.minKeywords} max={settings.maxKeywords} limit={100} 
                onMinChange={(v) => updateSetting('minKeywords', v)} 
                onMaxChange={(v) => updateSetting('maxKeywords', v)} 
              />
              <SidebarSlider label="Analysis Deepness" min={settings.minDesc} max={settings.maxDesc} limit={100} 
                onMinChange={(v) => updateSetting('minDesc', v)} 
                onMaxChange={(v) => updateSetting('maxDesc', v)} 
              />
            </div>
          )}
        </div>
      )}

      {/* AI Preferences */}
      {isExtractionMode && (
        <div className="mb-10">
          <header 
            onClick={() => toggleSection('settings')}
            className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-6 cursor-pointer hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md transition-colors ${expanded.settings ? 'bg-primary/10 text-primary' : ''}`}>
                {expanded.settings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              AI Constraints
            </div>
            <Target size={14} className="opacity-40" />
          </header>
          {expanded.settings && (
            <div className="space-y-5 bg-bgMain p-4 rounded-2xl border border-borderMain shadow-inner">
              <SidebarToggle label="Single Keywords" active={settings.singleWordKeywords} onToggle={() => updateSetting('singleWordKeywords', !settings.singleWordKeywords)} />
              <SidebarToggle label="Style Silhouette" active={settings.silhouette} onToggle={() => updateSetting('silhouette', !settings.silhouette)} />
              <SidebarToggle label="Isolated Only" active={settings.transparentBackground} onToggle={() => updateSetting('transparentBackground', !settings.transparentBackground)} />
              <SidebarToggle label="Safe Words" active={settings.prohibitedWords} onToggle={() => updateSetting('prohibitedWords', !settings.prohibitedWords)} />
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

const ModeButton: React.FC<{ label: string, icon: React.ReactNode, active: boolean, onClick: () => void, description: string }> = ({ label, icon, active, onClick, description }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col gap-1 w-full px-5 py-5 rounded-[1.25rem] text-left transition-all duration-300 border-2 active:scale-95 ${active ? 'bg-primary/5 text-primary border-primary/30 shadow-[0_10px_20px_-5px_rgba(0,212,255,0.1)] scale-[1.02]' : 'text-textDim hover:text-textMain hover:bg-bgMain border-transparent'}`}
  >
    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em]">
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary text-[#0a0c10]' : 'bg-bgMain text-textDim'}`}>
        {icon}
      </div>
      {label}
    </div>
    <span className="text-[9px] font-bold opacity-60 ml-12 tracking-tight uppercase">{description}</span>
  </button>
);

const SidebarSlider: React.FC<{ label: string, min: number, max: number, limit: number, onMinChange: (v: number) => void, onMaxChange: (v: number) => void }> = ({ label, min, max, limit, onMinChange, onMaxChange }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-1">
      <span className="text-[9px] font-black text-textDim uppercase tracking-[0.2em]">{label}</span>
      <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-lg tabular-nums transition-all hover:scale-110">{min} — {max}</span>
    </div>
    <div className="space-y-4 group">
      <div className="relative h-1.5 w-full bg-borderMain rounded-full overflow-hidden">
        <div className="absolute top-0 bottom-0 bg-primary/30 transition-all duration-300" style={{ left: `${(min/limit)*100}%`, right: `${100 - (max/limit)*100}%` }} />
      </div>
      <input type="range" min="0" max={limit} value={min} onChange={(e) => onMinChange(parseInt(e.target.value))} className="w-full h-1.5 cursor-pointer appearance-none bg-transparent -mt-5.5 relative z-10" />
      <input type="range" min="0" max={limit} value={max} onChange={(e) => onMaxChange(parseInt(e.target.value))} className="w-full h-1.5 cursor-pointer appearance-none bg-transparent -mt-5.5 relative z-10" />
    </div>
  </div>
);

const SidebarToggle: React.FC<{ label: string, active: boolean, onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div className="flex items-center justify-between group">
    <span className="text-[9px] font-black text-textDim tracking-[0.1em] group-hover:text-textMain transition-colors uppercase">{label}</span>
    <button 
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none border-2 active:scale-95 ${active ? 'bg-primary border-primary shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'bg-bgMain border-borderMain'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${active ? 'translate-x-5' : 'translate-x-0 opacity-40'}`} />
    </button>
  </div>
);

export default Sidebar;
