
import React, { useState, useEffect } from 'react';
import { 
    Images, 
    Trash2, 
    Download, 
    Maximize2, 
    Search, 
    Filter, 
    X, 
    Calendar, 
    Sparkles, 
    Image as ImageIcon,
    Video,
    RotateCcw,
    Zap,
    ArrowUpCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Layers,
    Star,
    SplitSquareHorizontal,
    Check,
    ArrowLeftRight,
    Play,
    Cpu,
    Clock,
    MousePointer2
} from 'lucide-react';
import { HistoryItem, FeatureMode } from '../types';
import { upscaleImage } from '../services/huggingfaceService';

// Helper to flatten history items into individual images
interface GalleryItem {
    id: string; // Unique ID composed of historyId-index
    historyId: string;
    url: string;
    prompt: string;
    mode: FeatureMode;
    timestamp: number;
    type: 'image' | 'video';
}

interface GalleryProps {
    onNavigate?: (mode: FeatureMode) => void;
}

const ITEMS_PER_PAGE = 24;

const getModelName = (mode: FeatureMode): string => {
    if (mode === 'banana') return 'Pollinations AI (Flux/SDXL)';
    if (mode === 'veo') return 'Google Veo 3 (Video)';
    if (mode === 'imagine' || mode === 'edit') return 'Gemini 2.5 Flash';
    if (mode === 'tts') return 'Gemini 2.5 Audio';
    return 'Gemini 3 Pro Vision';
};

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [filterMode, setFilterMode] = useState<FeatureMode | 'all' | 'favorites'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    
    // UI Effects
    const [isGlitching, setIsGlitching] = useState(false);
    
    // Upscaling States
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
    const [upscaleError, setUpscaleError] = useState<string | null>(null);

    // Comparison States
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<GalleryItem[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [compareSliderPos, setCompareSliderPos] = useState(50);
    const [compareMode, setCompareMode] = useState<'slider' | 'split'>('slider');

    // Trigger Glitch Effect on state change
    useEffect(() => {
        setIsGlitching(true);
        const timer = setTimeout(() => setIsGlitching(false), 500);
        return () => clearTimeout(timer);
    }, [filterMode, searchTerm, currentPage]);

    // Reset upscale state when selected item changes
    useEffect(() => {
        setUpscaledUrl(null);
        setUpscaleError(null);
        setIsUpscaling(false);
    }, [selectedItem]);

    // Reset pagination when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterMode, searchTerm]);

    // Load Favorites
    useEffect(() => {
        try {
            const savedFavs = localStorage.getItem('andri_ai_favorites');
            if (savedFavs) {
                setFavorites(new Set(JSON.parse(savedFavs)));
            }
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    }, []);

    // Load and flatten history
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('andri_ai_history');
            if (savedHistory) {
                const parsed: HistoryItem[] = JSON.parse(savedHistory);
                
                const flattened: GalleryItem[] = [];
                parsed.forEach(item => {
                    item.results.forEach((res, idx) => {
                        const isVideo = item.type === 'video' || res.includes('data:video') || res.includes('.mp4');
                        
                        flattened.push({
                            id: `${item.id}-${idx}`,
                            historyId: item.id,
                            url: res,
                            prompt: item.prompt,
                            mode: item.mode,
                            timestamp: item.timestamp,
                            type: isVideo ? 'video' : 'image'
                        });
                    });
                });
                
                flattened.sort((a, b) => b.timestamp - a.timestamp);
                setGalleryItems(flattened);
            }
        } catch (e) {
            console.error("Failed to load gallery", e);
        }
    }, []);

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavs = new Set(favorites);
        if (newFavs.has(id)) {
            newFavs.delete(id);
        } else {
            newFavs.add(id);
        }
        setFavorites(newFavs);
        localStorage.setItem('andri_ai_favorites', JSON.stringify(Array.from(newFavs)));
    };

    const handleDelete = (itemId: string, historyId: string) => {
        if (!confirm("Hapus gambar ini dari galeri?")) return;

        const newGallery = galleryItems.filter(i => i.id !== itemId);
        setGalleryItems(newGallery);

        if (favorites.has(itemId)) {
            const newFavs = new Set(favorites);
            newFavs.delete(itemId);
            setFavorites(newFavs);
            localStorage.setItem('andri_ai_favorites', JSON.stringify(Array.from(newFavs)));
        }

        try {
            const savedHistory = localStorage.getItem('andri_ai_history');
            if (savedHistory) {
                let parsed: HistoryItem[] = JSON.parse(savedHistory);
                const targetHistoryIndex = parsed.findIndex(h => h.id === historyId);
                if (targetHistoryIndex !== -1) {
                    const target = parsed[targetHistoryIndex];
                    const urlToRemove = galleryItems.find(g => g.id === itemId)?.url;
                    target.results = target.results.filter(r => r !== urlToRemove);
                    if (target.results.length === 0) {
                        parsed = parsed.filter(h => h.id !== historyId);
                    } else {
                        parsed[targetHistoryIndex] = target;
                    }
                    localStorage.setItem('andri_ai_history', JSON.stringify(parsed));
                }
            }
        } catch (e) {
            console.error("Failed to delete", e);
        }
        
        if (selectedItem?.id === itemId) setSelectedItem(null);
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpscale = async () => {
        if (!selectedItem || selectedItem.type === 'video') return;
        setIsUpscaling(true);
        setUpscaleError(null);
        try {
            const response = await fetch(selectedItem.url);
            const blob = await response.blob();
            const resultUrl = await upscaleImage(blob);
            setUpscaledUrl(resultUrl);
        } catch (err: any) {
            setUpscaleError(err.message || "Gagal melakukan upscale.");
        } finally {
            setIsUpscaling(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedForCompare([]);
    };

    const handleSelectForCompare = (item: GalleryItem) => {
        if (selectedForCompare.find(i => i.id === item.id)) {
            setSelectedForCompare(prev => prev.filter(i => i.id !== item.id));
        } else {
            if (selectedForCompare.length < 2) {
                setSelectedForCompare(prev => [...prev, item]);
            } else {
                setSelectedForCompare(prev => [prev[0], item]);
            }
        }
    };

    const startComparison = () => {
        if (selectedForCompare.length === 2) {
            setShowCompareModal(true);
            setCompareSliderPos(50);
            setCompareMode('slider');
        }
    };

    const renderCompareMedia = (item: GalleryItem, className: string = "") => {
        if (item.type === 'video') {
            return (
                <div className={`relative ${className} bg-black flex items-center justify-center overflow-hidden`}>
                    <video src={item.url} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded-full pointer-events-none">
                         <Play size={10} fill="currentColor" />
                    </div>
                </div>
            );
        }
        return <img src={item.url} className={`${className} object-contain`} draggable={false} alt="Comparison" />;
    };

    const filteredItems = galleryItems.filter(item => {
        const matchesSearch = item.prompt.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterMode === 'favorites') return favorites.has(item.id) && matchesSearch;
        const matchesMode = filterMode === 'all' || item.mode === filterMode;
        return matchesMode && matchesSearch;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const availableModes = Array.from(new Set(galleryItems.map(i => i.mode)));

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[80vh]">
            
            <div className="bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20">
                                <Images className="text-white" size={28} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                                Galeri <span className="text-emerald-500">Hasil AI</span>
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-light ml-1">
                            Kelola dan bandingkan setiap karya masterpiece Anda.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                         <button 
                            onClick={toggleSelectionMode}
                            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black transition-all border ${
                                isSelectionMode 
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-500/30 shadow-2xl scale-105' 
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400'
                            }`}
                        >
                            <SplitSquareHorizontal size={20} />
                            <span>{isSelectionMode ? 'Batal Banding' : 'Compare Mode'}</span>
                        </button>

                        <div className="relative group flex-1 sm:flex-none">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari prompt..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-60 pl-12 pr-10 py-3.5 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-emerald-500 outline-none text-sm transition-all text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="relative group flex-1 sm:flex-none">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <select 
                                value={filterMode}
                                onChange={(e) => setFilterMode(e.target.value as any)}
                                className="w-full sm:w-48 pl-12 pr-10 py-3.5 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm font-bold capitalize text-slate-900 dark:text-white"
                            >
                                <option value="all">Semua Kategori</option>
                                <option value="favorites">⭐ Favorit Saya</option>
                                {availableModes.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {filteredItems.length > 0 && isSelectionMode && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between animate-in slide-in-from-top-4">
                         <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-black border border-indigo-500/20 flex items-center gap-2">
                                <MousePointer2 size={14} /> PILIH 2 ITEM
                            </div>
                            <div className="flex gap-2">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className={`w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${selectedForCompare[i] ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-white/10'}`}>
                                        {selectedForCompare[i] ? (
                                            <img src={selectedForCompare[i].url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold">{i + 1}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                         </div>
                         <button 
                            onClick={startComparison}
                            disabled={selectedForCompare.length !== 2}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2"
                        >
                            Mulai Komparasi <ArrowLeftRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-32 bg-white/50 dark:bg-[#0c0c0e]/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ImageIcon className="text-slate-300 dark:text-slate-600" size={56} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">Koleksi Kosong</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed text-lg">
                        Mulai petualangan kreatif Anda dan hasilkan karya menakjubkan dengan AI kami.
                    </p>
                    <button 
                        onClick={() => onNavigate?.('imagine')}
                        className="mt-10 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-full transition-all shadow-2xl shadow-emerald-500/30 hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <Zap size={20} /> Buat Sekarang
                    </button>
                </div>
            ) : (
                <>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 glitch-effect ${isGlitching ? 'active-glitch' : ''}`}>
                        {paginatedItems.map((item) => {
                            const isSelected = selectedForCompare.some(i => i.id === item.id);
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={`group relative aspect-square bg-white dark:bg-[#1a1a1c] rounded-3xl overflow-hidden shadow-lg border transition-all duration-500 cursor-pointer
                                        ${isSelectionMode 
                                            ? (isSelected 
                                                ? 'ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-[#050505] scale-95 shadow-2xl shadow-indigo-500/40' 
                                                : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0')
                                            : 'border-slate-200 dark:border-white/5 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2'
                                        }
                                    `}
                                    onClick={() => isSelectionMode ? handleSelectForCompare(item) : setSelectedItem(item)}
                                >
                                    {isSelectionMode && isSelected && (
                                        <div className="absolute top-3 right-3 z-20 w-8 h-8 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg animate-in zoom-in">
                                            <Check size={18} strokeWidth={4} />
                                        </div>
                                    )}

                                    {item.type === 'video' ? (
                                        <div className="w-full h-full relative">
                                            <video src={item.url} className="w-full h-full object-cover" muted />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                                                    <Play size={24} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={item.url} alt={item.prompt} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    )}
                                    
                                    {!isSelectionMode && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                            <div className="flex gap-2 justify-end mb-auto pt-1 transform -translate-y-4 group-hover:translate-y-0 transition-transform">
                                                <button 
                                                    onClick={(e) => toggleFavorite(e, item.id)}
                                                    className={`p-2.5 rounded-xl transition-all shadow-lg border border-white/10 ${favorites.has(item.id) ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-amber-500'}`}
                                                >
                                                    <Star size={18} fill={favorites.has(item.id) ? "currentColor" : "none"} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(item.url, `INDIGITAL-${item.id}.png`); }}
                                                    className="p-2.5 bg-white/10 hover:bg-emerald-500 rounded-xl text-white transition-all shadow-lg border border-white/10"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.historyId); }}
                                                    className="p-2.5 bg-white/10 hover:bg-red-500 rounded-xl text-white transition-all shadow-lg border border-white/10"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">
                                                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md mb-2 inline-block uppercase tracking-widest">{item.mode}</span>
                                                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">{item.prompt}</p>
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'video' && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-pink-500 text-white text-[10px] font-black rounded-lg shadow-lg">VIDEO</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-20 flex items-center justify-center">
                            <div className="flex items-center gap-6 bg-white dark:bg-[#0c0c0e] p-3 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-20 transition-all text-slate-700 dark:text-white"
                                >
                                    <ChevronLeft size={24} strokeWidth={3} />
                                </button>
                                
                                <div className="text-center min-w-[120px]">
                                    <div className="text-sm font-black text-slate-800 dark:text-white">HALAMAN {currentPage}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DARI {totalPages} PAGES</div>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-20 transition-all text-slate-700 dark:text-white"
                                >
                                    <ChevronRight size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Comparison Modal */}
            {showCompareModal && selectedForCompare.length === 2 && (
                <div className="fixed inset-0 z-[120] bg-black/98 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
                    <div className="absolute top-6 right-6 flex gap-4 z-[130]">
                        <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10">
                            <button 
                                onClick={() => setCompareMode('slider')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${compareMode === 'slider' ? 'bg-white text-black shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                SLIDER
                            </button>
                            <button 
                                onClick={() => setCompareMode('split')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${compareMode === 'split' ? 'bg-white text-black shadow-xl' : 'text-white/60 hover:text-white'}`}
                            >
                                SIDE BY SIDE
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowCompareModal(false)}
                            className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="relative w-full h-full flex flex-col items-center">
                        <header className="mb-8 text-center animate-in slide-in-from-top-8">
                            <h3 className="text-3xl font-black text-white tracking-tighter mb-2">PRO <span className="text-indigo-500">COMPARISON</span> TOOL</h3>
                            <div className="flex items-center gap-2 justify-center">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/60 border border-white/10">SWAP: <button onClick={() => setSelectedForCompare([selectedForCompare[1], selectedForCompare[0]])} className="text-indigo-400 hover:underline">REVERSE ITEMS</button></span>
                            </div>
                        </header>

                        <div className="relative flex-1 w-full max-w-6xl rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] bg-black/40 scanline-effect group">
                            {compareMode === 'slider' ? (
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                    {renderCompareMedia(selectedForCompare[1], "absolute inset-0 w-full h-full scale-[1.02]")}
                                    <div 
                                        className="absolute inset-0 w-full h-full border-r border-white/30"
                                        style={{ width: `${compareSliderPos}%` }}
                                    >
                                        <div className="absolute inset-0 w-[100vw] h-full pointer-events-none">
                                            {renderCompareMedia(selectedForCompare[0], "absolute inset-0 w-full h-full scale-[1.02]")}
                                        </div>
                                    </div>

                                    {/* Slider UI */}
                                    <div className="absolute inset-0 w-full h-full z-20 flex items-center justify-center pointer-events-none">
                                        <div 
                                            className="h-full w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative"
                                            style={{ marginLeft: `${(compareSliderPos - 50) * 2}%`, transform: `translateX(${compareSliderPos}%)` }}
                                        >
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-indigo-600 cursor-ew-resize">
                                                <ArrowLeftRight size={28} className="text-indigo-600" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={compareSliderPos}
                                        onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                                    />
                                    
                                    {/* Floating Labels */}
                                    <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white animate-in slide-in-from-left-8">
                                        <div className="text-[10px] font-black uppercase text-indigo-400 mb-1">Item A (Kiri)</div>
                                        <div className="text-xs font-bold truncate max-w-[200px]">{selectedForCompare[0].prompt}</div>
                                    </div>
                                    <div className="absolute bottom-10 right-10 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white text-right animate-in slide-in-from-right-8">
                                        <div className="text-[10px] font-black uppercase text-indigo-400 mb-1">Item B (Kanan)</div>
                                        <div className="text-xs font-bold truncate max-w-[200px]">{selectedForCompare[1].prompt}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex w-full h-full bg-[#050505]">
                                      <div className="flex-1 relative border-r border-white/10 overflow-hidden flex items-center justify-center">
                                          {renderCompareMedia(selectedForCompare[0], "w-full h-full object-contain")}
                                           <div className="absolute top-6 left-6 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl">ITEM 1</div>
                                      </div>
                                      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                                          {renderCompareMedia(selectedForCompare[1], "w-full h-full object-contain")}
                                           <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl">ITEM 2</div>
                                      </div>
                                 </div>
                            )}
                        </div>
                        <div className="mt-8 text-white/40 text-sm font-medium flex items-center gap-2">
                            <Sparkles size={16} /> Gunakan slider untuk membedakan detail antara variasi hasil AI.
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Detail Modal */}
            {selectedItem && !isSelectionMode && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] border border-white/10"><X size={28} /></button>

                    <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-[#0c0c0e] border border-white/10 shadow-2xl shadow-black">
                        <div className="flex-1 bg-black/50 relative flex items-center justify-center p-6 lg:p-12 overflow-hidden group">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 pointer-events-none"></div>
                             {selectedItem.type === 'video' ? (
                                <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-full rounded-[2rem] shadow-2xl border border-white/5 z-10" />
                             ) : (
                                <img 
                                    src={upscaledUrl || selectedItem.url} 
                                    alt="Detail View" 
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] z-10 transition-all group-hover:scale-[1.02] duration-1000" 
                                />
                             )}
                             {upscaledUrl && (
                                 <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-indigo-500/90 backdrop-blur-xl text-white px-8 py-3 rounded-full font-black shadow-2xl flex items-center gap-3 border border-indigo-400/50 z-20 animate-in slide-in-from-bottom-8">
                                     <Sparkles size={20} className="animate-pulse" /> AI ENHANCED (4K UHD)
                                 </div>
                             )}
                        </div>

                        <div className="w-full lg:w-[450px] bg-white dark:bg-[#121214] flex flex-col border-l border-white/10 h-[50vh] lg:h-auto animate-in slide-in-from-right-10">
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">DATA <span className="text-emerald-500">KARYA</span></h3>
                                <button 
                                    onClick={(e) => toggleFavorite(e, selectedItem.id)}
                                    className={`p-3 rounded-2xl transition-all border ${favorites.has(selectedItem.id) ? 'bg-amber-100 text-amber-500 border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/20' : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-white/5 dark:border-white/10'}`}
                                >
                                    <Star size={24} fill={favorites.has(selectedItem.id) ? "currentColor" : "none"} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">PROMPT INSTRUKSI</label>
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium font-mono">
                                        {selectedItem.prompt}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500"><Cpu size={20}/></div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">ENGINE AI</label>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{getModelName(selectedItem.mode)}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><Clock size={20}/></div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">WAKTU GENERASI</label>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white">
                                                {new Date(selectedItem.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {upscaleError && <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs rounded-2xl border border-red-500/20">{upscaleError}</div>}
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-[#0a0a0c] border-t border-slate-200 dark:border-white/10 space-y-4">
                                {selectedItem.type !== 'video' && !upscaledUrl && (
                                    <button 
                                        onClick={handleUpscale}
                                        disabled={isUpscaling}
                                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-500/30 group"
                                    >
                                        {isUpscaling ? <Loader2 size={24} className="animate-spin" /> : <ArrowUpCircle size={24} />}
                                        {isUpscaling ? 'MEMPROSES 4K...' : 'AI UPSCALE TO 4K (UHD)'}
                                    </button>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleDownload(upscaledUrl || selectedItem.url, `INDIGITAL-${selectedItem.id}.png`)}
                                        className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/40"
                                    >
                                        <Download size={20} /> SIMPAN
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedItem.id, selectedItem.historyId)}
                                        className="py-4 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 font-black rounded-2xl flex items-center justify-center gap-2 transition-all border border-red-500/20"
                                    >
                                        <Trash2 size={20} /> HAPUS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
