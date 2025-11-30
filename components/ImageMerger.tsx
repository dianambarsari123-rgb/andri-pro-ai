
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Plus, Wand2, Sparkles, AlertCircle, ArrowLeft, ArrowRight, ImagePlus, Video, Settings2, RefreshCw, FileDown, History, Clock, Trash2, Maximize2, Download, Monitor, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { UploadedImage, AspectRatio, FeatureConfig, FeatureMode, HistoryItem } from '../types';
import { generateImage, generateVideo, generateBatchImages } from '../services/geminiService';
import { FeatureExample } from './FeatureExamples';

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
  return `#${index + 1}`;
};

const ImageMerger: React.FC<ImageMergerProps> = ({ feature }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>(feature.defaultPrompt);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVideoMode = feature.type === 'video';

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
    if (isVideoMode) {
        setRatio(AspectRatio.LANDSCAPE); // Video prefers 16:9
        setVideoQuality('1080p'); // Default video quality
    }
  }, [feature, isVideoMode]);

  // Reset zoom when preview opens/closes
  useEffect(() => {
    if (!previewImage) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [previewImage]);

  const saveHistory = (results: string[]) => {
    if (results.length === 0) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: feature.id,
      prompt: prompt,
      results: results,
      thumbnail: results[0],
      type: feature.type || 'image'
    };

    const updatedHistory = [newItem, ...history];
    
    // Keep max 10 items to prevent LocalStorage quota limits (Base64 is heavy)
    if (updatedHistory.length > 10) {
      updatedHistory.pop();
    }

    setHistory(updatedHistory);
    try {
      localStorage.setItem('andri_ai_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("LocalStorage full, could not save history item");
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('andri_ai_history', JSON.stringify(updated));
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setGeneratedResults(item.results);
    // Note: We cannot restore input images file objects, so we just restore the result view
    // Switch to the correct mode if needed (though UI handles current mode)
    setShowHistory(false);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (images.length >= feature.maxImages) {
        setError(`Maksimal ${feature.maxImages} gambar untuk fitur ini.`);
        return;
      }

      const newImages: UploadedImage[] = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: file as File,
        previewUrl: URL.createObjectURL(file as File)
      }));

      // Combine and slice to ensure max limit
      const remainingSlots = feature.maxImages - images.length;
      const imagesToAdd = newImages.slice(0, remainingSlots);
      
      setImages([...images, ...imagesToAdd]);
      setError(null);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setImages(newImages);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_PROMPT_LENGTH) {
      setPrompt(text);
      if (error === "Silakan masukkan instruksi.") {
        setError(null);
      }
    }
  };

  const handleDownloadInputs = () => {
    if (images.length === 0) return;
    images.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(img.file);
        link.download = img.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
  };

  // Function to resize/upscale image via Canvas for "HD/FHD/UHD" download simulation
  const handleSmartDownload = (url: string, quality: 'HD' | 'FHD' | 'UHD') => {
    setDownloadingQuality(quality);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    
    img.onload = () => {
        let targetSize = 1280; // HD default
        if (quality === 'FHD') targetSize = 1920;
        if (quality === 'UHD') targetSize = 3840; // 4K

        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth, newHeight;

        if (img.width > img.height) {
            newWidth = targetSize;
            newHeight = targetSize / aspectRatio;
        } else {
            newHeight = targetSize;
            newWidth = targetSize * aspectRatio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Use better interpolation if browser supports it
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `Andri-AI-${quality}-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setDownloadingQuality(null);
    };

    img.onerror = () => {
        alert("Gagal memproses gambar.");
        setDownloadingQuality(null);
    };
  };

  const handleGenerate = async () => {
    if (images.length < feature.minImages) {
      setError(`Silakan unggah minimal ${feature.minImages} gambar untuk melanjutkan.`);
      return;
    }
    
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Silakan masukkan instruksi.");
      return;
    }

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      setError(`Instruksi terlalu panjang. Maksimal ${MAX_PROMPT_LENGTH} karakter.`);
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedResults([]);

    try {
      let results: string[] = [];
      
      if (isVideoMode) {
        // Video generation (Single Result)
        const videoUrl = await generateVideo(trimmedPrompt, images, ratio, videoQuality);
        results = [videoUrl];
      } else {
        // Image generation (Batch 4 Results)
        // We use generateBatchImages to get 4 variations
        results = await generateBatchImages(trimmedPrompt, images, ratio, feature.id, 4);
      }

      setGeneratedResults(results);
      saveHistory(results);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 5)); // Max 5x
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPan({ x: 0, y: 0 }); // Reset pan if zoomed out fully
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault(); // Prevent default drag behavior
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPan({ x: newX, y: newY });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500 relative">
      
      {/* PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col items-center">
              
              {/* Toolbar */}
              <div className="absolute top-0 right-0 p-4 flex gap-4 z-50">
                 <button 
                   onClick={() => setPreviewImage(null)}
                   className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Main Image with Zoom/Pan */}
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden mb-6 relative bg-black/20 rounded-lg">
                <div 
                  className={`relative w-full h-full flex items-center justify-center overflow-hidden ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseLeave}
                >
                    <img 
                      src={previewImage} 
                      alt="Full Preview" 
                      draggable={false}
                      style={{ 
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                      }}
                      className="max-w-full max-h-full object-contain" 
                    />
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl z-40">
                    <button 
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                      disabled={zoom <= 1}
                      title="Zoom Out"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-xs font-mono text-white min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                    <button 
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                      disabled={zoom >= 5}
                      title="Zoom In"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-1"></div>
                    <button 
                      onClick={handleResetZoom}
                      className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                      title="Reset View"
                    >
                      <RotateCcw size={18} />
                    </button>
                </div>
              </div>

              {/* Download Options */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-2xl">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Download className="text-emerald-400" size={20} /> Pilih Kualitas Download
                 </h3>
                 <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => handleSmartDownload(previewImage, 'HD')}
                      disabled={!!downloadingQuality}
                      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all group"
                    >
                       <span className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-400">HD</span>
                       <span className="text-xs text-slate-400">1280px</span>
                       {downloadingQuality === 'HD' && <div className="mt-2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                    </button>

                    <button 
                      onClick={() => handleSmartDownload(previewImage, 'FHD')}
                      disabled={!!downloadingQuality}
                      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all group"
                    >
                       <span className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400">FHD</span>
                       <span className="text-xs text-slate-400">1920px</span>
                       {downloadingQuality === 'FHD' && <div className="mt-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                    </button>

                    <button 
                      onClick={() => handleSmartDownload(previewImage, 'UHD')}
                      disabled={!!downloadingQuality}
                      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all group"
                    >
                       <div className="flex items-center gap-1 mb-1">
                          <span className="text-2xl font-bold text-white group-hover:text-purple-400">UHD</span>
                          <span className="bg-purple-500 text-white text-[9px] font-bold px-1 rounded">4K</span>
                       </div>
                       <span className="text-xs text-slate-400">3840px</span>
                       {downloadingQuality === 'UHD' && <div className="mt-2 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                    </button>
                 </div>
              </div>

           </div>
        </div>
      )}
      
      {/* History Toggle Button */}
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="fixed bottom-6 left-6 md:top-24 md:left-auto md:right-10 z-40 bg-white text-slate-700 shadow-xl p-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 group"
      >
        <History size={20} className="text-emerald-600" />
        <span className="font-bold text-sm hidden group-hover:block whitespace-nowrap pr-2">Riwayat</span>
        {history.length > 0 && (
           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
             {history.length}
           </span>
        )}
      </button>

      {/* History Sidebar/Drawer */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right border-l border-slate-100">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <Clock size={18} className="text-emerald-500" /> Riwayat Generasi
             </h3>
             <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
               <X size={20} />
             </button>
           </div>
           
           <div className="space-y-4">
             {history.length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">
                 Belum ada riwayat.
               </div>
             ) : (
               history.map((item) => (
                 <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer" onClick={() => restoreHistoryItem(item)}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                         {item.mode}
                       </span>
                       <button onClick={(e) => deleteHistoryItem(item.id, e)} className="text-slate-300 hover:text-red-500">
                         <Trash2 size={14} />
                       </button>
                    </div>
                    {item.type === 'video' ? (
                       <div className="aspect-video bg-black rounded-lg mb-2 flex items-center justify-center text-white">
                         <Video size={20} />
                       </div>
                    ) : (
                       <img src={item.thumbnail} alt="History" className="w-full h-32 object-cover rounded-lg mb-2 bg-slate-200" />
                    )}
                    <p className="text-xs text-slate-600 line-clamp-2 italic">"{item.prompt}"</p>
                    <div className="text-[10px] text-slate-400 mt-2 text-right">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}
      
      {/* Feature Header */}
      <header className="mb-8 text-center">
         <h2 className="text-3xl md:text-4xl font-bold text-emerald-500 tracking-tight mb-2 flex items-center justify-center gap-3">
           {isVideoMode ? <Video size={36} /> : null}
           {feature.title}
         </h2>
         <p className="text-slate-500 max-w-2xl mx-auto">{feature.description}</p>
      </header>

      {/* Example Showcase (Before / After) */}
      <FeatureExample mode={feature.id} />

      {/* Info Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6 flex items-start gap-3">
        <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 mt-0.5">
          <Wand2 size={16} />
        </div>
        <p className="text-emerald-800 text-sm leading-relaxed">
          {isVideoMode 
             ? "Pembuatan video memerlukan waktu beberapa menit. Browser Anda mungkin akan meminta izin untuk menggunakan API Key berbayar."
             : feature.minImages > 0 
                ? `Unggah ${feature.minImages}-${feature.maxImages} gambar, tulis instruksi, dan AI akan membuat 4 variasi sekaligus.` 
                : "Tulis instruksi detail untuk membuat 4 variasi gambar baru dari awal."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-6 space-y-8">
          
          {/* Step 1: Upload (Only if maxImages > 0) */}
          {feature.maxImages > 0 && (
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  1. Unggah {isVideoMode ? "Referensi (Opsional)" : "Gambar"} <span className="text-sm font-normal text-slate-500">(min {feature.minImages}, maks {feature.maxImages})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {images.length} / {feature.maxImages} terunggah
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md aspect-[4/5]">
                    {/* Image Preview */}
                    <img src={img.previewUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Label Badge (Context Aware) */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-white/10 shadow-sm">
                      {getImageLabel(index, feature.id)}
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
                    >
                      <X size={14} />
                    </button>

                    {/* Reorder Controls */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => moveImage(index, 'left')}
                          disabled={index === 0}
                          className={`p-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 ${index === 0 ? 'bg-slate-800/30 text-slate-400 cursor-not-allowed' : 'bg-slate-900/70 text-white hover:bg-slate-900'}`}
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button 
                          onClick={() => moveImage(index, 'right')}
                          disabled={index === images.length - 1}
                          className={`p-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 ${index === images.length - 1 ? 'bg-slate-800/30 text-slate-400 cursor-not-allowed' : 'bg-slate-900/70 text-white hover:bg-slate-900'}`}
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Upload Button */}
                {images.length < feature.maxImages && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/5] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                      <ImagePlus className="text-slate-400 group-hover:text-emerald-600" size={24} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700">Tambah Foto</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                      multiple={feature.maxImages > 1}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Instruction */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex justify-between items-center">
              <span>{feature.maxImages > 0 ? "2. Instruksi" : "1. Instruksi"}</span>
              <span className="text-xs font-normal text-slate-400">Wajib diisi</span>
            </h3>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                maxLength={MAX_PROMPT_LENGTH}
                className={`w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed transition-colors ${
                    error === "Silakan masukkan instruksi." 
                      ? 'border-red-500 bg-red-900/10 text-slate-800 placeholder:text-red-400' 
                      : 'bg-slate-900 border-slate-700 text-emerald-50 placeholder:text-slate-500'
                  }`}
                placeholder={isVideoMode ? "Deskripsikan video yang ingin dibuat (Contoh: Kucing terbang di luar angkasa, neon style)..." : "Deskripsikan hasil yang Anda inginkan..."}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                 {/* Character Counter */}
                 <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                     prompt.length >= MAX_PROMPT_LENGTH ? 'bg-red-500 text-white' : 
                     prompt.length > MAX_PROMPT_LENGTH * 0.9 ? 'bg-amber-500 text-white' : 
                     'bg-slate-800 text-slate-400 border border-slate-700'
                 }`}>
                    {prompt.length}/{MAX_PROMPT_LENGTH}
                 </span>
                 <div className="text-slate-400 bg-slate-800/80 backdrop-blur-sm p-1 rounded-md border border-slate-700">
                    <Wand2 size={14} />
                 </div>
              </div>
            </div>
          </div>

          {/* Step 3: Ratio & Quality (For Video) */}
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Ratio Selection */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {feature.maxImages > 0 ? "3. Pilih Rasio" : "2. Pilih Rasio"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {!isVideoMode && (
                    <RatioOption 
                        active={ratio === AspectRatio.SQUARE} 
                        onClick={() => setRatio(AspectRatio.SQUARE)}
                        label="1:1"
                        icon={<div className="w-4 h-4 border-2 border-current rounded-sm" />}
                    />
                  )}
                  <RatioOption 
                    active={ratio === AspectRatio.LANDSCAPE} 
                    onClick={() => setRatio(AspectRatio.LANDSCAPE)}
                    label="16:9"
                    icon={<div className="w-5 h-3 border-2 border-current rounded-sm" />}
                  />
                  <RatioOption 
                    active={ratio === AspectRatio.PORTRAIT} 
                    onClick={() => setRatio(AspectRatio.PORTRAIT)}
                    label="9:16"
                    icon={<div className="w-3 h-5 border-2 border-current rounded-sm" />}
                  />
                </div>
              </div>

              {/* Video Quality Selection (Only for Video) */}
              {isVideoMode && (
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings2 size={18} /> Kualitas Video
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setVideoQuality('720p')}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        videoQuality === '720p'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Standard 720p</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Cepat</span>
                    </button>
                    <button
                      onClick={() => setVideoQuality('1080p')}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        videoQuality === '1080p'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>High 1080p</span>
                      <span className="text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-600">HD</span>
                    </button>
                    <button
                      onClick={() => setVideoQuality('4k')}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        videoQuality === '4k'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Ultra Quality</span>
                      <span className="text-xs bg-amber-100 px-2 py-0.5 rounded text-amber-600">Pro</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]
              ${loading 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : isVideoMode 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 hover:shadow-purple-300'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300'
              }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isVideoMode ? "Sedang Merender Video (Mohon Tunggu)..." : "Sedang Memproses 4 Variasi..."}</span>
              </>
            ) : (
              <>
                {isVideoMode ? <Video size={20} /> : <Sparkles size={20} />}
                <span>{isVideoMode ? "Buat Video" : "Buat 4 Variasi Hasil"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section (Grid for 4 images) */}
      {generatedResults.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="text-emerald-500" /> Hasil Andri AI ({generatedResults.length})
          </h3>
          
          <div className={`grid gap-4 ${isVideoMode || generatedResults.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {generatedResults.map((result, idx) => (
                <div key={idx} className="bg-slate-100 rounded-lg p-2 group relative">
                    {isVideoMode ? (
                        <video 
                            controls 
                            autoPlay 
                            loop
                            src={result} 
                            className="w-full rounded-lg shadow-md"
                        >
                            Browser Anda tidak mendukung tag video.
                        </video>
                    ) : (
                        <div className="relative cursor-zoom-in" onClick={() => setPreviewImage(result)}>
                            <img 
                                src={result} 
                                alt={`Result ${idx + 1}`} 
                                className="w-full h-auto rounded-lg shadow-md hover:opacity-95 transition-opacity" 
                            />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  className="bg-white text-slate-800 p-1.5 rounded-full shadow-lg hover:bg-emerald-500 hover:text-white transition-colors"
                                  title="Pratinjau & Download"
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
          </div>
          
          {/* Result Actions */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-6">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-colors flex items-center gap-2 w-full md:w-auto justify-center group"
            >
                <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                Generate 4 New Variations
            </button>

             {/* Download All Helper for Images */}
             {!isVideoMode && (
                 <button 
                  onClick={() => {
                      generatedResults.forEach((url, i) => {
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `andri-ai-result-${i+1}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                      });
                  }}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm flex items-center gap-2 shadow-lg shadow-slate-200 w-full md:w-auto justify-center"
                 >
                     <FileDown size={16} /> Unduh Semua Hasil
                 </button>
             )}
          </div>

          {/* Download Inputs */}
          {images.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleDownloadInputs}
                className="inline-flex items-center gap-2 text-slate-400 text-xs hover:text-emerald-600 transition-colors py-2 px-4 rounded-full hover:bg-emerald-50"
                title="Unduh semua file yang Anda unggah"
              >
                <FileDown size={14} />
                Unduh {images.length} Gambar Sumber (Original)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RatioOption: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
      active 
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-500' 
        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
    }`}
  >
    <div className={active ? 'text-emerald-600' : 'text-slate-400'}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

export default ImageMerger;
