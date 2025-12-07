
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
  if (mode === 'prewedding') {
    return index === 0 ? 'Foto Pria' : 'Foto Wanita';
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
  if (mode === 'fotomodel') {
    return 'Foto Produk / Baju';
  }
  if (mode === 'banana') {
    return 'Reference (Opt)';
  }
  return `#${index + 1}`;
};

const ImageMerger: React.FC<ImageMergerProps> = ({ feature }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>(feature.defaultPrompt);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showPromptLib, setShowPromptLib] = useState(false);
  const [aiEngine, setAiEngine] = useState<'gemini' | 'pollinations'>('gemini');
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [downloadUrlInput, setDownloadUrlInput] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('mp4-1080p');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [genProgress, setGenProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVideoMode = feature.type === 'video';
  const isDownloaderMode = feature.type === 'downloader';
  const isTextToImage = feature.id === 'imagine'; 

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

  useEffect(() => {
    setImages([]);
    setPrompt(feature.defaultPrompt);
    setGeneratedResults([]);
    setError(null);
    setRatio(AspectRatio.SQUARE);
    
    if (feature.id === 'banana') {
        setAiEngine('pollinations');
    } else {
        setAiEngine('gemini');
    }
    
    setDownloadUrlInput('');
    setDownloadProgress(0);
    setDownloadResult(null);
    setGenProgress({ current: 0, total: 0 });

    if (isVideoMode) {
        setRatio(AspectRatio.LANDSCAPE);
        setVideoQuality('1080p');
    }
  }, [feature, isVideoMode]);

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
      
      if (feature.id === 'banana') {
        setAiEngine('gemini');
      }
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (feature.id === 'banana' && images.length <= 1) {
        setAiEngine('pollinations');
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setImages(newImages);
  };

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
      } else if (aiEngine === 'pollinations' && images.length === 0) {
        setGenProgress({ current: 0, total: 4 });
        let w = 1024, h = 1024;
        if (ratio === AspectRatio.LANDSCAPE) { w = 1280; h = 720; }
        else if (ratio === AspectRatio.PORTRAIT) { w = 720; h = 1280; }
        else if (ratio === AspectRatio.PORTRAIT_4_5) { w = 864; h = 1080; }
        else if (ratio === AspectRatio.LANDSCAPE_5_4) { w = 1080; h = 864; }

        const promises = Array(4).fill(0).map((_, idx) => 
            generateWithPollinations(prompt, w, h).then(res => {
                setGenProgress(prev => ({ ...prev, current: prev.current + 1 }));
                return res;
            })
        );
        results = await Promise.all(promises);

      } else {
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

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: feature.id,
        prompt: prompt,
        results: results,
        thumbnail: results[0],
        type: feature.type || 'image'
      };

      const updatedHistory = [newHistoryItem, ...history].slice(50);
      setHistory(updatedHistory);
      localStorage.setItem('andri_ai_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      const errorMsg = err.message || 'Gagal memproses permintaan.';
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
           feature.id, 
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

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleAmount = -e.deltaY * 0.002;
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
    setHistory([]);
    localStorage.removeItem('andri_ai_history');
    setShowHistory(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-4">
             <div className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
               {feature.icon || <Sparkles size={24} />}
             </div>
             <span>{feature.title}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light leading-relaxed max-w-2xl">{feature.description}</p>
        </div>
        
        {!isDownloaderMode && (
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 dark:text-slate-300 font-medium transition-all hover:text-slate-900 dark:hover:text-white"
          >
            <History size={18} /> Riwayat
          </button>
        )}
      </div>

      {!isDownloaderMode && <FeatureExample mode={feature.id} />}
      
      {showPromptLib && (
        <PromptLibrary 
          onSelect={(text) => {
            setPrompt(text);
            setShowPromptLib(false);
          }} 
          onClose={() => setShowPromptLib(false)} 
        />
      )}

      {!isDownloaderMode && !isTextToImage && (
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/20 rounded-2xl p-4 mb-6 flex gap-4 items-center animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
             <Info size={18} />
          </div>
          <div>
             <p className="text-sm font-medium text-emerald-800 dark:text-emerald-100 leading-relaxed">
                {feature.id === 'fotomodel' && (
                    <span>Jelaskan model yang Anda inginkan, atau biarkan AI yang berkreasi untuk membuatkan model yang sempurna.</span>
                )}
                {feature.id === 'banana' && (
                    <span>Tulis instruksi teks untuk membuat gambar super cepat. Opsional: Upload gambar referensi untuk variasi.</span>
                )}
                {feature.id !== 'fotomodel' && feature.id !== 'banana' && (
                    <span>Unggah <span className="font-bold text-emerald-600 dark:text-emerald-400">{feature.minImages}-{feature.maxImages > 0 ? feature.maxImages : '5'} gambar</span>, tulis instruksi, dan biarkan AI menggabungkannya menjadi sebuah karya baru yang unik.</span>
                )}
             </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-[2rem] shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative">
        
        {loading && (
           <div className="absolute inset-0 bg-white/90 dark:bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="relative mb-8">
                 <div className="w-24 h-24 border-4 border-slate-200 dark:border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    {isDownloaderMode ? <Download className="text-emerald-500 animate-pulse" /> : <Sparkles className="text-emerald-500 animate-pulse" size={28} />}
                 </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">
                 {isDownloaderMode ? 'Mengkonversi Video...' : 'Sedang Memproses...'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-light">
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
                 <div className="w-72 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300" 
                        style={{ width: `${isDownloaderMode ? downloadProgress : (genProgress.current / genProgress.total) * 100}%` }}
                    ></div>
                 </div>
              )}
           </div>
        )}

        {isDownloaderMode ? (
           <div className="p-12 md:p-16">
              <div className="max-w-2xl mx-auto space-y-10">
                 <div className="space-y-4">
                    <label className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                       <LinkIcon size={20} className="text-emerald-500" />
                       Paste Link {feature.title.replace('Downloader','')}
                    </label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         value={downloadUrlInput}
                         onChange={(e) => setDownloadUrlInput(e.target.value)}
                         className="w-full pl-6 pr-12 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-emerald-500 focus:bg-white dark:focus:bg-white/10 outline-none transition-all text-slate-800 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                         placeholder={`Contoh: https://www.${feature.id}.com/watch?v=...`}
                       />
                       {downloadUrlInput && (
                          <button onClick={() => setDownloadUrlInput('')} className="absolute right-4 top-5 text-slate-500 hover:text-red-400">
                             <X size={20} />
                          </button>
                       )}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                     <label className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                        <Settings2 size={20} className="text-blue-500" />
                        Pilih Format Output
                     </label>
                     <div className="grid grid-cols-3 gap-4">
                        {['mp4-1080p', 'mp4-720p', 'mp3'].map((fmt) => (
                            <button 
                               key={fmt}
                               onClick={() => setDownloadFormat(fmt)}
                               className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${downloadFormat === fmt ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
                            >
                               {fmt === 'mp3' ? <FileAudio size={28} /> : <FileVideo size={28} />}
                               <span className="font-bold text-sm uppercase">{fmt.replace('-', ' ')}</span>
                            </button>
                        ))}
                     </div>
                 </div>

                 <button
                    onClick={handleConvertVideo}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                 >
                    {loading ? 'Sedang Memproses...' : 'Convert & Download'}
                 </button>
                 
                 {downloadResult && (
                    <div className="mt-10 bg-white/5 rounded-3xl p-8 border border-white/10 animate-in slide-in-from-bottom-8">
                       <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-xl">
                          <Check className="text-emerald-500" /> Konversi Berhasil!
                       </h3>
                       <div className="flex gap-6">
                          <img src={downloadResult.thumbnail} alt="Thumb" className="w-40 h-28 object-cover rounded-xl bg-slate-800" />
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <div className="font-bold text-white text-lg truncate mb-2">{downloadResult.title}</div>
                             <div className="text-sm text-slate-400 mb-4 flex gap-4">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">FMT: {downloadResult.format.toUpperCase()}</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">SIZE: {downloadResult.size}</span>
                             </div>
                             <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 w-fit">
                                <Download size={18} /> Download File
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        ) : (
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-slate-200 dark:divide-white/5">
            
            <div className="p-10 bg-white dark:bg-white/5 space-y-10">
              
              {feature.id === 'fotomodel' && (
                 <div className="bg-white dark:bg-white/5 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200 dark:border-white/5">
                    <button className="flex-1 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm text-sm border border-emerald-100 dark:border-transparent">Buat Model</button>
                    <button className="flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium text-sm transition-colors">Ubah Pose</button>
                 </div>
              )}

              {!isTextToImage && (
                <div className="space-y-5">
                   {feature.id === 'fotomodel' && (
                       <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">1. Pengaturan Model</label>
                           <select className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white outline-none focus:border-emerald-500">
                               <option>Model dengan background flat</option>
                               <option>Model di Studio Lighting</option>
                               <option>Model Outdoor / Street</option>
                               <option>Model Cinematic</option>
                           </select>
                       </div>
                   )}

                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                       <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-white border border-slate-300 dark:border-white/10">{feature.id === 'fotomodel' ? '3' : '1'}</div>
                       {feature.id === 'banana' ? 'Reference Image (Optional)' : 'Unggah Gambar'}
                       {feature.id !== 'banana' && (
                           <span className="text-xs font-normal text-slate-500 ml-2 tracking-wide">
                             (MIN {feature.minImages} - MAX {feature.maxImages})
                           </span>
                       )}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div key={img.id} className="relative aspect-square group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-inner">
                        <img src={img.previewUrl} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => removeImage(img.id)} className="p-2 bg-red-500/80 backdrop-blur text-white rounded-lg hover:bg-red-600 transition-colors">
                             <X size={14} />
                           </button>
                        </div>

                        {images.length > 1 && (
                            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button disabled={index === 0} onClick={() => moveImage(index, 'left')} className="p-1.5 bg-black/60 text-white rounded hover:bg-emerald-500 disabled:opacity-30 backdrop-blur"><ArrowLeft size={14}/></button>
                               <button disabled={index === images.length - 1} onClick={() => moveImage(index, 'right')} className="p-1.5 bg-black/60 text-white rounded hover:bg-emerald-500 disabled:opacity-30 backdrop-blur"><ArrowRight size={14}/></button>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6">
                          <p className="text-[10px] font-bold text-center text-emerald-400 uppercase tracking-wider">
                            {getImageLabel(index, feature.id)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {(feature.id === 'banana' ? images.length < 1 : images.length < (feature.maxImages || 5)) && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group bg-white dark:bg-transparent"
                      >
                        <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-3 shadow-inner group-hover:scale-110 transition-transform">
                           <Plus size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {feature.id === 'banana' ? '0/1' : 'Tambah Foto'}
                        </span>
                        {feature.id === 'banana' && <span className="text-[9px] mt-1 text-slate-400">Drag / Paste / Click</span>}
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

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-white border border-slate-300 dark:border-white/10">{isTextToImage ? '1' : (feature.id === 'fotomodel' ? '2' : '2')}</div>
                    {feature.id === 'fotomodel' ? 'Deskripsi Model' : 'Instruksi (Prompt)'}
                  </h3>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowPromptLib(true)}
                        className="text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                      >
                         <BookOpen size={14} /> Inspirasi
                      </button>
                      <button 
                        onClick={handleMagicPrompt}
                        disabled={enhancing || !prompt.trim()}
                        className="text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/20 disabled:opacity-50 transition-all"
                      >
                         {enhancing ? <Sparkles size={14} className="animate-spin" /> : <Wand2 size={14} />}
                         Magic Enhance
                      </button>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    className="w-full h-40 p-5 bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-300 dark:border-white/10 focus:border-emerald-500/50 focus:bg-slate-50 dark:focus:bg-black/60 outline-none resize-none transition-all shadow-inner text-sm leading-relaxed tracking-wide placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Deskripsikan detail yang Anda inginkan..."
                  />
                  <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 transition-colors ${prompt.length >= MAX_PROMPT_LENGTH ? 'text-red-500 border-red-500/50' : 'text-slate-400'}`}>
                    {prompt.length}/{MAX_PROMPT_LENGTH}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-white border border-slate-300 dark:border-white/10">{isTextToImage ? '2' : (feature.id === 'fotomodel' ? '3' : '3')}</div>
                    Pengaturan Hasil
                  </h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {!isVideoMode ? (
                      <>
                        <button onClick={() => setRatio(AspectRatio.SQUARE)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ratio === AspectRatio.SQUARE ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                          <div className="w-6 h-6 border-2 border-current rounded-sm"></div>
                          <span className="text-[10px] font-bold">1:1</span>
                        </button>
                        <button onClick={() => setRatio(AspectRatio.LANDSCAPE)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ratio === AspectRatio.LANDSCAPE ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                          <div className="w-8 h-5 border-2 border-current rounded-sm"></div>
                          <span className="text-[10px] font-bold">16:9</span>
                        </button>
                        <button onClick={() => setRatio(AspectRatio.PORTRAIT)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ratio === AspectRatio.PORTRAIT ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                          <div className="w-5 h-8 border-2 border-current rounded-sm"></div>
                          <span className="text-[10px] font-bold">9:16</span>
                        </button>
                        <button onClick={() => setRatio(AspectRatio.PORTRAIT_4_5)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ratio === AspectRatio.PORTRAIT_4_5 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                          <div className="w-5 h-6 border-2 border-current rounded-sm"></div>
                          <span className="text-[10px] font-bold">4:5</span>
                        </button>
                        <button onClick={() => setRatio(AspectRatio.LANDSCAPE_5_4)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ratio === AspectRatio.LANDSCAPE_5_4 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}>
                          <div className="w-6 h-5 border-2 border-current rounded-sm"></div>
                          <span className="text-[10px] font-bold">5:4</span>
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={() => setVideoQuality('720p')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${videoQuality === '720p' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                            <span className="text-lg font-black">HD</span>
                            <span className="text-[10px] font-bold">720p</span>
                        </button>
                        <button onClick={() => setVideoQuality('1080p')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${videoQuality === '1080p' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                            <span className="text-lg font-black">FHD</span>
                            <span className="text-[10px] font-bold">1080p</span>
                        </button>
                        <button onClick={() => setVideoQuality('4k')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${videoQuality === '4k' ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                            <span className="text-lg font-black">4K</span>
                            <span className="text-[10px] font-bold">Ultra</span>
                        </button>
                      </>
                  )}
                </div>
                
                {(feature.id === 'imagine' || feature.id === 'banana') && (
                    <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">AI Engine</label>
                        <div className="flex bg-white dark:bg-black/20 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                            <button 
                                onClick={() => setAiEngine('gemini')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiEngine === 'gemini' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                            >
                                Gemini Pro
                            </button>
                            <button 
                                onClick={() => setAiEngine('pollinations')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiEngine === 'pollinations' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                            >
                                Flux / SDXL (Fast)
                            </button>
                        </div>
                    </div>
                )}
              </div>
              
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Sparkles size={24} className={isTextToImage ? "text-purple-200" : "text-emerald-100"} /> 
                        {feature.id === 'banana' || feature.id === 'imagine' ? 'Generate Image' : 'Generate Again'}
                    </>
                )}
              </button>

            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 p-10 flex flex-col h-full min-h-[600px] relative">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                    <Monitor size={20} className="text-emerald-500" /> Hasil Generasi
                 </h3>
                 {generatedResults.length > 0 && !isVideoMode && (
                     <button onClick={handleDownloadInputs} className="text-xs font-bold text-slate-500 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <FileDown size={14} /> Download Inputs
                     </button>
                 )}
              </div>
              
              {generatedResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 h-full content-start">
                  {generatedResults.map((res, i) => (
                    <div key={i} className={`group relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 ${isVideoMode ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                      {isVideoMode ? (
                        <video src={res} controls className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <img 
                            src={res} 
                            alt={`Result ${i}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" 
                            onClick={() => openPreview(res)}
                        />
                      )}
                      
                      {!isVideoMode && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                             <button onClick={() => openPreview(res)} className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition-all">
                                 <Maximize2 size={24} />
                             </button>
                             <div className="flex gap-2">
                                <button onClick={() => handleDownload(res, 'HD')} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg">HD</button>
                                <button onClick={() => handleDownload(res, 'FHD')} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg">FHD</button>
                             </div>
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center bg-slate-100/50 dark:bg-white/5">
                   <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <ImagePlus size={32} className="opacity-50" />
                   </div>
                   <p className="font-medium text-lg mb-2">Belum ada hasil</p>
                   <p className="text-sm opacity-60 max-w-xs">Gambar atau video yang Anda buat akan muncul di sini.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
           <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]"
           >
              <X size={32} />
           </button>
           
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-[110]">
              <div className="bg-white/10 backdrop-blur rounded-full p-1 flex border border-white/10">
                 <button onClick={() => handleWheel({ deltaY: 100 } as any)} className="p-3 hover:bg-white/20 rounded-full text-white"><ZoomOut size={20}/></button>
                 <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-3 hover:bg-white/20 rounded-full text-white"><RotateCcw size={20}/></button>
                 <button onClick={() => handleWheel({ deltaY: -100 } as any)} className="p-3 hover:bg-white/20 rounded-full text-white"><ZoomIn size={20}/></button>
              </div>

              <div className="flex gap-2">
                 <button onClick={() => handleDownload(previewImage, 'HD')} disabled={!!downloadingQuality} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
                    {downloadingQuality === 'HD' ? 'Saving...' : 'Download HD'}
                 </button>
                 <button onClick={() => handleDownload(previewImage, 'FHD')} disabled={!!downloadingQuality} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
                    {downloadingQuality === 'FHD' ? 'Upscaling...' : 'Download FHD'}
                 </button>
                  <button onClick={() => handleDownload(previewImage, 'UHD')} disabled={!!downloadingQuality} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
                    {downloadingQuality === 'UHD' ? 'Upscaling 4K...' : 'Download 4K'}
                 </button>
              </div>
           </div>
           
           <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={() => { setZoom(1); setPan({x:0, y:0}); }}
           >
              <img 
                 src={previewImage} 
                 alt="Preview" 
                 className="max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-75 ease-linear shadow-2xl"
                 style={{ 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                 }}
                 draggable={false}
              />
           </div>
        </div>
      )}

      {/* History Slideover */}
      {showHistory && (
         <div className="fixed inset-0 z-[70] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowHistory(false)}></div>
            <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] h-full shadow-2xl relative animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10 flex flex-col">
               <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                     <History className="text-emerald-500" /> Riwayat Aktivitas
                  </h3>
                  <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-[#0c0c0e]">
                  {history.filter(h => h.mode === feature.id).length === 0 ? (
                     <div className="text-center text-slate-400 py-20 flex flex-col items-center">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>Belum ada riwayat untuk fitur ini.</p>
                     </div>
                  ) : (
                     history.filter(h => h.mode === feature.id).map((item) => (
                        <div key={item.id} className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer" onClick={() => restoreHistory(item)}>
                           <div className="flex gap-4">
                              <img src={item.thumbnail} alt="Thumb" className="w-20 h-20 rounded-lg object-cover bg-slate-800" />
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(item.timestamp).toLocaleString()}
                                 </p>
                                 <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 font-medium leading-relaxed">{item.prompt}</p>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
               
               <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <button onClick={clearHistory} className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold">
                     <Trash2 size={16} /> Hapus Semua Riwayat
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ImageMerger;
