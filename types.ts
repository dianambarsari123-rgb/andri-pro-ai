
export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export type FeatureMode = 
  | 'home'
  | 'merge' 
  | 'thumbnail' 
  | 'expand' 
  | 'edit' 
  | 'faceswap' 
  | 'videofaceswap' // Baru: Video Face Swap
  | 'fitting'       // Kamar Pas
  | 'product' 
  | 'fashion' 
  | 'mockup' 
  | 'banner' 
  | 'carousel'
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
  | 'banana'        // Baru: Nano Banana
  | 'veo'           // Baru: Google Veo 3
  | 'settings';     // Baru: Admin Settings

export type FeatureType = 'image' | 'video';

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
