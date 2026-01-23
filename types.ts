
export type Platform = 'General' | 'AdobeStock' | 'Freepik' | 'Shutterstock' | 'Vecteezy' | 'Depositphotos' | '123RF' | 'Dreamstime';
export type FileType = 'Images' | 'Vectors' | 'Videos';
export type AIEngine = 'Gemini' | 'Groq';
export type AppView = 'Home' | 'Admin' | 'About' | 'Pricing' | 'Tutorials' | 'Privacy' | 'Terms';

export interface APIKeyRecord {
  id: string;
  label: string;
  key: string;
  provider: 'Gemini' | 'Groq';
  createdAt: string;
}

export interface UserProfile {
  credits: number;
  maxCredits: number;
  tier: 'Free' | 'Premium';
  email?: string;
  displayName?: string;
  lastResetDate?: string;
  apiKeys?: Record<string, APIKeyRecord>;
}

export interface AppSettings {
  mode: 'Metadata' | 'ImageToPrompt';
  minTitle: number;
  maxTitle: number;
  minKeywords: number;
  maxKeywords: number;
  minDesc: number;
  maxDesc: number;
  singleWordKeywords: boolean;
  silhouette: boolean;
  customPrompt: boolean;
  transparentBackground: boolean;
  prohibitedWords: boolean;
  platform: Platform;
  fileType: FileType;
}

export interface ExtractedMetadata {
  id: string;
  thumbnail: string;
  title?: string;
  keywords?: string[];
  categories?: string[];
  description?: string;
  prompt?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  fileName: string;
  engine?: AIEngine;
}
