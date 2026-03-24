import React, { useState, useRef } from 'react';
import { 
    X, Plus, Wand2, Sparkles, AlertCircle, ImagePlus, 
    Maximize2, Download, Play, Loader2, Image as ImageIcon, AudioLines, Video
} from 'lucide-react';
import { UploadedImage, AspectRatio, FeatureConfig, FeatureMode } from '../types';
import { generateImage, generateSpeech, generateVideo, saveHistoryWithPruning, enhancePrompt } from '../services/geminiService';

interface ImageMergerProps {
  feature: FeatureConfig;
  onNavigate: (mode: FeatureMode) => void;
}

export const ImageMerger: React.FC<ImageMergerProps> = ({ feature, onNavigate }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numResults, setNumResults] = useState(2);
  const [bananaMode, setBananaMode] = useState<'fast' | 'pro'>('fast');
  const [voiceName, setVoiceName] = useState<string>('Bram');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPrompt(feature.defaultPrompt || '');
    setImages([]);
    setGeneratedResults([]);
    setError(null);
  }, [feature]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages(prev => [...prev, ...newImages].slice(0, feature.maxImages || 5));
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err: any) {
      setError(err.message || "Gagal menyempurnakan prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    const minRequired = feature.minImages ?? 1;
    if (images.length < minRequired) {
        setError(`Minimal ${minRequired} gambar dibutuhkan.`);
        return;
    }
    if (!prompt.trim()) {
        setError("Instruksi tidak boleh kosong.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const results: string[] = [];
      
      if (feature.type === 'audio') {
          const audioUrl = await generateSpeech(prompt, voiceName);
          results.push(audioUrl);
      } else if (feature.type === 'video') {
          const videoUrl = await generateVideo(prompt, images, ratio, feature.id);
          results.push(videoUrl);
      } else {
          for (let i = 0; i < numResults; i++) {
            // Add a small delay between requests to avoid rate limits if generating multiple
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
            const img = await generateImage(prompt, images, ratio, feature.id, { bananaMode });
            results.push(img);
          }
      }
      
      setGeneratedResults(results);

      saveHistoryWithPruning({
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: feature.id,
        prompt,
        results: results,
        thumbnail: results[0],
        type: feature.type || 'image'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const RATIOS = [
      { id: AspectRatio.SQUARE, label: '1:1', icon: <div className="w-4 h-4 border-2 border-current rounded-sm"></div> },
      { id: AspectRatio.PORTRAIT_3_4, label: '3:4', icon: <div className="w-3 h-4 border-2 border-current rounded-sm"></div> },
      { id: AspectRatio.PORTRAIT_4_3, label: '4:3', icon: <div className="w-4 h-3 border-2 border-current rounded-sm"></div> },
      { id: AspectRatio.PORTRAIT, label: '9:16', icon: <div className="w-2.5 h-4 border-2 border-current rounded-sm"></div> },
      { id: AspectRatio.LANDSCAPE, label: '16:9', icon: <div className="w-4 h-2.5 border-2 border-current rounded-sm"></div> },
  ];

  let stepCounter = 1;

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-8 pb-20 relative">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 mt-8 mb-4 relative z-10">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
                {feature.title.split(' ')[0]} <span className="text-emerald-500">{feature.title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl">
                {feature.description}
            </p>
            <button className="mt-2 bg-[#1e2128] text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg">
                <Play size={14} className="text-emerald-400" /> Lihat Tutorial
            </button>
        </header>

        {/* Crescent Moon Decoration */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply opacity-50 pointer-events-none" style={{ clipPath: 'circle(50% at 70% 50%)' }}></div>
        <div className="absolute top-12 right-24 text-amber-200 pointer-events-none">
            <Sparkles size={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* Left Panel - Inputs */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl flex flex-col gap-8">
                
                {/* Step 1: Bahan Gambar */}
                {(feature.maxImages || 0) > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">{stepCounter++}</div>
                                <h3 className="font-bold text-slate-800">Bahan Gambar</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                {feature.minImages === feature.maxImages ? `Max ${feature.maxImages}` : `Min ${feature.minImages || 1} - Max ${feature.maxImages || 5}`}
                            </span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {images.map(img => (
                                <div key={img.id} className="flex-shrink-0 w-20 h-20 relative rounded-xl overflow-hidden border border-slate-200 group">
                                    <img src={img.previewUrl} className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setImages(images.filter(i => i.id !== img.id))} 
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                    >
                                        <X size={10}/>
                                    </button>
                                </div>
                            ))}
                            
                            {/* Empty Slots */}
                            {Array.from({ length: Math.max(feature.minImages || 1, (feature.maxImages || 5) - images.length) }).slice(0, (feature.maxImages || 5) - images.length).map((_, i) => (
                                <button 
                                    key={`empty-${i}`}
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors bg-slate-50"
                                >
                                    <Plus size={20}/>
                                </button>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                    </div>
                )}

                {/* Step 2: Instruksi */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">{stepCounter++}</div>
                        <h3 className="font-bold text-slate-800">Instruksi</h3>
                    </div>
                    <div className="relative">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                            placeholder={feature.defaultPrompt || "Jelaskan apa yang ingin Anda buat..."}
                        />
                        {feature.type !== 'audio' && (
                            <button 
                                onClick={handleEnhance}
                                disabled={isEnhancing || !prompt.trim()}
                                className="absolute right-3 top-3 p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title="Sempurnakan Prompt dengan AI"
                            >
                                {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Voice Selector for Audio */}
                {feature.type === 'audio' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">{stepCounter++}</div>
                            <h3 className="font-bold text-slate-800">Pilihan Suara</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {['Bram', 'Puck', 'Charon', 'Kore', 'Zephyr'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setVoiceName(v)}
                                    className={`py-3 rounded-xl font-bold transition-all border text-sm ${
                                        voiceName === v
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Banana AI Mode Toggle */}
                {feature.id === 'banana' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">★</div>
                            <h3 className="font-bold text-slate-800">Mode Generasi</h3>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setBananaMode('fast')}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${bananaMode === 'fast' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                ⚡ Fast (Unlimited)
                            </button>
                            <button 
                                onClick={() => setBananaMode('pro')}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${bananaMode === 'pro' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                👑 Pro (High Detail)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Jumlah Hasil */}
                {feature.type !== 'audio' && feature.type !== 'video' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">{stepCounter++}</div>
                            <h3 className="font-bold text-slate-800">Jumlah Hasil</h3>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setNumResults(num)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                                        numResults === num
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Format Gambar */}
                {feature.type !== 'audio' && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">{stepCounter++}</div>
                            <h3 className="font-bold text-slate-800">Format {feature.type === 'video' ? 'Video' : 'Gambar'}</h3>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {RATIOS.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setRatio(r.id)}
                                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                        ratio === r.id 
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {r.icon}
                                    <span className="text-[10px] font-bold">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <button 
                    onClick={handleGenerate}
                    disabled={loading || images.length < (feature.minImages ?? 1) || !prompt.trim()}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                        loading || images.length < (feature.minImages ?? 1) || !prompt.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-sm'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    Mulai {feature.type === 'audio' ? 'Generate Suara' : feature.type === 'video' ? 'Generate Video' : 'Penggabungan'}
                </button>

                {error && (
                    <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                        <AlertCircle size={14}/> {error}
                    </div>
                )}
            </div>

            {/* Right Panel - Output */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl flex flex-col items-center justify-center p-12 text-center min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Memproses {feature.type === 'audio' ? 'Suara' : feature.type === 'video' ? 'Video' : 'Gambar'}...</h3>
                        <p className="text-sm text-slate-500">AI sedang memproses permintaan Anda.</p>
                    </div>
                ) : generatedResults.length > 0 ? (
                    <div className="w-full h-full flex flex-col gap-4">
                        <div className={`grid gap-4 w-full ${generatedResults.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {generatedResults.map((res, idx) => (
                                <div key={idx} className={`relative w-full ${feature.type === 'audio' ? 'h-32' : 'aspect-square'} rounded-2xl overflow-hidden border border-slate-200 shadow-sm group`}>
                                    {feature.type === 'audio' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-4 gap-4">
                                            <AudioLines size={32} className="text-emerald-500" />
                                            <audio controls src={res} className="w-full max-w-xs" />
                                        </div>
                                    ) : feature.type === 'video' ? (
                                        <video controls src={res} className="w-full h-full object-contain bg-black" />
                                    ) : (
                                        <img src={res} className="w-full h-full object-contain bg-slate-50" />
                                    )}
                                    
                                    {feature.type !== 'audio' && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={() => window.open(res)} className="p-3 bg-white text-slate-800 rounded-xl hover:scale-110 transition-transform">
                                                <Maximize2 size={20} />
                                            </button>
                                            <a href={res} download={`hasil-${feature.type}-${idx + 1}.${feature.type === 'video' ? 'mp4' : 'png'}`} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-transform">
                                                <Download size={20} />
                                            </a>
                                        </div>
                                    )}
                                    {feature.type === 'audio' && (
                                        <div className="absolute top-2 right-2">
                                            <a href={res} download={`hasil-audio-${idx + 1}.wav`} className="p-2 bg-emerald-500 text-white rounded-lg hover:scale-110 transition-transform inline-block">
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-slate-50 rounded-full scale-150 opacity-50"></div>
                            <div className="absolute inset-0 bg-slate-100 rounded-full scale-110 opacity-50"></div>
                            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center relative z-10 rotate-12">
                                {feature.type === 'audio' ? <AudioLines size={32} /> : feature.type === 'video' ? <Video size={32} /> : <ImageIcon size={32} />}
                            </div>
                            <div className="absolute top-4 right-4 text-slate-300 z-20">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Hasil</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                {feature.type === 'audio' 
                                    ? 'Masukkan teks dan klik tombol buat untuk mendengar suara AI.' 
                                    : 'Pilih gambar, atur rasio, dan klik tombol buat untuk melihat keajaiban AI di sini.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ImageMerger;
