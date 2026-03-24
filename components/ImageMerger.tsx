import React, { useState, useRef } from 'react';
import { 
    X, Plus, Wand2, Sparkles, AlertCircle, ImagePlus, 
    Maximize2, Download, Play, Loader2, Image as ImageIcon
} from 'lucide-react';
import { UploadedImage, AspectRatio, FeatureConfig, FeatureMode } from '../types';
import { generateImage, saveHistoryWithPruning } from '../services/geminiService';

interface ImageMergerProps {
  feature: FeatureConfig;
  onNavigate: (mode: FeatureMode) => void;
}

export const ImageMerger: React.FC<ImageMergerProps> = ({ feature, onNavigate }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numResults, setNumResults] = useState(4);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleGenerate = async () => {
    if (images.length < (feature.minImages || 1)) {
        setError(`Minimal ${feature.minImages || 1} gambar dibutuhkan.`);
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
      for (let i = 0; i < numResults; i++) {
        // Add a small delay between requests to avoid rate limits if generating multiple
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
        const img = await generateImage(prompt, images, ratio, feature.id, {});
        results.push(img);
      }
      
      setGeneratedResults(results);

      saveHistoryWithPruning({
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: feature.id,
        prompt,
        results: results,
        thumbnail: results[0],
        type: 'image'
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
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">1</div>
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

                {/* Step 2: Instruksi */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="font-bold text-slate-800">Instruksi</h3>
                    </div>
                    <div className="relative">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                            placeholder={feature.defaultPrompt || "Jelaskan apa yang ingin Anda buat..."}
                        />
                        <button className="absolute right-3 top-3 p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-colors">
                            <Wand2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Step 3: Jumlah Hasil */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">3</div>
                        <h3 className="font-bold text-slate-800">Jumlah Hasil</h3>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <input 
                            type="range" 
                            min="1" 
                            max="4" 
                            value={numResults}
                            onChange={(e) => setNumResults(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="text-center min-w-[3rem]">
                            <div className="font-bold text-slate-800">{numResults}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Gambar</div>
                        </div>
                    </div>
                </div>

                {/* Step 4: Format Gambar */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1e2128] text-white flex items-center justify-center text-xs font-bold">4</div>
                        <h3 className="font-bold text-slate-800">Format Gambar</h3>
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

                {/* Generate Button */}
                <button 
                    onClick={handleGenerate}
                    disabled={loading || images.length < 2 || !prompt.trim()}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                        loading || images.length < 2 || !prompt.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-sm'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    Mulai Penggabungan
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
                        <h3 className="text-xl font-bold text-slate-800">Memproses Gambar...</h3>
                        <p className="text-sm text-slate-500">AI sedang menggabungkan imajinasi Anda.</p>
                    </div>
                ) : generatedResults.length > 0 ? (
                    <div className="w-full h-full flex flex-col gap-4">
                        <div className={`grid gap-4 ${generatedResults.length === 1 ? 'grid-cols-1' : generatedResults.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {generatedResults.map((res, idx) => (
                                <div key={idx} className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                                    <img src={res} className="w-full h-full object-contain bg-slate-50" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button onClick={() => window.open(res)} className="p-3 bg-white text-slate-800 rounded-xl hover:scale-110 transition-transform">
                                            <Maximize2 size={20} />
                                        </button>
                                        <a href={res} download={`hasil-gabung-${idx + 1}.png`} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-transform">
                                            <Download size={20} />
                                        </a>
                                    </div>
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
                                <ImageIcon size={32} />
                            </div>
                            <div className="absolute top-4 right-4 text-slate-300 z-20">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Hasil</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Pilih gambar, atur rasio, dan klik tombol buat untuk melihat keajaiban AI di sini.
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
