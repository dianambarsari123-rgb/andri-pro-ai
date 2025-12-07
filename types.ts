import React from 'react';

// Define the props type locally to ensure React types are resolved correctly from the import
type DotLottieWCProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  mode?: string;
  style?: React.CSSProperties;
}, HTMLElement>;

// Add support for custom web components in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': DotLottieWCProps;
    }
  }
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PORTRAIT_4_5 = '4:5', // Instagram Portrait
  LANDSCAPE_5_4 = '5:4' // Standard Landscape
}

export type FeatureMode = 
  | 'home'
  | 'profile'       
  | 'merge' 
  | 'thumbnail' 
  | 'expand' 
  | 'edit' 
  | 'removeobj'     
  | 'removebg'
  | 'restore'       
  | 'faceswap' 
  | 'videofaceswap'
  | 'animate'       
  | 'fitting'       
  | 'product' 
  | 'fotomodel'     
  | 'fashion' 
  | 'mockup' 
  | 'banner' 
  | 'carousel'
  | 'flayer'        
  | 'prewedding'
  | 'wedding'
  | 'babyborn'
  | 'kids'
  | 'umrah'
  | 'passphoto'
  | 'maternity'
  | 'interior'
  | 'exterior'
  | 'sketch'
  | 'caricature'
  | 'imagine'       
  | 'banana'        
  | 'veo'
  | 'chatbot'       
  | 'youtube'       
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'settings';     

export type FeatureType = 'image' | 'video' | 'tool' | 'downloader' | 'chat';

export interface FeatureConfig {
  id: FeatureMode;
  title: string;
  description: string;
  defaultPrompt: string;
  minImages: number;
  maxImages: number;
  type?: FeatureType; // Defaults to 'image'
  icon?: any;
}

export interface GeneratedResult {
  imageUrl: string;
  videoUrl?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: FeatureMode;
  prompt: string;
  results: string[]; // Array of Base64 or URLs
  thumbnail: string; // Small preview
  type: FeatureType;
}