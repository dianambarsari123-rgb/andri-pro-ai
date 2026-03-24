
import React from 'react';

// Note: Custom web component declaration removed to prevent overwriting global JSX.IntrinsicElements
// If 'dotlottie-wc' is needed, it should be added via module augmentation without replacing the interface.

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
  LANDSCAPE_5_4 = '5:4', // Standard Landscape
  PORTRAIT_3_4 = '3:4',
  PORTRAIT_4_3 = '4:3'
}

export type FeatureMode = 
  | 'home'
  | 'gallery'       
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
  | 'tts'
  | 'banana'        
  | 'veo'
  | 'chatbot'       
  | 'youtube'       
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'settings';     

export type FeatureType = 'image' | 'video' | 'audio' | 'tool' | 'downloader' | 'chat';

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
