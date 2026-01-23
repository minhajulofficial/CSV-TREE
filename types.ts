export type Platform = 'General' | 'AdobeStock' | 'Freepik' | 'Shutterstock' | 'Vecteezy' | 'Depositphotos' | '123RF' | 'Dreamstime';
export type FileType = 'Images' | 'Vectors' | 'Videos';
export type AIEngine = 'Gemini' | 'Groq';
export type AppView = 'Home' | 'Admin' | 'About' | 'Pricing' | 'Tutorials' | 'Privacy' | 'Terms' | 'Support' | 'Status';

export interface APIKeyRecord {
  id: string;
  label: string;
  key: string;
  provider: 'Gemini' | 'Groq';
  createdAt: string;
}

export interface AdEntry {
  image: string;
  link: string;
  label: string;
}

export interface NotificationEntry {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export interface TutorialStepEntry {
  id: string;
  title: string;
  text: string;
}

export interface SystemConfig {
  developer: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    github?: string;
    portfolio?: string;
  };
  ads: {
    enabled: boolean;
    visibility: 'Free' | 'All';
    list: AdEntry[];
    externalScript?: string;
  };
  notifications: {
    list: NotificationEntry[];
  };
  tutorial: {
    steps: TutorialStepEntry[];
  };
  dailyPopup: {
    enabled: boolean;
    title: string;
    content: string;
    buttonText: string;
    buttonLink: string;
  };
  site: {
    footerCredit: string;
    socials: {
      facebook: string;
      twitter: string;
      instagram: string;
      youtube: string;
    };
    status: string;
    version: string;
  };
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