
import React from 'react';
import { PLATFORMS } from '../constants';
import { Platform } from '../types';

interface PlatformPillsProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

const PlatformPills: React.FC<PlatformPillsProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full flex flex-col items-center gap-8 mb-16">
      <div className="flex items-center gap-4 w-full">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-borderMain to-transparent opacity-50" />
        <h2 className="text-textDim text-[10px] font-black tracking-[0.4em] uppercase whitespace-nowrap">Target Distribution Platform</h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-borderMain to-transparent opacity-50" />
      </div>
      
      <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar max-w-full px-4 snap-x py-2">
        {PLATFORMS.map((p) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] whitespace-nowrap transition-all duration-300 border-2 snap-center group relative
                ${isActive 
                  ? `${p.color} border-transparent text-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] scale-105 z-10` 
                  : 'border-borderMain bg-white dark:bg-bgSidebar text-textDim hover:border-primary/40 hover:text-textMain hover:-translate-y-1'
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-[1.25rem] bg-white/10 animate-pulse" />
              )}
              <span className={`transition-transform duration-300 ${isActive ? 'scale-125' : 'group-hover:scale-110 opacity-60'}`}>
                {p.icon}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformPills;
