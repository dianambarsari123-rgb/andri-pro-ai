
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageMerger from './components/ImageMerger';
import Gallery from './components/Gallery';
import UserProfile from './components/UserProfile';
import AdminSettings from './components/AdminSettings';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ContactSupport from './components/ContactSupport';
import ChatBot from './components/ChatBot';
import { FeatureMode, FeatureConfig, HistoryItem } from './types';
import { 
  Sparkles, Layers, Edit3, ImageMinus, Palette, Users, Video, 
  Scissors, Heart, Baby, Smile, User, Moon, UserSquare, 
  Home as HomeIcon, LayoutTemplate, PenTool, UserCheck, 
  ShoppingBag, Shirt, Type, Columns, FileText, Youtube, 
  Instagram, Facebook, Twitter, Download, Zap, Image as ImageIcon,
  Maximize2, Eraser, Film, AudioLines, Clock, ArrowRight, Activity, Calendar,
  Play, Pause, SkipForward, Volume2, Bot, Eye, LogOut, Settings, UserCircle, Sun, Menu
} from 'lucide-react';

const FEATURES: Record<string, FeatureConfig> = {
  // Core
  banana: {
    id: 'banana',
    title: 'Banana AI',
    description: 'Generasi gambar dual-mode: Fast (Unlimited) & Pro (High Detail).',
    defaultPrompt: 'A vibrant abstract digital art piece, colorful swirling fluids, high contrast, 4k.',
    minImages: 0,
    maxImages: 1,
    icon: <Zap size={24} />
  },
  veo: {
    id: 'veo',
    title: 'Google Veo 3',
    description: 'Generasi video sinematik high-fidelity dari teks atau gambar.',
    defaultPrompt: 'Cinematic drone shot of a futuristic city at sunset, flying cars, neon lights, 4k resolution.',
    minImages: 0,
    maxImages: 1,
    type: 'video',
    icon: <Video size={24} />
  },
  imagine: {
    id: 'imagine',
    title: 'Text to Image',
    description: 'Ubah imajinasi menjadi gambar nyata dengan instruksi teks.',
    defaultPrompt: 'A magical forest with glowing mushrooms and fireflies, fantasy art style, 8k.',
    minImages: 0,
    maxImages: 0,
    icon: <ImageIcon size={24} />
  },
  
  // Editing
  merge: { id: 'merge', title: 'Gabung Foto', description: 'Gabungkan objek dan latar belakang secara seamless.', defaultPrompt: 'Merge these images naturally.', minImages: 2, maxImages: 2, icon: <Layers size={24} /> },
  thumbnail: { id: 'thumbnail', title: 'Foto Miniatur', description: 'Buat thumbnail YouTube yang menarik.', defaultPrompt: 'YouTube thumbnail, catchy text, expressive face, high contrast.', minImages: 1, maxImages: 1, icon: <Edit3 size={24} /> },
  expand: { id: 'expand', title: 'Perluas Foto', description: 'Uncrop / Outpainting foto otomatis.', defaultPrompt: 'Expand image surroundings naturally.', minImages: 1, maxImages: 1, icon: <Maximize2 size={24} /> },
  edit: { id: 'edit', title: 'Magic Edit', description: 'Edit bagian foto dengan instruksi teks.', defaultPrompt: 'Change the background to a beach.', minImages: 1, maxImages: 1, icon: <Edit3 size={24} /> },
  removeobj: { id: 'removeobj', title: 'Hapus Objek', description: 'Hilangkan objek tidak diinginkan.', defaultPrompt: 'Remove the object.', minImages: 1, maxImages: 1, icon: <Eraser size={24} /> },
  removebg: { id: 'removebg', title: 'Hapus Background', description: 'Hapus latar belakang foto otomatis.', defaultPrompt: 'Remove background.', minImages: 1, maxImages: 1, icon: <ImageMinus size={24} /> },
  restore: { id: 'restore', title: 'Restorasi Foto', description: 'Perbaiki foto lama, buram, atau hitam putih.', defaultPrompt: 'Restore and colorize this old photo, high definition.', minImages: 1, maxImages: 1, icon: <Palette size={24} /> },
  faceswap: { id: 'faceswap', title: 'Face Swap', description: 'Ganti wajah dalam foto secara realistis.', defaultPrompt: 'Swap face from image 1 to body in image 2.', minImages: 2, maxImages: 2, icon: <Users size={24} /> },
  videofaceswap: { id: 'videofaceswap', title: 'Video Face Swap', description: 'Ganti wajah dalam video.', defaultPrompt: 'Swap face.', minImages: 1, maxImages: 1, type: 'video', icon: <Film size={24} /> },
  animate: { id: 'animate', title: 'Hidupkan Foto', description: 'Animasikan foto diam menjadi video.', defaultPrompt: 'Animate this photo, camera zoom in, cinematic movement.', minImages: 1, maxImages: 1, type: 'video', icon: <Video size={24} /> },
  fitting: { id: 'fitting', title: 'Kamar Pas AI', description: 'Virtual try-on pakaian.', defaultPrompt: 'Fit the dress from image 2 onto the person in image 1.', minImages: 2, maxImages: 2, icon: <Scissors size={24} /> },
  
  // TTS Feature
  tts: { 
    id: 'tts', 
    title: 'Text to Speech', 
    description: 'Ubah teks menjadi suara manusia (AI Voiceover) yang natural.', 
    defaultPrompt: 'Selamat datang di INDIGITAL STUDIO. Saya siap membantu membacakan narasi video Anda dengan suara yang jernih dan profesional.', 
    minImages: 0, 
    maxImages: 0, 
    type: 'audio',
    icon: <AudioLines size={24} /> 
  },

  // Studio
  prewedding: { id: 'prewedding', title: 'Foto Prewedding', description: 'Simulasi foto prewedding.', defaultPrompt: 'Romantic prewedding photo, sunset beach.', minImages: 2, maxImages: 2, icon: <Heart size={24} /> },
  wedding: { id: 'wedding', title: 'Foto Wedding', description: 'Simulasi foto pernikahan mewah.', defaultPrompt: 'Luxury wedding photo.', minImages: 1, maxImages: 1, icon: <Users size={24} /> },
  babyborn: { id: 'babyborn', title: 'Baby Born', description: 'Foto bayi baru lahir artistik.', defaultPrompt: 'Newborn photography, cute baby, soft lighting.', minImages: 1, maxImages: 1, icon: <Baby size={24} /> },
  kids: { id: 'kids', title: 'Kids Foto', description: 'Foto anak-anak ceria.', defaultPrompt: 'Happy kid portrait.', minImages: 1, maxImages: 1, icon: <Smile size={24} /> },
  maternity: { id: 'maternity', title: 'Maternity', description: 'Foto kehamilan elegan.', defaultPrompt: 'Maternity photoshoot, elegant.', minImages: 1, maxImages: 1, icon: <User size={24} /> },
  umrah: { id: 'umrah', title: 'Umrah/Haji', description: 'Foto tema tanah suci.', defaultPrompt: 'Person in Mecca, Kaaba background.', minImages: 1, maxImages: 1, icon: <Moon size={24} /> },
  passphoto: { id: 'passphoto', title: 'Pas Foto', description: 'Buat pas foto formal otomatis.', defaultPrompt: 'Formal passport photo.', minImages: 1, maxImages: 1, icon: <UserSquare size={24} /> },

  // Design
  interior: { id: 'interior', title: 'Desain Interior', description: 'Visualisasi interior ruangan.', defaultPrompt: 'Modern minimalist living room interior design.', minImages: 1, maxImages: 1, icon: <HomeIcon size={24} /> },
  exterior: { id: 'exterior', title: 'Desain Eksterior', description: 'Visualisasi eksterior bangunan.', defaultPrompt: 'Modern house exterior facade.', minImages: 1, maxImages: 1, icon: <LayoutTemplate size={24} /> },
  sketch: { id: 'sketch', title: 'Sketsa Gambar', description: 'Ubah foto jadi sketsa.', defaultPrompt: 'Pencil sketch art style.', minImages: 1, maxImages: 1, icon: <PenTool size={24} /> },
  caricature: { id: 'caricature', title: 'Art & Karikatur', description: 'Ubah wajah jadi karikatur 3D.', defaultPrompt: '3D caricature, pixar style, funny big head.', minImages: 1, maxImages: 1, icon: <Palette size={24} /> },

  // Biz
  fotomodel: { id: 'fotomodel', title: 'Foto Model AI', description: 'Generate model untuk produk Anda.', defaultPrompt: 'Professional fashion model wearing this product.', minImages: 1, maxImages: 1, icon: <UserCheck size={24} /> },
  product: { id: 'product', title: 'Foto Produk', description: 'Foto produk studio quality.', defaultPrompt: 'Professional product photography, studio lighting.', minImages: 1, maxImages: 1, icon: <ShoppingBag size={24} /> },
  fashion: { id: 'fashion', title: 'Foto Fashion', description: 'Katalog fashion profesional.', defaultPrompt: 'Fashion catalog shoot.', minImages: 1, maxImages: 1, icon: <Shirt size={24} /> },
  mockup: { id: 'mockup', title: 'Buat Mockup', description: 'Mockup logo atau branding.', defaultPrompt: 'Logo mockup on a wall.', minImages: 1, maxImages: 1, icon: <LayoutTemplate size={24} /> },
  banner: { id: 'banner', title: 'Buat Banner', description: 'Desain banner promosi.', defaultPrompt: 'Promotional banner design.', minImages: 1, maxImages: 1, icon: <Type size={24} /> },
  carousel: { id: 'carousel', title: 'Buat Carousel', description: 'Desain konten carousel.', defaultPrompt: 'Instagram carousel design.', minImages: 1, maxImages: 1, icon: <Columns size={24} /> },
  flayer: { id: 'flayer', title: 'Desain Flyer', description: 'Desain flyer/brosur.', defaultPrompt: 'Marketing flyer design.', minImages: 1, maxImages: 1, icon: <FileText size={24} /> },

  // Downloaders
  youtube: { id: 'youtube', title: 'Youtube Downloader', description: 'Download video Youtube.', defaultPrompt: '', minImages: 0, maxImages: 0, type: 'downloader', icon: <Youtube size={24} /> },
  tiktok: { id: 'tiktok', title: 'Tiktok Downloader', description: 'Download video Tiktok no-watermark.', defaultPrompt: '', minImages: 0, maxImages: 0, type: 'downloader', icon: <Video size={24} /> },
  instagram: { id: 'instagram', title: 'Instagram Downloader', description: 'Download Reels/Story Instagram.', defaultPrompt: '', minImages: 0, maxImages: 0, type: 'downloader', icon: <Instagram size={24} /> },
  facebook: { id: 'facebook', title: 'Facebook Downloader', description: 'Download video Facebook.', defaultPrompt: '', minImages: 0, maxImages: 0, type: 'downloader', icon: <Facebook size={24} /> },
  twitter: { id: 'twitter', title: 'X Downloader', description: 'Download video X/Twitter.', defaultPrompt: '', minImages: 0, maxImages: 0, type: 'downloader', icon: <Twitter size={24} /> },
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentMode, setCurrentMode] = useState<FeatureMode>('home');
  const [theme, setTheme] = useState('luxury');
  const [viewState, setViewState] = useState<'landing' | 'login' | 'app' | 'privacy' | 'terms' | 'contact'>('landing');
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [userProfile, setUserProfile] = useState({ fullName: 'Superadmin' });

  useEffect(() => {
    const auth = localStorage.getItem('user_auth');
    if (auth) {
      setIsAuthenticated(true);
      setViewState('app');
    }
    
    // Greeting Logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 18) setGreeting('Selamat Siang');
    else setGreeting('Selamat Malam');

    // Load Profile Name
    const savedProfile = localStorage.getItem('user_profile');
    if(savedProfile) {
        try {
            setUserProfile(JSON.parse(savedProfile));
        } catch(e) {}
    }

  }, []);

  // Load recent history when entering home
  useEffect(() => {
    if (currentMode === 'home') {
        const saved = localStorage.getItem('andri_ai_history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setRecentHistory(parsed.slice(0, 5));
            } catch (e) {}
        }
    }
  }, [currentMode]);

  const handleLogin = (status: boolean) => {
    if (status) {
      setIsAuthenticated(true);
      setViewState('app');
      localStorage.setItem('user_auth', JSON.stringify({ username: 'andriwaskitho', loggedIn: true }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewState('landing');
    localStorage.removeItem('user_auth');
    setCurrentMode('home');
  };

  if (viewState === 'landing') {
    return <LandingPage onGetStarted={() => setViewState('login')} onNavigate={(page) => setViewState(page)} />;
  }

  if (viewState === 'privacy') return <PrivacyPolicy onBack={() => setViewState('landing')} />;
  if (viewState === 'terms') return <TermsOfService onBack={() => setViewState('landing')} />;
  if (viewState === 'contact') return <ContactSupport onBack={() => setViewState('landing')} />;

  if (viewState === 'login') {
    return <Login onLogin={handleLogin} onBack={() => setViewState('landing')} />;
  }

  return (
    <div className={`flex min-h-screen bg-emerald-50/30 dark:bg-black font-['Inter'] ${theme === 'dark' || theme === 'cyberpunk' ? 'dark' : ''}`}>
      <Sidebar 
        currentMode={currentMode} 
        onNavigate={setCurrentMode} 
        onLogout={handleLogout}
        isLuxury={theme === 'luxury'}
        currentTheme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      />
      
      <main className="flex-1 ml-0 md:ml-72 p-6 overflow-x-hidden transition-colors duration-300 relative">
        {/* Top Toolbar */}
        <div className="sticky top-0 z-40 -mx-6 -mt-6 px-6 py-4 mb-6 bg-[#0c0c0e]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white capitalize tracking-tight">
                 {currentMode === 'home' ? 'Dashboard' : currentMode.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
           </div>
           
           <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' || theme === 'cyberpunk' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                onClick={() => setCurrentMode('settings')}
                className={`p-2 rounded-xl transition-colors ${currentMode === 'settings' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                title="Pengaturan Admin"
              >
                <Settings size={20} />
              </button>

              <button 
                onClick={() => setCurrentMode('profile')}
                className={`p-2 rounded-xl transition-colors ${currentMode === 'profile' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                title="Profil Saya"
              >
                <UserCircle size={20} />
              </button>

              <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2"></div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors font-medium text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
           </div>
        </div>

        {currentMode === 'home' ? (
           <div className="max-w-7xl mx-auto space-y-6 pt-4 pb-20 animate-in fade-in duration-500">
              
              {/* Server Status Section */}
              <div className="bg-white dark:bg-[#0c0c0e] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                  <div className="bg-[#2d3748] text-white p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                          <Activity size={24} className="text-slate-300" />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold">Status Server Sulap Foto</h2>
                          <p className="text-sm text-slate-300">Total: 784,367 Gambar Dihasilkan.</p>
                      </div>
                  </div>
                  
                  <div className="p-6 overflow-x-auto custom-scrollbar">
                      <div className="flex gap-4 min-w-max pb-4">
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                              <div key={num} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-[280px] flex-shrink-0 shadow-sm">
                                  <div className="flex justify-between items-center mb-4">
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">Server {num}</span>
                                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                                      </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                                      <div>
                                          <div className="text-[10px] text-slate-500 font-bold mb-1">CPU</div>
                                          <div className="text-blue-500 font-bold text-lg">{(Math.random() * 20 + 5).toFixed(1)}%</div>
                                      </div>
                                      <div>
                                          <div className="text-[10px] text-slate-500 font-bold mb-1">RAM</div>
                                          <div className="text-purple-500 font-bold text-lg">{(Math.random() * 20 + 10).toFixed(1)}%</div>
                                      </div>
                                      <div>
                                          <div className="text-[10px] text-slate-500 font-bold mb-1">STORAGE</div>
                                          <div className="text-amber-500 font-bold text-lg">{Math.floor(Math.random() * 20 + 5)}%</div>
                                      </div>
                                      <div>
                                          <div className="text-[10px] text-slate-500 font-bold mb-1">UPTIME</div>
                                          <div className="text-emerald-500 font-bold text-lg">{(Math.random() * 200 + 50).toFixed(2)}</div>
                                      </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                                      Total: <span className="font-bold text-slate-700 dark:text-slate-300">{Math.floor(Math.random() * 200000 + 20000).toLocaleString()}</span> gambar telah dihasilkan dari server ini.
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Middle Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio Player */}
                  <div className="bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="font-bold text-slate-800 dark:text-white">Sulap Foto - Idul Fitri</div>
                      <div className="flex items-center gap-3">
                          <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <Pause size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <SkipForward size={14} />
                          </button>
                          <div className="flex items-center gap-2 ml-2">
                              <Volume2 size={16} className="text-slate-400" />
                              <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                  <div className="w-2/3 h-full bg-emerald-500 rounded-full"></div>
                                  <div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Boost Mode */}
                  <div className="bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-between relative">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500">
                              <Zap size={24} className="fill-current" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-800 dark:text-white">Boost Mode</div>
                              <div className="text-xs text-slate-500">Sisa kuota boost 0 gambar</div>
                          </div>
                      </div>
                      <div className="relative flex items-center">
                          {/* Tooltip */}
                          <div className="absolute -top-10 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                              Aktifkan Boost Mode!
                              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                          </div>
                          {/* Toggle */}
                          <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer border border-slate-300 dark:border-slate-600">
                              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Bottom Tabs & Content */}
              <div className="space-y-6">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 gap-4">
                      <button className="bg-white dark:bg-[#0c0c0e] py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                          Assistant
                      </button>
                      <button className="bg-white dark:bg-[#0c0c0e] py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 font-bold text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-2">
                          Chat Group <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">New</span>
                      </button>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Assistant Panel */}
                      <div className="bg-white dark:bg-[#0c0c0e] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#00bfa5] rounded-full flex items-center justify-center text-white">
                                  <Bot size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Assistant</h3>
                                  <p className="text-xs text-slate-500">Selasa, 24 Maret - 12.19</p>
                              </div>
                          </div>
                          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-[300px]">
                              <div className="bg-[#fff8e1] dark:bg-amber-900/10 border-l-4 border-amber-400 p-5 rounded-r-xl shadow-sm">
                                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Changelog 6.4</h4>
                                  <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-sm">
                                      <li>Pertukaran model GPT Image menjadi Flux Pro 2 di private server</li>
                                      <li>Perbaikan stabilitas dan performa aplikasi</li>
                                  </ul>
                              </div>
                          </div>
                      </div>

                      {/* Chat Group Panel */}
                      <div className="bg-white dark:bg-[#0c0c0e] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-[#00bfa5] rounded-full flex items-center justify-center text-white">
                                      <Users size={24} />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Chat Group</h3>
                                          <span className="bg-[#00bfa5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span> 2 online
                                          </span>
                                          <Eye size={16} className="text-slate-400" />
                                      </div>
                                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                          Masuk sebagai: <span className="font-semibold text-fuchsia-500 dark:text-fuchsia-400">andri_waskit</span> 
                                          <span className="bg-amber-400 text-white text-[8px] font-bold px-1 rounded">VIP</span>
                                          <span className="text-fuchsia-500 font-medium">(Jawa Timur)</span>
                                      </p>
                                  </div>
                              </div>
                              <button className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                                  <LogOut size={20} />
                              </button>
                          </div>
                          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-[300px]">
                              <div className="bg-[#e3f2fd] dark:bg-blue-900/20 p-4 rounded-2xl rounded-tl-sm max-w-[85%]">
                                  <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">ali (Kalimantan Barat)</span>
                                          <span className="bg-amber-400 text-white text-[8px] font-bold px-1 rounded">VIP</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">11:20</span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                      Selamat Hari Raya Idul Fitri 1447 H dari saya Ali, mari kita amalkan pesan 'Wata'awanu 'alal birri' dalam setiap langkah karena 'maaf adalah permata jiwa', sehingga pada hari yang fitri ini izinkan saya memohon maaf lahir dan batin.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        ) : (
            <>
                {currentMode === 'gallery' && <Gallery onNavigate={setCurrentMode} />}
                {currentMode === 'profile' && <UserProfile />}
                {currentMode === 'settings' && <AdminSettings theme={theme} setTheme={setTheme} />}

                {FEATURES[currentMode] && (
                <ImageMerger feature={FEATURES[currentMode]} onNavigate={setCurrentMode} />
                )}
            </>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default App;
