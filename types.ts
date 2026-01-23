
export type Platform = 'General' | 'AdobeStock' | 'Freepik' | 'Shutterstock' | 'Vecteezy' | 'Depositphotos' | '123RF' | 'Dreamstime';

export type FileType = 'Images' | 'Vectors' | 'Videos';

export type AIEngine = 'Gemini' | 'Groq';

export interface UserProfile {
  credits: number;
  maxCredits: number;
  tier: 'Free' | 'Premium';
  // API keys are strictly managed via environment variables and not stored in user profiles
  lastResetDate?: string; // ISO string
}

export interface AppSettings {
  mode: 'Metadata' | 'ImageToPrompt';
  engine: AIEngine;
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
