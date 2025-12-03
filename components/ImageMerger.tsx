
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Plus, Wand2, Sparkles, AlertCircle, ArrowLeft, ArrowRight, ImagePlus, Video, Settings2, RefreshCw, FileDown, History, Clock, Trash2, Maximize2, Download, Monitor, Check, ZoomIn, ZoomOut, RotateCcw, Users, Link as LinkIcon, FileAudio, FileVideo, Info, BookOpen, Zap } from 'lucide-react';
import { UploadedImage, AspectRatio, FeatureConfig, FeatureMode, HistoryItem } from '../types';
import { generateImage, generateVideo, generateBatchImages, enhancePrompt } from '../services/geminiService';
import { faceSwap } from '../services/huggingfaceService';
import { generateWithPollinations } from '../services/pollinationsService';
import { processVideoLink, DownloadResult } from '../services/downloaderService';
import { FeatureExample } from './FeatureExamples';
import { PromptLibrary } from './PromptLibrary';

interface ImageMergerProps {
  feature: FeatureConfig;
}

const MAX_PROMPT_LENGTH = 1000;

const getImageLabel = (index: number, mode: FeatureMode) => {
  if (mode === 'faceswap') {
    return index === 0 ? 'Sumber Wajah' : 'Target Foto';
  }
  if (mode === 'videofaceswap') {
    return index === 0 ? 'Wajah (Sumber)' : `Ref #${index + 1}`;
  }
  if (mode === 'fitting') {
    return index === 0 ? 'Model/Orang' : 'Baju/Garmen';
  }
  if (mode === 'mockup') {
    return index === 0 ? 'Desain/Logo' : 'Objek Mockup';
  }
  if (mode === 'veo') {
    return index === 0 ? 'Referensi Awal' : `Ref #${index + 1}`;
  }
  if (mode === 'removebg' || mode === 'removeobj') {
    return 'Foto Asli';
  }
  return `#${index + 1}`;
};

const ImageMerger: React.FC<ImageMergerProps> = ({ feature }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>(feature.defaultPrompt);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false); // New state for Magic Prompt
  const [showPromptLib, setShowPromptLib] = useState(false); // New state for Prompt Library

  // AI Engine Selection (Gemini vs Pollinations)
  const [aiEngine, setAiEngine] = useState<'gemini' | 'pollinations'>('gemini');

  // Results can now be an array (for images) or single string (video)
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // New state for video quality
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '4k'>('1080p');

  // Preview & Download State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  
  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Downloader Specific State
  const [downloadUrlInput, setDownloadUrlInput] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('mp4-1080p');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);

  // Generation Progress Tracking
  const [genProgress, setGenProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVideoMode = feature.type === 'video';
  const isDownloaderMode = feature.type === 'downloader';
  const isTextToImage = feature.id === 'imagine' || feature.id === 'banana'; // Hide upload if imagine mode

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('andri_ai_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Reset state when feature changes
  useEffect(() => {
    setImages([]);
    setPrompt(feature.defaultPrompt);
    setGeneratedResults([]);
    setError(null);
    setRatio(AspectRatio.SQUARE); // Default
    
    // Default engine: Pollinations for 'banana', Gemini for others
    if (feature.id === 'banana') {
        setAiEngine('pollinations');
    } else {
        setAiEngine('gemini');
    }
    
    // Downloader reset
    setDownloadUrlInput('');
    setDownloadProgress(0);
    setDownloadResult(null);
    setGenProgress({ current: 0, total: 0 });

    if (isVideoMode) {
        setRatio(AspectRatio.LANDSCAPE); // Video prefers 16:9
        setVideoQuality('1080p'); // Default video quality
    }
  }, [feature, isVideoMode]);

  // Lock body scroll when preview is open
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
       document.body.style.overflow = 'unset';
    };
  }, [previewImage]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_PROMPT_LENGTH) {
      setPrompt(val);
      setError(null);
    }
  };

  const handleMagicPrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      // ignore
    } finally {
      setEnhancing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;
    
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setImages(newImages);
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    if (images.length < feature.minImages) {
      setError(`Minimal upload ${feature.minImages} gambar untuk fitur ini.`);
      return;
    }
    if (images.length > feature.maxImages && feature.maxImages > 0) {
      setError(`Maksimal upload ${feature.maxImages} gambar.`);
      return;
    }
    if (!prompt.trim()) {
       setError("Instruksi tidak boleh kosong.");
       return;
    }

    setLoading(true);
    setError(null);
    setGeneratedResults([]);
    setGenProgress({ current: 0, total: 0 });

    try {
      let results: string[] = [];

      if (feature.id === 'faceswap') {
        const res = await faceSwap(images[0].file, images[1].file);
        results = [res];
      } else if (isVideoMode) {
        const videoUrl = await generateVideo(prompt, images, ratio, feature.id, videoQuality);
        results = [videoUrl];
      } else if (aiEngine === 'pollinations' && isTextToImage) {
        // --- POLLINATIONS (FLUX) GENERATION ---
        setGenProgress({ current: 0, total: 4 });
        
        // Determine dimensions based on ratio
        let w = 1024, h = 1024;
        if (ratio === AspectRatio.LANDSCAPE) { w = 1280; h = 720; }
        else if (ratio === AspectRatio.PORTRAIT) { w = 720; h = 1280; }
        else if (ratio === AspectRatio.PORTRAIT_4_5) { w = 864; h = 1080; }
        else if (ratio === AspectRatio.LANDSCAPE_5_4) { w = 1080; h = 864; }

        // Generate 4 in parallel for speed
        const promises = Array(4).fill(0).map((_, idx) => 
            generateWithPollinations(prompt, w, h).then(res => {
                setGenProgress(prev => ({ ...prev, current: prev.current + 1 }));
                return res;
            })
        );
        results = await Promise.all(promises);

      } else {
        // --- GEMINI GENERATION ---
        results = await generateBatchImages(
          prompt, 
          images, 
          ratio, 
          feature.id, 
          4,
          (current, total) => {
             setGenProgress({ current, total });
          }
        );
      }
      
      setGeneratedResults(results);

      // Save to History
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: feature.id,
        prompt: prompt,
        results: results,
        thumbnail: results[0],
        type: feature.type || 'image'
      };

      const updatedHistory = [newHistoryItem, ...history].slice(50); // Limit 50 items
      setHistory(updatedHistory);
      localStorage.setItem('andri_ai_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      const errorMsg = err.message || 'Gagal memproses permintaan.';
      
      // SUPPRESS NOTIFICATION: Filter out permission denied errors
      const isPermissionError = 
         errorMsg.toLowerCase().includes('permission') || 
         errorMsg.toLowerCase().includes('izin') || 
         errorMsg.includes('403');

      if (!isPermissionError) {
         setError(errorMsg);
      } else {
         console.warn("Suppressed permission error notification:", errorMsg);
      }
    } finally {
      setLoading(false);
      setGenProgress({ current: 0, total: 0 });
    }
  };

  // Video Downloader Logic
  const handleConvertVideo = async () => {
     if(!downloadUrlInput.trim()) {
        setError("Silakan masukkan URL video terlebih dahulu.");
        return;
     }
     
     setLoading(true);
     setError(null);
     setDownloadProgress(0);
     setDownloadResult(null);

     try {
        const result = await processVideoLink(
           downloadUrlInput, 
           feature.id, // e.g., 'youtube', 'tiktok'
           downloadFormat,
           (progress) => setDownloadProgress(progress)
        );
        setDownloadResult(result);
     } catch (err: any) {
        setError(err.message || "Gagal mengkonversi video.");
     } finally {
        setLoading(false);
     }
  };


  const openPreview = (url: string) => {
    setPreviewImage(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDownload = async (url: string, quality: 'HD' | 'FHD' | 'UHD' = 'HD') => {
    if (isVideoMode) {
      window.open(url, '_blank');
      return;
    }

    try {
      setDownloadingQuality(quality);
      
      let scaleFactor = 1;
      if (quality === 'FHD') scaleFactor = 2;
      if (quality === 'UHD') scaleFactor = 4;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise(resolve => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `AndriAI-Pro-${feature.id}-${Date.now()}-${quality}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      console.error("Download failed", e);
      alert("Gagal mendownload gambar.");
    } finally {
      setDownloadingQuality(null);
    }
  };

  const handleDownloadInputs = async () => {
      for (const img of images) {
         const link = document.createElement('a');
         link.href = img.previewUrl;
         link.download = img.file.name;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         await new Promise(r => setTimeout(r, 500));
      }
  };

  // Zoom Pan Logic
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(1, zoom + scaleAmount), 5);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const restoreHistory = (item: HistoryItem) => {
    if (item.mode !== feature.id) {
       alert("Item history ini berasal dari mode fitur yang berbeda.");
       return;
    }
    setPrompt(item.prompt);
    setGeneratedResults(item.results);
    setShowHistory(false);
  };

  const clearHistory = () => {
    if(confirm("Hapus semua history?")) {
        setHistory([]);
        localStorage.removeItem('andri_ai_history');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
               {feature.icon || <Sparkles size={24} />}
             </div>
             <span>{feature.title}</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-400 mt-2 text-lg">{feature.description}</p>
        </div>
        
        {!isDownloaderMode && (
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-medium transition-colors shadow-sm"
          >
            <History size={18} /> Riwayat
          </button>
        )}
      </div>

      {!isDownloaderMode && <FeatureExample mode={feature.id} />}
      
      {/* Prompt Library Modal */}
      {showPromptLib && (
        <PromptLibrary 
          onSelect={(text) => {
            setPrompt(text);
            setShowPromptLib(false);
          }} 
          onClose={() => setShowPromptLib(false)} 
        />
      )}

      {/* Info Banner for Image Features */}
      {!isDownloaderMode && !isTextToImage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
             <Info size={18} />
          </div>
          <div>
             <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
                Unggah <span className="font-bold">{feature.minImages}-{feature.maxImages > 0 ? feature.maxImages : '5'} gambar</span>, tulis instruksi, dan biarkan AI menggabungkannya menjadi sebuah karya baru yang unik.
             </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden relative">
        
        {loading && (
           <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="relative mb-8">
                 <div className="w-20 h-20 border-4 border-slate-100 dark:border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    {isDownloaderMode ? <Download className="text-emerald-500 animate-pulse" /> : <Sparkles className="text-emerald-500 animate-pulse" size={24} />}
                 </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                 {isDownloaderMode ? 'Mengkonversi Video...' : 'Sedang Memproses...'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                 {isDownloaderMode 
                    ? `Sedang mengambil data dari ${feature.title}... (${downloadProgress}%)` 
                    : (feature.id === 'faceswap'
                         ? "Menghubungkan ke Neural Network Face Swap... Mengaktifkan Face Enhancer untuk hasil maksimal (60-90 detik)."
                         : isVideoMode 
                           ? " Video rendering memakan waktu 1-2 menit." 
                           : (aiEngine === 'pollinations'
                                ? "Menghubungkan ke Flux/SDXL Engine... (Fast Generation)"
                                : (genProgress.total > 0 
                                    ? `Membuat variasi ${genProgress.current} dari ${genProgress.total}...` 
                                    : "Estimasi waktu: 10-20 detik.")
                             )
                      )
                 }
              </p>
              {(isDownloaderMode || (!isVideoMode && genProgress.total > 0)) && (
                 <div className="w-64 h-2 bg-slate-100 dark:bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                        style={{ width: `${isDownloaderMode ? downloadProgress : (genProgress.current / genProgress.total) * 100}%` }}
                    ></div>
                 </div>
              )}
           </div>
        )}

        {isDownloaderMode ? (
           <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto space-y-8">
                 <div className="space-y-4">
                    <label className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                       <LinkIcon size={18} className="text-emerald-500" />
                       Paste Link {feature.title.replace('Downloader','')}
                    </label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={downloadUrlInput}
                         onChange={(e) => setDownloadUrlInput(e.target.value)}
                         className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white font-medium"
                         placeholder={`Contoh: https://www.${feature.id}.com/watch?v=...`}
                       />
                       {downloadUrlInput && (
                          <button onClick={() => setDownloadUrlInput('')} className="absolute right-4 top-4 text-slate-400 hover:text-red-500">
                             <X size={20} />
                          </button>
                       )}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                     <label className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        <Settings2 size={18} className="text-blue-500" />
                        Pilih Format Output
                     </label>
                     <div className="grid grid-cols-3 gap-4">
                        <button 
                           onClick={() => setDownloadFormat('mp4-1080p')}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${downloadFormat === 'mp4-1080p' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-emerald-200'}`}
                        >
                           <FileVideo size={24} />
                           <span className="font-bold text-sm">MP4 1080p</span>
                        </button>
                        <button 
                           onClick={() => setDownloadFormat('mp4-720p')}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${downloadFormat === 'mp4-720p' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-emerald-200'}`}
                        >
                           <FileVideo size={24} />
                           <span className="font-bold text-sm">MP4 720p</span>
                        </button>
                        <button 
                           onClick={() => setDownloadFormat('mp3')}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${downloadFormat === 'mp3' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-emerald-200'}`}
                        >
                           <FileAudio size={24} />
                           <span className="font-bold text-sm">MP3 Audio</span>
                        </button>
                     </div>
                 </div>

                 <button
                    onClick={handleConvertVideo}
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                 >
                    {loading ? 'Sedang Memproses...' : 'Convert & Download'}
                 </button>
                 
                 {downloadResult && (
                    <div className="mt-8 bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-emerald-100 dark:border-white/10 animate-in slide-in-from-bottom-4">
                       <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <Check className="text-emerald-500" /> Konversi Berhasil!
                       </h3>
                       <div className="flex gap-4">
                          <img src={downloadResult.thumbnail} alt="Thumb" className="w-32 h-20 object-cover rounded-lg bg-slate-200" />
                          <div className="flex-1 min-w-0">
                             <div className="font-bold text-slate-800 dark:text-white truncate">{downloadResult.title}</div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Format: {downloadResult.format.toUpperCase()} • Size: {downloadResult.size}
                             </div>
                             <button className="mt-3 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-colors flex items-center gap-2">
                                <Download size={14} /> Download File
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        ) : (
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-slate-200 dark:divide-white/10">
            
            {/* Left: Inputs */}
            <div className="p-8 bg-slate-50/50 dark:bg-white/5 space-y-8">
              
              {/* 1. Image Upload (Hidden for Imagine) */}
              {!isTextToImage && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white">1</div>
                       Unggah Gambar 
                       <span className="text-xs font-normal text-slate-400 ml-2">
                         (Min {feature.minImages}, Maks {feature.maxImages})
                       </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div key={img.id} className="relative aspect-square group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 shadow-sm">
                        <img src={img.previewUrl} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm">
                             <X size={14} />
                           </button>
                        </div>

                        {/* Order Controls */}
                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                               <button disabled={index === 0} onClick={() => moveImage(index, 'left')} className="p-1 bg-black/50 text-white rounded hover:bg-black/70 disabled:opacity-30"><ArrowLeft size={12}/></button>
                               <button disabled={index === images.length - 1} onClick={() => moveImage(index, 'right')} className="p-1 bg-black/50 text-white rounded hover:bg-black/70 disabled:opacity-30"><ArrowRight size={12}/></button>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1.5">
                          <p className="text-[10px] font-medium text-center text-white truncate">
                            {getImageLabel(index, feature.id)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {images.length < (feature.maxImages || 5) && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group"
                      >
                        <div className="p-3 bg-white dark:bg-white/5 rounded-full mb-2 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                           <Plus size={24} />
                        </div>
                        <span className="text-xs font-medium">Tambah Foto</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </div>
              )}

              {/* 2. Prompt Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white">{isTextToImage ? '1' : '2'}</div>
                    Instruksi (Prompt)
                  </h3>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setShowPromptLib(true)}
                        className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20"
                      >
                         <BookOpen size={12} /> Inspirasi
                      </button>
                      <button 
                        onClick={handleMagicPrompt}
                        disabled={enhancing || !prompt.trim()}
                        className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-500/20 disabled:opacity-50"
                      >
                         {enhancing ? <Sparkles size={12} className="animate-spin" /> : <Wand2 size={12} />}
                         Magic Enhance
                      </button>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    className="w-full h-32 p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none transition-all shadow-inner text-sm leading-relaxed"
                    placeholder="Deskripsikan detail yang Anda inginkan..."
                  />
                  <div className={`absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm ${
                      prompt.length > MAX_PROMPT_LENGTH * 0.9 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {prompt.length} / {MAX_PROMPT_LENGTH}
                  </div>
                </div>
              </div>

              {/* 3. Settings (Ratio / Quality) */}
              <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white">{isTextToImage ? '2' : '3'}</div>
                    Pengaturan
                 </h3>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[AspectRatio.SQUARE, AspectRatio.LANDSCAPE, AspectRatio.PORTRAIT, AspectRatio.PORTRAIT_4_5, AspectRatio.LANDSCAPE_5_4].map((r) => (
                       <button
                          key={r}
                          onClick={() => setRatio(r)}
                          className={`px-3 py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                             ratio === r 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105' 
                                : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-400'
                          }`}
                       >
                          <div className={`border-2 rounded-sm ${
                             r === AspectRatio.SQUARE ? 'w-5 h-5' : 
                             r === AspectRatio.LANDSCAPE ? 'w-7 h-4' : 
                             r === AspectRatio.PORTRAIT ? 'w-4 h-7' :
                             r === AspectRatio.PORTRAIT_4_5 ? 'w-4 h-5' : 'w-5 h-4'
                          } ${ratio === r ? 'border-white' : 'border-slate-400'}`}></div>
                          {r}
                       </button>
                    ))}
                 </div>
                 
                 {/* Video Quality Selection */}
                 {isVideoMode && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-4">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Kualitas Video</label>
                       <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
                          {(['720p', '1080p', '4k'] as const).map((q) => (
                             <button
                                key={q}
                                onClick={() => setVideoQuality(q)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                   videoQuality === q 
                                     ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' 
                                     : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                                }`}
                             >
                                {q === '4k' ? 'Ultra 4K' : q}
                             </button>
                          ))}
                       </div>
                    </div>
                 )}
                 
                 {/* AI Engine Selection for Imagine/Banana */}
                 {(isTextToImage) && (
                     <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-4">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">AI Engine</label>
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" checked={aiEngine === 'gemini'} onChange={() => setAiEngine('gemini')} className="text-emerald-500 focus:ring-emerald-500" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gemini 3 Pro</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" checked={aiEngine === 'pollinations'} onChange={() => setAiEngine('pollinations')} className="text-emerald-500 focus:ring-emerald-500" />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Flux / SDXL (Faster)</span>
                          </label>
                       </div>
                    </div>
                 )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     {isVideoMode ? 'Rendering Video...' : 'Generating...'}
                   </>
                ) : (
                   <>
                     <Sparkles size={20} className="animate-pulse" /> 
                     {isVideoMode ? 'Render Video' : 'Buat 4 Variasi'}
                   </>
                )}
              </button>

            </div>

            {/* Right: Results */}
            <div className="bg-slate-100/50 dark:bg-black/40 p-8 flex flex-col h-full min-h-[500px]">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                  <ImagePlus size={18} className="text-emerald-500" /> Hasil Generasi
               </h3>
               
               <div className="flex-1">
                  {generatedResults.length > 0 ? (
                     <div className={`grid gap-4 ${generatedResults.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {generatedResults.map((res, idx) => (
                           <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-md bg-white dark:bg-black/20 animate-in zoom-in duration-500 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                              {isVideoMode ? (
                                 <video 
                                   src={res} 
                                   controls 
                                   autoPlay 
                                   loop 
                                   className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <>
                                    <img 
                                      src={res} 
                                      alt={`Result ${idx}`} 
                                      className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                                      onClick={() => openPreview(res)}
                                    />
                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                       <button onClick={() => openPreview(res)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-sm transition-all transform hover:scale-110">
                                          <Maximize2 size={20} />
                                       </button>
                                       {/* Individual Download */}
                                       <button 
                                          onClick={(e) => { e.stopPropagation(); handleDownload(res, 'HD'); }}
                                          className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
                                          title="Download Image"
                                       >
                                          <Download size={20} />
                                       </button>
                                    </div>
                                    
                                    {/* Number Badge */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                                       V{idx+1}
                                    </div>
                                 </>
                              )}
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl p-8 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                           <ImagePlus size={32} />
                        </div>
                        <p className="font-medium">Belum ada hasil.</p>
                        <p className="text-sm mt-1">Isi form di sebelah kiri dan klik tombol generate.</p>
                     </div>
                  )}
               </div>

               {/* Action Buttons */}
               {generatedResults.length > 0 && (
                 <div className="mt-6 space-y-3">
                    <button 
                       onClick={handleGenerate}
                       className="w-full py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                       <RefreshCw size={18} /> Generate Again
                    </button>
                    {!isVideoMode && images.length > 0 && (
                       <button
                          onClick={handleDownloadInputs}
                          className="w-full py-3 bg-transparent text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                       >
                          <FileDown size={16} /> Download Source Images
                       </button>
                    )}
                 </div>
               )}

            </div>

          </div>
        )}

      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
            <button onClick={() => setPreviewImage(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <X size={24} />
            </button>
          </div>
          
          <div 
             className="relative w-full h-full flex items-center justify-center overflow-hidden"
             onWheel={handleWheel}
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
          >
             <img 
               src={previewImage} 
               alt="Full Preview" 
               className="max-w-none transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
               style={{ 
                 transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
               }}
               onDoubleClick={() => { setZoom(1); setPan({x:0, y:0}); }}
               draggable={false}
             />
             
             {/* Floating Zoom Controls */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <button onClick={() => setZoom(Math.max(1, zoom - 0.5))} className="text-white hover:text-emerald-400 p-1"><ZoomOut size={20}/></button>
                <span className="text-white font-mono text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(5, zoom + 0.5))} className="text-white hover:text-emerald-400 p-1"><ZoomIn size={20}/></button>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="text-white hover:text-emerald-400 p-1" title="Reset View"><RotateCcw size={18}/></button>
             </div>
          </div>

          {/* Download Options Panel */}
          <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-64 shadow-2xl">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
               <Download size={18} className="text-emerald-500" /> Download Quality
            </h4>
            <div className="space-y-2">
              <button 
                onClick={() => handleDownload(previewImage, 'HD')}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 transition-all text-sm font-medium flex justify-between items-center group"
              >
                <span>Standard HD</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-emerald-400">1x</span>
              </button>
              <button 
                onClick={() => handleDownload(previewImage, 'FHD')}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 transition-all text-sm font-medium flex justify-between items-center group"
              >
                <span>High Res FHD</span>
                <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-emerald-400">2x Upscale</span>
              </button>
              <button 
                onClick={() => handleDownload(previewImage, 'UHD')}
                className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 border border-emerald-500/30 text-emerald-400 transition-all text-sm font-bold flex justify-between items-center group"
              >
                <span>Ultra 4K</span>
                <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold">4x AI</span>
              </button>
            </div>
            {downloadingQuality && (
               <div className="mt-4 text-center text-xs text-emerald-400 animate-pulse">
                  Memproses {downloadingQuality}...
               </div>
            )}
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-[#0c0c0e] h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <History size={20} /> Riwayat
                  </h3>
                  <div className="flex gap-2">
                     <button onClick={clearHistory} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Semua">
                        <Trash2 size={18} />
                     </button>
                     <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                        <X size={20} />
                     </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {history.filter(h => h.mode === feature.id).length > 0 ? (
                     history.filter(h => h.mode === feature.id).map((item) => (
                        <div key={item.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3 hover:border-emerald-500 cursor-pointer transition-all group" onClick={() => restoreHistory(item)}>
                           <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                 {item.type === 'video' ? (
                                    <Video className="w-full h-full p-4 text-slate-400" />
                                 ) : (
                                    <img src={item.thumbnail} alt="Thumb" className="w-full h-full object-cover" />
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                    <Clock size={10} /> {new Date(item.timestamp).toLocaleString()}
                                 </p>
                                 <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-snug">
                                    {item.prompt}
                                 </p>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center text-slate-400 py-10">
                        <p>Belum ada riwayat untuk fitur ini.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ImageMerger;
