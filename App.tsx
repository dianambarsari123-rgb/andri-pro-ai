
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageMerger from './components/ImageMerger';
import Login from './components/Login';
import AdminSettings from './components/AdminSettings';
import UserProfile from './components/UserProfile';
import ChatBot from './components/ChatBot';
import { Sparkles, ArrowRight, Layers, Zap, Activity, Cpu, ShieldCheck, Globe, Video, Heart, Briefcase, Camera, Music, Instagram, Facebook, Twitter, Youtube, MessageSquare, Palette, History, Image } from 'lucide-react';
import { FeatureMode, FeatureConfig } from './types';

// Configuration for all app features
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
  
  // New Feature: Chatbot (Config kept for metadata, but routing is global)
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
    description: 'Ubah foto couple menjadi foto prewedding estetik.',
    defaultPrompt: 'Ubah foto pasangan ini menjadi foto Prewedding yang romantis dan estetik. Latar belakang: [Sebutkan Lokasi, misal: Pantai saat Sunset / Taman Bunga]. Pencahayaan lembut, suasana dreamy.',
    minImages: 1,
    maxImages: 1
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
    defaultPrompt: 'Render arsitektur Eksterior yang realistis. Ubah sketsa/foto rumah ini menjadi bangunan modern mewah dengan fasad kaca dan kayu. Tambahkan taman yang asri dan pencahayaan sore hari.',
    minImages: 1,
    maxImages: 1
  },
  sketch: {
    id: 'sketch',
    title: 'Sketsa Gambar',
    description: 'Ubah foto menjadi lukisan sketsa tangan.',
    defaultPrompt: 'Ubah foto ini menjadi lukisan sketsa pensil (Pencil Sketch) yang artistik di atas kertas bertekstur. Garis-garis tegas, shading detail, hitam putih.',
    minImages: 1,
    maxImages: 1
  },
  caricature: {
    id: 'caricature',
    title: 'Art & Karikatur',
    description: 'Ubah wajah menjadi karakter 3D unik.',
    defaultPrompt: 'An ultra-realistic large head caricature of a man like the uploaded image. 3D Pixar Style rendering. Exaggerated features but recognizable. Background: detailed fantasy world.',
    minImages: 1,
    maxImages: 1
  },
  
  // NEW: Imagine (Text-to-Image)
  imagine: {
    id: 'imagine',
    title: 'Buat Gambar (Imagine)',
    description: 'Buat gambar AI dari teks tanpa perlu upload foto.',
    defaultPrompt: 'A photorealistic cinematic shot of a futuristic city with neon lights, 8k resolution, highly detailed.',
    minImages: 0,
    maxImages: 0,
  },

  // BISNIS & PROMOSI
  product: {
    id: 'product',
    title: 'Foto Produk',
    description: 'Foto produk profesional kualitas studio.',
    defaultPrompt: 'Foto produk komersial berkualitas tinggi. Tempatkan produk ini di atas podium marmer dengan latar belakang studio minimalis. Pencahayaan softbox profesional, pantulan elegan.',
    minImages: 1,
    maxImages: 1
  },
  fashion: {
    id: 'fashion',
    title: 'Foto Fashion',
    description: 'Katalog fashion dengan model AI.',
    defaultPrompt: 'Foto editorial fashion High-End. Model mengenakan pakaian ini berpose di jalanan kota New York (Street Style). Pencahayaan natural, depth of field (bokeh) pada background.',
    minImages: 1,
    maxImages: 1
  },
  mockup: {
    id: 'mockup',
    title: 'Buat Mockup',
    description: 'Terapkan desain pada objek nyata.',
    defaultPrompt: 'Terapkan desain logo/gambar ini ke permukaan [Mug / Kaos / Billboard] secara realistis. Sesuaikan perspektif dan lengkungan agar terlihat menyatu.',
    minImages: 1,
    maxImages: 2
  },
  banner: {
    id: 'banner',
    title: 'Buat Banner',
    description: 'Desain banner promosi layout profesional.',
    defaultPrompt: 'Desain Banner Iklan Web untuk produk ini. Layout modern dan bersih. Sisakan ruang kosong (negative space) di sebelah kanan untuk teks. Gunakan warna-warna brand yang elegan.',
    minImages: 1,
    maxImages: 2
  },
  carousel: {
    id: 'carousel',
    title: 'Buat Carousel',
    description: 'Konten slide sosial media yang menarik.',
    defaultPrompt: 'Buat desain Slide Carousel Instagram yang edukatif dan menarik secara visual. Gaya ilustrasi 3D modern atau Flat Design. Warna cerah dan layout rapi.',
    minImages: 1,
    maxImages: 3
  },
  flayer: {
    id: 'flayer',
    title: 'Desain Flyer',
    description: 'Brosur/Selebaran promosi siap cetak.',
    defaultPrompt: 'Desain Flyer Promosi ukuran A4. Headline besar dan menarik di bagian atas. Tampilkan produk utama di tengah dengan menarik. Gaya desain: Modern Corporate / Food & Beverage.',
    minImages: 1,
    maxImages: 2
  },

  // SPECIAL & DOWNLOADERS
  banana: {
    id: 'banana',
    title: 'Banana AI (Fast)',
    description: 'Generasi gambar super cepat (Turbo Mode).',
    defaultPrompt: 'Ciptakan karya seni digital yang kreatif dan penuh warna. Gaya: Cyberpunk / Abstract / Surrealism.',
    minImages: 0,
    maxImages: 1
  },
  veo: {
    id: 'veo',
    title: 'Google Veo 3',
    description: 'Generasi video sinematik tercanggih.',
    defaultPrompt: 'A cinematic drone shot of a futuristic city at night, neon lights, flying cars, photorealistic 8k.',
    minImages: 0,
    maxImages: 1,
    type: 'video'
  },
  
  youtube: {
    id: 'youtube',
    title: 'Youtube Downloader',
    description: 'Unduh video Youtube (MP4/MP3).',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  tiktok: {
    id: 'tiktok',
    title: 'Tiktok Downloader',
    description: 'Unduh video Tiktok tanpa watermark.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  instagram: {
    id: 'instagram',
    title: 'Instagram Downloader',
    description: 'Unduh Foto, Video, Reels & Stories.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  facebook: {
    id: 'facebook',
    title: 'Facebook Downloader',
    description: 'Unduh video publik Facebook.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  },
  twitter: {
    id: 'twitter',
    title: 'X Downloader',
    description: 'Unduh video & GIF dari Twitter/X.',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0,
    type: 'downloader'
  }
};

const Typewriter: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes
    setDisplayText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse border-r-2 border-emerald-500 ml-0.5"></span>
    </span>
  );
};

const FeatureCard: React.FC<{ feature: FeatureConfig; onClick: () => void; delay: number }> = ({ feature, onClick, delay }) => (
  <button
    onClick={onClick}
    className="group relative p-6 bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 dark:hover:bg-white/10 transition-all duration-300 text-left overflow-hidden hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md border border-slate-200 dark:border-white/5 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20">
         {feature.type === 'video' ? <Video className="text-emerald-600 dark:text-emerald-400" size={20} /> : feature.type === 'chat' ? <MessageSquare className="text-blue-600 dark:text-blue-400" size={20} /> : <Sparkles className="text-emerald-600 dark:text-emerald-400" size={20} />}
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{feature.description}</p>
    </div>

    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
      <ArrowRight className="text-emerald-500 dark:text-emerald-400" size={20} />
    </div>
  </button>
);

const Dashboard: React.FC<{ onNavigate: (mode: FeatureMode) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0F172A] border border-slate-800 shadow-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/30 to-transparent"></div>
         
         <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <Activity size={12} /> System Online v3.1
               </div>
               <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  Andri AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pro</span>
               </h1>
               
               <div className="text-lg text-slate-400 leading-relaxed max-w-xl min-h-[90px]">
                  <Typewriter 
                    text="Enterprise-grade Generative AI Platform untuk advanced photo manipulation, next-level graphic design, dan cinematic video rendering." 
                    speed={25}
                  />
                  <br/>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-1000 fill-mode-backwards">
                     <span className="text-emerald-500/80 text-sm mt-2 block font-mono">Powered by Google Gemini 2.5 + Veo latest build.</span>
                     <span className="text-slate-500 text-xs mt-1 block font-mono">Engineered & maintained by Andri Waskitho.</span>
                  </div>
               </div>

               <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => onNavigate('merge')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                     <Layers size={18} /> Mulai Gabung Foto
                  </button>
                  <button onClick={() => onNavigate('imagine')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2">
                     <Image size={18} /> Buat Gambar (Imagine)
                  </button>
               </div>
            </div>
            
            {/* Holographic Visual (Lottie Animation) - ENLARGED */}
            <div className="w-full md:w-5/12 relative aspect-square md:aspect-auto h-80 md:h-[400px] flex items-center justify-center">
               <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse"></div>
               {/* @ts-ignore */}
               <dotlottie-wc 
                  src="https://lottie.host/5a41cfbe-1d43-4e11-a3c3-0ae05bdc2ce9/Cc9HVCmP3t.lottie" 
                  autoplay 
                  loop
                  style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
               ></dotlottie-wc>
            </div>
         </div>

         {/* Ticker */}
         <div className="bg-black/40 border-t border-white/5 py-2 px-6 flex items-center overflow-hidden">
            <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-mono text-emerald-500/70">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> GEMINI 3 PRO ENGINE ACTIVE</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> VEO VIDEO RENDER READY</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> GPU CLUSTER OPTIMIZED</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> LATENCY: 12ms</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> SECURE CONNECTION</span>
            </div>
         </div>
      </div>

      {/* Feature Highlights Grid */}
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
         <Zap className="text-yellow-400" /> Fitur Unggulan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
         {/* Removed Chatbot Card since it's now a global widget */}
         <FeatureCard feature={FEATURES.imagine} onClick={() => onNavigate('imagine')} delay={100} />
         <FeatureCard feature={FEATURES.veo} onClick={() => onNavigate('veo')} delay={200} />
         <FeatureCard feature={FEATURES.faceswap} onClick={() => onNavigate('faceswap')} delay={300} />
         <FeatureCard feature={FEATURES.banana} onClick={() => onNavigate('banana')} delay={400} />
      </div>

      {/* NEW: Creative Showcase Gallery */}
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 delay-300">
         <Palette className="text-purple-500" /> Galeri Inspirasi AI
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 h-96 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
         <div className="relative group rounded-2xl overflow-hidden h-full md:col-span-2 md:row-span-2 shadow-lg border border-white/10">
            {/* UPDATED IMAGE URL: 3D Fluid Abstract (Reliable) */}
            <img 
               src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80" 
               alt="Showcase 1" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
               <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">3D Art</span>
               <h3 className="text-white font-bold text-xl">Holographic Flow</h3>
            </div>
         </div>
         <div className="relative group rounded-2xl overflow-hidden h-48 md:h-full shadow-lg border border-white/10">
             {/* UPDATED IMAGE URL: Fashion Portrait (Reliable) */}
             <img 
               src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" 
               alt="Showcase 2" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <span className="text-white font-bold border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm">Fashion AI</span>
            </div>
         </div>
         <div className="relative group rounded-2xl overflow-hidden h-48 md:h-full shadow-lg border border-white/10">
             {/* UPDATED IMAGE URL: Vaporwave Gradient (Reliable) */}
             <img 
               src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80" 
               alt="Showcase 3" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <span className="text-white font-bold border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm">Gradient</span>
            </div>
         </div>
          <div className="relative group rounded-2xl overflow-hidden h-48 md:h-full md:col-span-2 shadow-lg border border-white/10">
             {/* UPDATED IMAGE URL: Tech Abstract (Reliable) */}
             <img 
               src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80" 
               alt="Showcase 4" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
               <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Tech Visuals</span>
               <h3 className="text-white font-bold text-lg">Digital Data</h3>
            </div>
         </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="space-y-4">
            <h3 className="text-lg font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
               <Camera size={18} /> Studio Suite
            </h3>
            <div className="space-y-2">
               <button onClick={() => onNavigate('prewedding')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Heart size={16} /> Foto Prewedding
               </button>
               <button onClick={() => onNavigate('wedding')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Heart size={16} /> Foto Wedding
               </button>
               <button onClick={() => onNavigate('umrah')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Globe size={16} /> Umrah / Haji
               </button>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
               <Briefcase size={18} /> Business Tools
            </h3>
            <div className="space-y-2">
               <button onClick={() => onNavigate('product')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Briefcase size={16} /> Foto Produk
               </button>
               <button onClick={() => onNavigate('flayer')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Layers size={16} /> Desain Flyer
               </button>
               <button onClick={() => onNavigate('banner')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Layers size={16} /> Buat Banner
               </button>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-lg font-bold text-purple-500 uppercase tracking-wider flex items-center gap-2">
               <Music size={18} /> Media Download
            </h3>
            <div className="space-y-2">
               <button onClick={() => onNavigate('youtube')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Youtube size={16} /> Youtube
               </button>
               <button onClick={() => onNavigate('tiktok')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Music size={16} /> Tiktok
               </button>
               <button onClick={() => onNavigate('instagram')} className="w-full text-left p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-3">
                  <Instagram size={16} /> Instagram
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMode, setCurrentMode] = useState<FeatureMode>('home');
  // Theme State: 'dark' by default
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Check session
    const session = localStorage.getItem('andri_ai_session');
    if (session === 'active') {
      setIsLoggedIn(true);
    }
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (status: boolean) => {
    setIsLoggedIn(status);
    if (status) {
      localStorage.setItem('andri_ai_session', 'active');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('andri_ai_session');
    setCurrentMode('home');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen font-[Inter] transition-colors duration-300 ${theme === 'dark' ? 'bg-[#09090b] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar 
        currentMode={currentMode} 
        onNavigate={setCurrentMode} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-72 p-8 overflow-y-auto h-screen relative transition-all">
        {/* Top Bar / Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="hover:text-emerald-500 cursor-pointer" onClick={() => setCurrentMode('home')}>Application</span>
              <span>/</span>
              <span className="text-emerald-500 font-bold uppercase">{FEATURES[currentMode].title}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 System Stable
              </div>
           </div>
        </div>

        {/* Content Router */}
        {currentMode === 'home' ? (
          <Dashboard onNavigate={setCurrentMode} />
        ) : currentMode === 'settings' ? (
          <AdminSettings theme={theme} setTheme={setTheme} />
        ) : currentMode === 'profile' ? (
          <UserProfile />
        ) : (
          <ImageMerger feature={FEATURES[currentMode]} />
        )}

        {/* Global Floating Chatbot Widget */}
        <ChatBot />

        {/* Footer Copyrights */}
        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-white/5 text-center transition-colors">
           <div className="flex flex-col items-center gap-2">
              <h4 className="text-slate-700 dark:text-white font-bold tracking-tight">Andri AI Pro <span className="text-emerald-500">v3.1</span></h4>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                 Platform Enterprise AI untuk manipulasi visual tingkat lanjut. Dilarang keras menyalin atau mendistribusikan ulang kode sumber tanpa izin.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-600 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full border border-black/5 dark:border-white/5">
                 <ShieldCheck size={12} className="text-emerald-500" />
                 <span>Copyright © {new Date().getFullYear()} by Andri Waskitho. All rights reserved.</span>
              </div>
           </div>
        </footer>

      </main>
    </div>
  );
};

export default App;
