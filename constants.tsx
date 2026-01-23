
import React from 'react';
import { 
  Globe, 
  Camera, 
  Crown, 
  Diamond, 
  Hexagon, 
  Circle,
  Image as ImageIcon,
  PenTool,
  Video
} from 'lucide-react';
import { Platform, AppSettings } from './types';

export const PLATFORMS: { id: Platform, label: string, icon: React.ReactNode, color: string }[] = [
  { id: 'General', label: 'General', icon: <Globe size={14} />, color: 'bg-slate-700' },
  { id: 'AdobeStock', label: 'AdobeStock', icon: <PenTool size={14} />, color: 'bg-[#fa0f00]' },
  { id: 'Freepik', label: 'Freepik', icon: <Crown size={14} />, color: 'bg-[#0055ff]' },
  { id: 'Shutterstock', label: 'Shutterstock', icon: <Camera size={14} />, color: 'bg-[#e02020]' },
  { id: 'Vecteezy', label: 'Vecteezy', icon: <Diamond size={14} />, color: 'bg-[#ff7b00]' },
  { id: 'Depositphotos', label: 'Depositphotos', icon: <Diamond size={14} />, color: 'bg-[#009dff]' },
  { id: '123RF', label: '123RF', icon: <Hexagon size={14} />, color: 'bg-[#ffc107] !text-[#000]' },
  { id: 'Dreamstime', label: 'Dreamstime', icon: <Circle size={14} />, color: 'bg-[#00d084]' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  mode: 'Metadata',
  engine: 'Gemini',
  minTitle: 8,
  maxTitle: 22,
  minKeywords: 43,
  maxKeywords: 48,
  minDesc: 12,
  maxDesc: 30,
  singleWordKeywords: true,
  silhouette: true,
  customPrompt: true,
  transparentBackground: true,
  prohibitedWords: true,
  platform: 'AdobeStock',
  fileType: 'Images',
};
