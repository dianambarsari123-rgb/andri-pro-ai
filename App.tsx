
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
  Maximize2, Eraser, Film, AudioLines, Clock, ArrowRight, Activity, Calendar
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
      
      <main className="flex-1 ml-0 md:ml-72 p-6 overflow-x-hidden transition-colors duration-300">
        {currentMode === 'home' ? (
           <div className="max-w-7xl mx-auto space-y-10 pt-4 pb-20 animate-in fade-in duration-500">
              
              {/* Hero Greeting Section */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 shadow-2xl p-8 md:p-12 text-white border border-white/10">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
                  <div className="absolute bottom-0 left-20 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
                  
                  <div className="relative z-10">
                      <div className="flex items-center gap-2 text-emerald-100 font-bold uppercase tracking-wider text-xs mb-3">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          System Operational
                      </div>
                      <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
                          {greeting}, <br/> {userProfile.fullName}.
                      </h1>
                      <p className="text-emerald-50 max-w-xl text-lg leading-relaxed font-light mb-8">
                          Selamat datang kembali di INDIGITAL STUDIO. Akses fitur generative AI Gemini 3 Pro & Veo untuk mempercepat kreativitas Anda.
                      </p>
                      <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => setCurrentMode('imagine')} 
                            className="bg-white text-emerald-800 px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-emerald-50 hover:scale-105 transition-all flex items-center gap-2"
                          >
                              <ImageIcon size={20} /> Buat Gambar
                          </button>
                          <button 
                            onClick={() => setCurrentMode('veo')} 
                            className="bg-emerald-800/40 hover:bg-emerald-800/60 text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold transition-all backdrop-blur-md flex items-center gap-2"
                          >
                              <Video size={20} /> Buat Video
                          </button>
                      </div>
                  </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-white/10 flex items-center gap-5 group">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Activity size={28} />
                      </div>
                      <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Server Status</div>
                          <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              Online <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-white/10 flex items-center gap-5 group">
                      <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap size={28} />
                      </div>
                      <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Banana Credit</div>
                          <div className="text-2xl font-bold text-slate-800 dark:text-white">Unlimited</div>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-white/10 flex items-center gap-5 group">
                      <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Layers size={28} />
                      </div>
                      <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Kreasi</div>
                          <div className="text-2xl font-bold text-slate-800 dark:text-white">{recentHistory.length || 0} File</div>
                      </div>
                  </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Sparkles className="text-emerald-500" /> Akses Cepat
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                          { id: 'banana', label: 'Banana Fast', desc: 'Instan Image Gen', icon: <Zap size={24} />, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
                          { id: 'veo', label: 'Google Veo', desc: 'Text to Video', icon: <Video size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
                          { id: 'faceswap', label: 'Face Swap', desc: 'Ganti Wajah', icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
                          { id: 'removebg', label: 'Hapus BG', desc: 'Transparent BG', icon: <ImageMinus size={24} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
                      ].map((item) => (
                          <button 
                              key={item.id}
                              onClick={() => setCurrentMode(item.id as FeatureMode)}
                              className="group bg-white dark:bg-[#0c0c0e] hover:bg-slate-50 dark:hover:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between h-40"
                          >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                                  {item.icon}
                              </div>
                              <div>
                                <span className="font-bold text-lg text-slate-800 dark:text-white block group-hover:text-emerald-600 transition-colors">
                                    {item.label}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>

              {/* Recent History */}
              {recentHistory.length > 0 && (
                  <div>
                      <div className="flex justify-between items-end mb-6">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              <Clock className="text-emerald-500" /> Riwayat Terakhir
                          </h3>
                          <button onClick={() => setCurrentMode('gallery')} className="text-sm font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                              Lihat Galeri <ArrowRight size={16} />
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {recentHistory.map((item, idx) => (
                              <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer" onClick={() => setCurrentMode('gallery')}>
                                  {item.type === 'video' ? (
                                      <div className="w-full h-full flex items-center justify-center bg-black">
                                          <Video className="text-white opacity-50 w-12 h-12" />
                                      </div>
                                  ) : (
                                      <img src={item.thumbnail || item.results[0]} alt="Recent" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-900/50 backdrop-blur w-fit px-2 py-1 rounded mb-1">{item.mode}</span>
                                      <div className="flex items-center gap-1 text-slate-300 text-[10px]">
                                         <Calendar size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

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
