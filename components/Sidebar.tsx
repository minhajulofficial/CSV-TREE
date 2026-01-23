
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Zap,
  Key,
  Activity,
  Plus
} from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onManageKeys: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onManageKeys }) => {
  const [expanded, setExpanded] = useState({
    mode: true,
    customization: true,
    settings: true,
    connectivity: true,
    intelligence: true
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

      {/* Intelligence Settings */}
      <div className="mb-12">
         <header 
          onClick={() => toggleSection('intelligence')}
          className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-6 cursor-pointer hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md transition-colors ${expanded.intelligence ? 'bg-primary/10 text-primary' : ''}`}>
              {expanded.intelligence ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            Intelligence
          </div>
          <Activity size={14} className="opacity-40" />
        </header>
        {expanded.intelligence && (
          <div className="space-y-6 px-1">
             <div className="bg-bgMain p-4 rounded-2xl border border-borderMain shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-textDim uppercase tracking-widest">Temperature</span>
                  <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded">0.15</span>
                </div>
                <input type="range" min="0" max="100" defaultValue="15" className="w-full h-1.5 cursor-pointer appearance-none bg-borderMain rounded-full" />
                <p className="text-[8px] text-textDim font-bold uppercase mt-3 opacity-60 leading-relaxed italic">Lower values provide more consistent microstock results.</p>
             </div>
          </div>
        )}
      </div>

      {/* Connectivity Status (Manage Keys Trigger) */}
      <div className="mb-12">
        <header 
          onClick={() => toggleSection('connectivity')}
          className="flex items-center justify-between w-full text-[10px] font-black text-textDim uppercase tracking-[0.3em] mb-4 cursor-pointer hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md transition-colors ${expanded.connectivity ? 'bg-primary/10 text-primary' : ''}`}>
              {expanded.connectivity ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            AI Connectivity
          </div>
          <Key size={14} className="opacity-40" />
        </header>
        {expanded.connectivity && (
          <div className="px-1 space-y-3">
            <button 
              onClick={onManageKeys}
              className="w-full bg-white dark:bg-white/5 border border-borderMain rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-all group"
            >
               <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><Key size={14} /></div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-textMain uppercase tracking-widest">Manage Keys</p>
                    <p className="text-[8px] text-textDim font-bold uppercase">Configure custom APIs</p>
                  </div>
               </div>
               <Plus size={14} className="text-textDim opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">Engine Ready</p>
                  <p className="text-[8px] text-textDim font-bold uppercase">Cloud cluster active</p>
               </div>
            </div>
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
    </aside>
  );
};

const ModeButton: React.FC<{ label: string, icon: React.ReactNode, active: boolean, onClick: () => void, description: string }> = ({ label, icon, active, onClick, description }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col gap-1 w-full px-5 py-5 rounded-[1.25rem] text-left transition-all duration-300 border-2 active:scale-95 ${active ? 'bg-primary/5 text-primary border-primary/30 shadow-[0_10px_20px_-5px_rgba(0,212,255,0.1)] scale-[1.02]' : 'text-textDim hover:text-textMain hover:bg-bgMain border-transparent'}`}
  >
    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em]">
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary text-white' : 'bg-bgMain text-textDim'}`}>
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

export default Sidebar;
