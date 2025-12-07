
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageMerger from './components/ImageMerger';
import Login from './components/Login';
import AdminSettings from './components/AdminSettings';
import UserProfile from './components/UserProfile';
import ChatBot from './components/ChatBot';
import { Sparkles, ArrowRight, Layers, Zap, Activity, Cpu, ShieldCheck, Globe, Video, Heart, Briefcase, Camera, Music, Instagram, Facebook, Twitter, Youtube, MessageSquare, Palette, History, Image, Command, Menu, Users } from 'lucide-react';
import { FeatureMode, FeatureConfig } from './types';

// Global JSX declaration to ensure dotlottie-wc is recognized
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src: string;
        autoplay?: boolean;
        loop?: boolean;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

// --- CONFIGURATION FOR ALL FEATURES ---
const FEATURES: Record<FeatureMode, FeatureConfig> = {
  home: {
    id: 'home',
    title: 'Beranda',
    description: 'Dashboard Utama',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0
  },
  profile: {
    id: 'profile',
    title: 'Profil Pengguna',
    description: 'Kelola informasi akun dan keamanan.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0
  },
  settings: {
    id: 'settings',
    title: 'Pengaturan Admin',
    description: 'Konfigurasi Sistem',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0
  },
  chatbot: {
    id: 'chatbot',
    title: 'AI Chatbot Assistant',
    description: 'Tanya jawab cerdas dengan Gemini 3 Pro.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'chat'
  },
  
  // EDITING
  merge: {
    id: 'merge',
    title: 'Gabung Foto AI',
    description: 'Gabungkan subjek dengan latar belakang baru secara seamless.',
    defaultPrompt: 'Gabungkan subjek dari foto pertama ke dalam latar belakang foto kedua. Sesuaikan pencahayaan, bayangan, dan tone warna agar terlihat menyatu dan realistis seperti foto asli.',
    minImages: 2,
    maxImages: 5
  },
  thumbnail: {
    id: 'thumbnail',
    title: 'Foto Miniatur (Thumbnail)',
    description: 'Buat thumbnail YouTube yang menarik perhatian (Clickbait).',
    defaultPrompt: 'Buat desain thumbnail YouTube yang dramatis dan menarik perhatian (clickbait style). Gunakan teks besar yang kontras, ekspresi wajah yang emosional, dan warna-warna cerah. Tema: [Jelaskan Topik Video].',
    minImages: 1,
    maxImages: 3
  },
  expand: {
    id: 'expand',
    title: 'Perluas Foto (Outpainting)',
    description: 'Ubah rasio foto dengan menambahkan area sekeliling secara otomatis.',
    defaultPrompt: 'Perluas gambar ini secara horizontal/vertikal. Isi area kosong dengan latar belakang yang relevan dan menyatu sempurna dengan gambar asli. Pertahankan gaya visual yang sama.',
    minImages: 1,
    maxImages: 1
  },
  edit: {
    id: 'edit',
    title: 'Edit Foto Magic',
    description: 'Ubah bagian tertentu dari foto dengan instruksi teks.',
    defaultPrompt: 'Ubah [Sebutkan Objek] menjadi [Sebutkan Target]. Pertahankan pencahayaan dan gaya asli foto.',
    minImages: 1,
    maxImages: 1
  },
  removeobj: {
    id: 'removeobj',
    title: 'Remove Object',
    description: 'Hapus objek atau orang yang tidak diinginkan dari foto.',
    defaultPrompt: 'Hapus [Sebutkan Objek/Orang] dari foto ini. Isi area bekas penghapusan dengan latar belakang yang sesuai agar terlihat bersih dan alami (Inpainting).',
    minImages: 1,
    maxImages: 1
  },
  removebg: {
    id: 'removebg',
    title: 'Remove Background',
    description: 'Hapus latar belakang foto dan ganti dengan warna putih.',
    defaultPrompt: 'Hapus latar belakang gambar ini sepenuhnya. Sisakan hanya subjek utama dengan potongan yang sangat rapi (pixel-perfect). Ganti background dengan warna PUTIH POLOS (#FFFFFF).',
    minImages: 1,
    maxImages: 1
  },
  restore: {
    id: 'restore',
    title: 'Restorasi Foto Lama',
    description: 'Perbaiki foto buram, rusak, atau hitam putih menjadi HD.',
    defaultPrompt: 'Restorasi foto lama ini agar menjadi tajam (High Definition). Hilangkan noda goresan dan noise. Jika hitam putih, berikan warna yang natural dan realistis (Colorization).',
    minImages: 1,
    maxImages: 1
  },
  faceswap: {
    id: 'faceswap',
    title: 'Face Swap Pro',
    description: 'Tukar wajah antar foto dengan presisi tinggi.',
    defaultPrompt: 'Lakukan Face Swap realistis. Ambil wajah dari Foto 1 (Sumber) dan terapkan ke kepala/tubuh pada Foto 2 (Target). Pertahankan ekspresi, pencahayaan, dan tone kulit target.',
    minImages: 2,
    maxImages: 2
  },
  animate: {
    id: 'animate',
    title: 'Hidupkan Foto (Veo)',
    description: 'Ubah foto diam menjadi video sinematik bergerak.',
    defaultPrompt: 'Hidupkan foto ini (Animate). Buat gerakan kamera yang halus (Slow Pan/Zoom). Buat elemen alam seperti awan/air/rambut bergerak natural. Pertahankan gaya visual asli foto.',
    minImages: 1,
    maxImages: 1,
    type: 'video'
  },
  videofaceswap: {
    id: 'videofaceswap',
    title: 'Video Face Swap',
    description: 'Hidupkan foto wajah menjadi video bergerak.',
    defaultPrompt: 'Buat video sinematik dari orang di foto ini sedang [Sebutkan Aktivitas, misal: tersenyum dan melambaikan tangan]. Pertahankan identitas wajah agar tetap mirip.',
    minImages: 1,
    maxImages: 1,
    type: 'video'
  },
  fitting: {
    id: 'fitting',
    title: 'Kamar Pas (Virtual Try-On)',
    description: 'Coba pakaian pada model secara virtual.',
    defaultPrompt: 'Pakaikan baju dari Foto 2 ke badan orang di Foto 1. Sesuaikan ukuran, lipatan kain, dan pencahayaan agar terlihat seperti benar-benar dipakai.',
    minImages: 2,
    maxImages: 2
  },

  // STUDIO FOTO AI
  prewedding: {
    id: 'prewedding',
    title: 'Foto Prewedding',
    description: 'Gabungkan foto Pria & Wanita menjadi foto prewedding estetik.',
    defaultPrompt: 'Gabungkan subjek Pria (Foto 1) dan Wanita (Foto 2) menjadi satu frame pasangan yang romantis. Posisikan mereka berdampingan atau berpegangan tangan dengan natural. Latar belakang: [Sebutkan Lokasi, misal: Pantai Sunset / Taman Bunga]. Kenakan busana formal/gaun yang serasi. Pencahayaan cinematic, photorealistic 8k.',
    minImages: 2,
    maxImages: 2
  },
  wedding: {
    id: 'wedding',
    title: 'Foto Wedding',
    description: 'Simulasi pernikahan yang megah.',
    defaultPrompt: 'Ubah foto ini menjadi foto pernikahan (Wedding) yang megah dan elegan. Subjek mengenakan gaun pengantin/jas formal yang indah. Latar belakang dekorasi pelaminan mewah.',
    minImages: 1,
    maxImages: 1
  },
  babyborn: {
    id: 'babyborn',
    title: 'Baby Born Photography',
    description: 'Tema fotografi bayi baru lahir (Newborn).',
    defaultPrompt: 'Ubah foto bayi ini menjadi "Newborn Photography" profesional. Bayi tidur dengan nyaman di dalam keranjang rotan dengan selimut rajut lembut. Pencahayaan studio softbox, tone pastel.',
    minImages: 1,
    maxImages: 1
  },
  kids: {
    id: 'kids',
    title: 'Kids Photography',
    description: 'Foto studio anak yang ceria dan artistik.',
    defaultPrompt: 'Foto studio profesional untuk anak. Ekspresi ceria, pencahayaan terang dan tajam. Latar belakang studio abstrak warna-warni atau taman bermain fantasi.',
    minImages: 1,
    maxImages: 1
  },
  maternity: {
    id: 'maternity',
    title: 'Maternity Photo',
    description: 'Foto kehamilan yang elegan dan menyentuh.',
    defaultPrompt: 'Foto Maternity (Ibu Hamil) yang elegan dan artistik. Siluet dramatis dengan pencahayaan rim-light, gaun panjang menjuntai, suasana penuh kasih sayang.',
    minImages: 1,
    maxImages: 1
  },
  umrah: {
    id: 'umrah',
    title: 'Foto Umrah / Haji',
    description: 'Edit foto dengan latar belakang Tanah Suci.',
    defaultPrompt: 'Edit foto ini seolah-olah subjek sedang berada di Masjidil Haram, Mekkah dengan latar belakang Kaabah yang megah. Subjek mengenakan pakaian Ihram/Muslim yang sopan. Suasana spiritual dan agung.',
    minImages: 1,
    maxImages: 1
  },
  passphoto: {
    id: 'passphoto',
    title: 'Pas Foto Warna',
    description: 'Buat pas foto formal background merah/biru.',
    defaultPrompt: 'Ubah foto ini menjadi Pas Foto Formal untuk dokumen. Subjek mengenakan kemeja putih berdasi/jas hitam. Pandangan lurus ke depan. Ganti latar belakang menjadi [MERAH / BIRU].',
    minImages: 1,
    maxImages: 1
  },

  // DESAIN & SENI
  interior: {
    id: 'interior',
    title: 'Desain Interior',
    description: 'Visualisasi desain ruangan dari foto kosong.',
    defaultPrompt: 'Desain interior Photorealistic untuk ruangan ini. Gaya: [Minimalis / Industrial / Scandinavian]. Tambahkan furniture modern, pencahayaan warm, dan dekorasi tanaman hias.',
    minImages: 1,
    maxImages: 1
  },
  exterior: {
    id: 'exterior',
    title: 'Desain Eksterior',
    description: 'Render arsitektur bangunan dari sketsa.',
    defaultPrompt: 'Render arsitektur Eksterior yang realistis. Ubah sketsa/foto rumah ini menjadi bangunan modern mewah dengan fasad kaca dan kayu. Tambahkan taman yang asri dan pencahayaan pagi hari.',
    minImages: 1,
    maxImages: 1
  },
  sketch: {
    id: 'sketch',
    title: 'Sketsa Gambar',
    description: 'Ubah foto menjadi sketsa pensil artistik.',
    defaultPrompt: 'Ubah gambar ini menjadi sketsa pensil tangan yang detail (Hand-drawn Pencil Sketch). Garis-garis halus, shading arsiran, di atas kertas bertekstur. Hitam putih artistik.',
    minImages: 1,
    maxImages: 1
  },
  caricature: {
    id: 'caricature',
    title: 'Art & Karikatur',
    description: 'Ubah wajah menjadi karikatur 3D lucu.',
    defaultPrompt: 'An ultra-realistic large head caricature of a man like the uploaded image, wearing a casual outfit. Exaggerated features, Pixar-style rendering, cute and expressive. 3D Render, Octane Render, bright studio lighting.',
    minImages: 1,
    maxImages: 1
  },

  // IMAGINE & FAST
  imagine: {
    id: 'imagine',
    title: 'Buat Gambar (Imagine)',
    description: 'Buat gambar AI dari teks tanpa perlu upload foto.',
    defaultPrompt: 'A futuristic city floating in the clouds, cyberpunk aesthetic, neon lights, 8k resolution, cinematic lighting, highly detailed.',
    minImages: 0,
    maxImages: 0
  },
  banana: {
    id: 'banana',
    title: 'Banana AI (Fast)',
    description: 'Generasi gambar super cepat (Fast Mode).',
    defaultPrompt: 'A vibrant abstract digital art piece, colorful swirling fluids, high contrast, 4k.',
    minImages: 0,
    maxImages: 1
  },
  veo: {
    id: 'veo',
    title: 'Google Veo 3',
    description: 'Generasi video sinematik tercanggih.',
    defaultPrompt: 'A cinematic drone shot of a tropical island, turquoise water, white sand, sunny day, 4k resolution, smooth motion.',
    minImages: 0,
    maxImages: 1,
    type: 'video'
  },

  // BISNIS & PROMOSI
  fotomodel: {
    id: 'fotomodel',
    title: 'Foto Model AI',
    description: 'Model AI mengenakan produk fashion Anda.',
    defaultPrompt: 'Foto editorial model studio fotorealistis. Subjek utama: Seorang wanita muda berusia pertengahan 20-an, berwajah khas Indonesia-Melayu. Rambut hitam legam, lurus, panjang sebahu, ditata rapi dengan belahan pinggir. Ekspresi wajah tenang, tatapan mata intens langsung ke kamera, dengan sedikit senyum tipis yang elegan. Mengenakan [Deskripsikan Baju Produk].',
    minImages: 0, // Can be 0 for text-only model gen
    maxImages: 1
  },
  product: {
    id: 'product',
    title: 'Foto Produk',
    description: 'Ubah foto produk biasa menjadi foto studio profesional.',
    defaultPrompt: 'Tempatkan produk ini di atas podium marmer putih dengan pencahayaan studio premium. Tambahkan elemen dekorasi minimalis seperti daun monstera di latar belakang. Bokeh halus, tajam, dan elegan.',
    minImages: 1,
    maxImages: 1
  },
  fashion: {
    id: 'fashion',
    title: 'Foto Fashion',
    description: 'Katalog fashion profesional dengan model AI.',
    defaultPrompt: 'Foto katalog fashion full-body. Model profesional mengenakan pakaian ini. Pose dinamis namun elegan. Latar belakang studio abu-abu polos atau jalanan kota modern (Streetwear).',
    minImages: 1,
    maxImages: 1
  },
  mockup: {
    id: 'mockup',
    title: 'Buat Mockup',
    description: 'Terapkan desain logo/poster ke objek nyata.',
    defaultPrompt: 'Terapkan desain ini secara realistis ke permukaan objek pada foto kedua. Sesuaikan perspektif, bayangan, dan tekstur agar terlihat bersih dan alami (Mockup).',
    minImages: 2,
    maxImages: 2
  },
  banner: {
    id: 'banner',
    title: 'Buat Banner',
    description: 'Desain banner promosi otomatis.',
    defaultPrompt: 'Buat desain banner web promosi lebar. Gunakan produk ini sebagai elemen utama di sebelah kanan. Tambahkan teks placeholder "BIG SALE" di sebelah kiri. Latar belakang gradasi modern.',
    minImages: 1,
    maxImages: 1
  },
  carousel: {
    id: 'carousel',
    title: 'Buat Carousel',
    description: 'Konten media sosial berurutan (Carousel).',
    defaultPrompt: 'Buat desain slide carousel Instagram yang edukatif dan visual. Gunakan palet warna brand yang konsisten.',
    minImages: 1,
    maxImages: 3
  },
  flayer: {
    id: 'flayer',
    title: 'Desain Flyer',
    description: 'Desain selebaran promosi siap cetak.',
    defaultPrompt: 'Buat desain Flyer promosi ukuran A4. Tata letak profesional, headline menarik di atas, gambar produk di tengah, dan detail kontak di bawah. Gaya modern dan bersih.',
    minImages: 1,
    maxImages: 1
  },

  // DOWNLOADERS
  youtube: {
    id: 'youtube',
    title: 'Youtube Downloader',
    description: 'Download video Youtube kualitas tinggi.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  tiktok: {
    id: 'tiktok',
    title: 'Tiktok Downloader',
    description: 'Download video Tiktok tanpa watermark.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  instagram: {
    id: 'instagram',
    title: 'Instagram Downloader',
    description: 'Download Foto/Video/Reels Instagram.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  facebook: {
    id: 'facebook',
    title: 'Facebook Downloader',
    description: 'Download video dari Facebook.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  twitter: {
    id: 'twitter',
    title: 'X / Twitter Downloader',
    description: 'Download video/media dari X (Twitter).',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  }
};

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ text, delay = 50, infinite = true }: { text: string; delay?: number, infinite?: boolean }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (infinite) {
      // Wait a bit then reset
      timeout = setTimeout(() => {
        setCurrentIndex(0);
        setCurrentText('');
      }, 3000); // 3 seconds pause before repeating
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, infinite, text]);

  return <span className="text-white">{currentText}</span>;
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ onNavigate }: { onNavigate: (mode: FeatureMode) => void }) => {
  const FeatureCard = ({ id, icon, title, desc, gradient, delay }: any) => (
    <button 
      onClick={() => onNavigate(id)}
      className="group relative overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 text-left hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-900/20 animate-in zoom-in fill-mode-backwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 p-20 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl rounded-full translate-x-10 -translate-y-10`}></div>
      
      <div className="w-14 h-14 bg-slate-50 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-slate-700 dark:text-white shadow-sm border border-slate-100 dark:border-white/5">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
      
      <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        Coba Sekarang <ArrowRight size={16} className="ml-2" />
      </div>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0e] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-16 gap-12">
            <div className="flex-1 space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <Activity size={14} /> System Online V3.1
               </div>
               
               <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                  Andri AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pro</span>
               </h1>
               
               <div className="text-lg text-slate-400 leading-relaxed max-w-xl h-24">
                  <Typewriter 
                    text="Enterprise-grade Generative AI Platform untuk advanced photo manipulation, next-level graphic design, dan cinematic video rendering." 
                    delay={30}
                  />
               </div>
               
               <div className="flex flex-col gap-1">
                  <p className="text-sm text-emerald-500 font-mono">Powered by Google Gemini 2.5 + Veo latest build.</p>
                  <p className="text-xs text-slate-500 font-mono">Engineered & maintained by Andri Waskitho.</p>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => onNavigate('merge')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2">
                     <Layers size={20} /> Mulai Gabung Foto
                  </button>
                  <button onClick={() => onNavigate('imagine')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all hover:scale-105 flex items-center gap-2">
                     <Image size={20} /> Buat Gambar (Imagine)
                  </button>
               </div>
            </div>
            
            <div className="w-full md:w-5/12 h-96 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent z-20"></div>
               {/* @ts-ignore */}
               <dotlottie-wc 
                  src="https://lottie.host/5a41cfbe-1d43-4e11-a3c3-0ae05bdc2ce9/Cc9HVCmP3t.lottie" 
                  loop 
                  autoplay 
                  style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
               ></dotlottie-wc>
            </div>
         </div>

         <div className="border-t border-white/5 bg-black/20 p-3 flex gap-8 overflow-hidden whitespace-nowrap text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
            <div className="animate-marquee flex gap-8">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> GEMINI 3 PRO ENGINE ACTIVE</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> VEO VIDEO RENDER READY</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> GPU CLUSTER OPTIMIZED</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> LATENCY: 12ms</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> SECURE CONNECTION</span>
            </div>
         </div>
      </div>

      <div>
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <Zap size={24} className="text-yellow-500" /> Fitur Unggulan
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
               id="chatbot"
               title="AI Chatbot Assistant"
               desc="Tanya jawab cerdas dengan Gemini 3 Pro."
               icon={<MessageSquare size={24} />}
               gradient="bg-blue-500"
               delay={100}
            />
            <FeatureCard 
               id="imagine"
               title="Buat Gambar (Imagine)"
               desc="Buat gambar AI dari teks tanpa perlu upload foto."
               icon={<Image size={24} />}
               gradient="bg-purple-500"
               delay={200}
            />
            <FeatureCard 
               id="veo"
               title="Google Veo 3"
               desc="Generasi video sinematik tercanggih."
               icon={<Video size={24} />}
               gradient="bg-red-500"
               delay={300}
            />
            <FeatureCard 
               id="faceswap"
               title="Face Swap Pro"
               desc="Tukar wajah antar foto dengan presisi tinggi."
               icon={<Users size={24} />}
               gradient="bg-emerald-500"
               delay={400}
            />
         </div>
      </div>

      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Palette size={24} className="text-purple-500" /> Galeri Inspirasi AI
            </h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            <div className="md:col-span-1 h-full relative group overflow-hidden rounded-3xl cursor-pointer">
               <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" 
                  alt="Showcase 1" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                  <h3 className="text-white font-bold text-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Abstract 3D Art</h3>
                  <p className="text-slate-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Generasi seni abstrak dengan detail tinggi.</p>
               </div>
            </div>

            <div className="md:col-span-2 grid grid-rows-2 gap-6 h-full">
               <div className="grid grid-cols-2 gap-6 h-full">
                   <div className="relative group overflow-hidden rounded-3xl cursor-pointer">
                      <img 
                         src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
                         alt="Fashion" 
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold tracking-widest border border-white px-4 py-2 rounded-full uppercase text-xs">Neon Fashion</span>
                       </div>
                   </div>
                   <div className="relative group overflow-hidden rounded-3xl cursor-pointer">
                      <img 
                         src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=600&q=80" 
                         alt="Holo" 
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold tracking-widest border border-white px-4 py-2 rounded-full uppercase text-xs">Holographic Flow</span>
                       </div>
                   </div>
               </div>
               <div className="relative group overflow-hidden rounded-3xl cursor-pointer">
                   <img 
                      src="https://images.unsplash.com/photo-1620641788421-7f1c338e61a9?auto=format&fit=crop&w=1200&q=80" 
                      alt="Tech" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent p-8 flex flex-col justify-center items-end text-right">
                       <h3 className="text-white font-bold text-2xl">Future Tech</h3>
                       <p className="text-slate-300 text-sm mt-1">Visualisasi data dan teknologi masa depan.</p>
                   </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200 dark:border-white/5">
         <div className="space-y-4">
            <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><Camera size={14}/> Studio Suite</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
               <li onClick={() => onNavigate('prewedding')} className="cursor-pointer hover:text-emerald-500 flex items-center gap-2"><Heart size={12}/> Foto Prewedding</li>
               <li onClick={() => onNavigate('wedding')} className="cursor-pointer hover:text-emerald-500 flex items-center gap-2"><Heart size={12}/> Foto Wedding</li>
               <li onClick={() => onNavigate('babyborn')} className="cursor-pointer hover:text-emerald-500 flex items-center gap-2"><Heart size={12}/> Baby Born</li>
            </ul>
         </div>
         <div className="space-y-4">
            <h3 className="text-blue-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><Briefcase size={14}/> Business Tools</h3>
             <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
               <li onClick={() => onNavigate('product')} className="cursor-pointer hover:text-blue-500 flex items-center gap-2"><Briefcase size={12}/> Foto Produk</li>
               <li onClick={() => onNavigate('fashion')} className="cursor-pointer hover:text-blue-500 flex items-center gap-2"><Briefcase size={12}/> Foto Fashion</li>
               <li onClick={() => onNavigate('banner')} className="cursor-pointer hover:text-blue-500 flex items-center gap-2"><Briefcase size={12}/> Buat Banner</li>
            </ul>
         </div>
         <div className="space-y-4">
            <h3 className="text-purple-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><Music size={14}/> Media Download</h3>
             <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
               <li onClick={() => onNavigate('youtube')} className="cursor-pointer hover:text-purple-500 flex items-center gap-2"><Youtube size={12}/> Youtube</li>
               <li onClick={() => onNavigate('tiktok')} className="cursor-pointer hover:text-purple-500 flex items-center gap-2"><Video size={12}/> Tiktok</li>
               <li onClick={() => onNavigate('instagram')} className="cursor-pointer hover:text-purple-500 flex items-center gap-2"><Instagram size={12}/> Instagram</li>
            </ul>
         </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMode, setCurrentMode] = useState<FeatureMode>('home');
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getThemeStyle = () => {
     switch(theme) {
        case 'light': return 'bg-white text-slate-900';
        case 'dark': return 'bg-[#09090b] text-white';
        case 'purple': return 'bg-gradient-to-br from-[#1a0b2e] via-[#130722] to-[#0f0518] text-white';
        case 'ocean': return 'bg-gradient-to-br from-[#0f172a] via-[#0c2e42] to-[#082f49] text-white';
        case 'emerald': return 'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#065f46] text-white';
        case 'sunset': return 'bg-gradient-to-br from-[#451a03] via-[#7c2d12] to-[#9a3412] text-white';
        case 'midnight': return 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white';
        case 'cyberpunk': return 'bg-gradient-to-br from-[#2e0225] via-[#4a044e] to-[#701a75] text-white';
        default: return 'bg-[#09090b] text-white';
     }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const handleLogin = (status: boolean) => {
    setIsLoggedIn(status);
  };

  const handleNavigate = (mode: FeatureMode) => {
    setCurrentMode(mode);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-['Inter'] ${getThemeStyle()}`}>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#09090b] z-40 flex items-center justify-between px-4 border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
             <Sparkles className="text-emerald-500 w-6 h-6" />
             <span className="text-white font-bold text-lg">Andri AI Pro</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
             <Menu size={24} />
          </button>
      </div>

      <Sidebar 
        currentMode={currentMode} 
        onNavigate={handleNavigate} 
        onLogout={() => setIsLoggedIn(false)}
        className="z-50"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className={`transition-all duration-300 pt-20 md:pt-8 px-4 md:px-8 pb-8 md:ml-72 min-h-screen flex flex-col`}>
        <div className="flex-1">
            {currentMode === 'home' && <Dashboard onNavigate={handleNavigate} />}
            
            {currentMode === 'profile' && <UserProfile />}
            
            {currentMode === 'settings' && (
               <AdminSettings theme={theme} setTheme={setTheme} />
            )}
            
            {currentMode !== 'home' && currentMode !== 'profile' && currentMode !== 'settings' && currentMode !== 'chatbot' && (
            <ImageMerger feature={FEATURES[currentMode]} />
            )}
        </div>

        <ChatBot />

        <footer className="mt-20 border-t border-slate-200 dark:border-white/5 pt-8 text-center pb-8">
           <div className="flex items-center justify-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-lg">
              <Sparkles className="text-emerald-500" size={18} /> Andri AI Pro
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Enterprise-grade Generative AI Platform.
           </p>
           <p className="text-xs text-slate-400 dark:text-slate-600 font-mono">
              © {new Date().getFullYear()} Andri Waskitho. All rights reserved.
           </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
