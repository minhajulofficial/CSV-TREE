import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Info,
  Settings as SettingsIcon,
  Sparkles,
  Cpu,
  MonitorCheck,
  X
} from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onManageKeys: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onManageKeys, isOpen, onClose }) => {
  const [expanded, setExpanded] = useState({
    mode: true,
    customization: true,
    settings: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isExtractionMode = settings.mode === 'Metadata';

  const sidebarClasses = `
    w-[280px] fixed left-0 top-0 md:top-16 bottom-0 bg-white dark:bg-[#0a180e] 
    border-r border-slate-100 dark:border-white/5 overflow-y-auto px-5 py-8 z-[70] 
    select-none no-scrollbar transition-all duration-300 shadow-xl md:shadow-none
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay for mobile only */}
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] md:hidden" onClick={onClose} />}
      
      <aside className={sidebarClasses}>
        <div className="flex md:hidden items-center justify-between mb-8 pb-4 border-b border-borderMain">
           <div className="text-sm font-black text-primary uppercase tracking-widest">Workspace</div>
           <button onClick={onClose} className="p-2 text-textDim hover:text-accent transition-colors"><X size={20} /></button>
        </div>

        {/* AI Intelligence Mode */}
        <div className="mb-8">
          <header 
            onClick={() => toggleSection('mode')}
            className="flex items-center justify-between w-full text-[11px] font-black text-slate-400 dark:text-textDim uppercase tracking-[0.2em] mb-4 cursor-pointer hover:text-primary transition-colors px-1"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary/60" />
              AI Workflow
            </div>
            {expanded.mode ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </header>
          {expanded.mode && (
            <div className="space-y-2">
              <ModeButton 
                label="Metadata Vision" 
                icon={<Sparkles size={16} />} 
                active={settings.mode === 'Metadata'} 
                onClick={() => updateSetting('mode', 'Metadata')} 
                description="Stock SEO extraction"
              />
              <ModeButton 
                label="Prompt Reverse" 
                icon={<Cpu size={16} />} 
                active={settings.mode === 'ImageToPrompt'} 
                onClick={() => updateSetting('mode', 'ImageToPrompt')} 
                description="Creative engineering"
              />
            </div>
          )}
        </div>

        {/* Metadata Customization Section */}
        {isExtractionMode && (
          <div className="mb-8">
            <header 
              onClick={() => toggleSection('customization')}
              className="flex items-center justify-between w-full text-[11px] font-black text-primary uppercase tracking-tight mb-6 cursor-pointer hover:opacity-80 transition-opacity px-1"
            >
              <div className="flex items-center gap-2">
                Metadata Customization
              </div>
              {expanded.customization ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </header>
            {expanded.customization && (
              <div className="space-y-6 px-1">
                <SidebarSlider label="Min Title Words" value={settings.minTitle} limit={50} onChange={(v) => updateSetting('minTitle', v)} />
                <SidebarSlider label="Max Title Words" value={settings.maxTitle} limit={50} onChange={(v) => updateSetting('maxTitle', v)} />
                <SidebarSlider label="Min Keywords" value={settings.minKeywords} limit={100} onChange={(v) => updateSetting('minKeywords', v)} />
                <SidebarSlider label="Max Keywords" value={settings.maxKeywords} limit={100} onChange={(v) => updateSetting('maxKeywords', v)} />
                <SidebarSlider label="Min Description Words" value={settings.minDesc} limit={100} onChange={(v) => updateSetting('minDesc', v)} />
                <SidebarSlider label="Max Description Words" value={settings.maxDesc} limit={100} onChange={(v) => updateSetting('maxDesc', v)} />
              </div>
            )}
          </div>
        )}

        {/* Settings Section */}
        <div className="mb-10 pt-4 border-t border-slate-100 dark:border-white/5">
          <header 
            onClick={() => toggleSection('settings')}
            className="flex items-center justify-between w-full text-[11px] font-black text-primary uppercase tracking-[0.1em] mb-8 cursor-pointer hover:opacity-80 transition-opacity px-1"
          >
            <div className="flex items-center gap-2 uppercase tracking-widest">
              <SettingsIcon size={16} className="text-primary" />
              Settings
            </div>
            {expanded.settings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </header>
          {expanded.settings && (
            <div className="space-y-6 px-1">
              <SidebarToggle label="Single Word Keywords" checked={settings.singleWordKeywords} onChange={(v) => updateSetting('singleWordKeywords', v)} />
              <SidebarToggle label="Silhouette" checked={settings.silhouette} onChange={(v) => updateSetting('silhouette', v)} />
              <SidebarToggle label="Custom Prompt" checked={settings.customPrompt} onChange={(v) => updateSetting('customPrompt', v)} />
              <SidebarToggle label="Transparent Background" checked={settings.transparentBackground} onChange={(v) => updateSetting('transparentBackground', v)} />
            </div>
          )}
        </div>

        {/* Distribution Target Note */}
        <div className="mt-auto p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
           <div className="flex items-center gap-3 mb-2">
              <MonitorCheck size={14} className="text-primary" />
              <span className="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-widest">{settings.platform} Sync</span>
           </div>
           <p className="text-[8px] font-bold text-slate-400 dark:text-textDim uppercase tracking-widest leading-relaxed italic">
             Optimized for {settings.platform} indexing rules.
           </p>
        </div>
      </aside>
    </>
  );
};

const ModeButton: React.FC<{ label: string, icon: React.ReactNode, active: boolean, onClick: () => void, description: string }> = ({ label, icon, active, onClick, description }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col gap-1 w-full px-4 py-3.5 rounded-xl text-left transition-all duration-300 border active:scale-95 ${active ? 'bg-green-500/5 border-green-500/20 text-green-600 shadow-sm' : 'text-slate-400 dark:text-textDim hover:text-slate-800 dark:hover:text-textMain hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
  >
    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
      <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
        {icon}
      </div>
      {label}
    </div>
    <span className="text-[8px] font-bold opacity-60 ml-9 tracking-tight uppercase leading-none">{description}</span>
  </button>
);

const SidebarSlider: React.FC<{ label: string, value: number, limit: number, onChange: (v: number) => void }> = ({ label, value, limit, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5 group cursor-help">
        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{label}</span>
        <Info size={12} className="text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="text-[12px] font-black text-slate-800 dark:text-white tabular-nums">{value}</span>
    </div>
    <div className="relative flex items-center h-4">
      <input type="range" min="0" max={limit} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1 cursor-pointer appearance-none bg-slate-100 dark:bg-white/10 rounded-full accent-primary hover:accent-primary/80 transition-all z-10" />
    </div>
  </div>
);

const SidebarToggle: React.FC<{ label: string, checked: boolean, onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between px-1 py-1">
    <div className="flex items-center gap-2 group cursor-help">
      <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{label}</span>
      <Info size={12} className="text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
    <button onClick={() => onChange(!checked)} className={`relative w-11 h-5.5 rounded-full transition-all duration-300 outline-none ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5.5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default Sidebar;