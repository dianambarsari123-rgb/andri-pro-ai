
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ImageMerger from './components/ImageMerger';
import Login from './components/Login';
import AdminSettings from './components/AdminSettings';
import { Menu, Sparkles, ArrowRight, Image as ImageIcon, Zap, Layers } from 'lucide-react';
import { FeatureMode, FeatureConfig } from './types';

// Configuration for all app features
const FEATURES: Record<FeatureMode, FeatureConfig> = {
  home: {
    id: 'home',
    title: 'Beranda',
    description: 'Selamat datang di Andri AI Pro',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0
  },
  settings: {
    id: 'settings',
    title: 'Pengaturan Admin',
    description: 'Konfigurasi Sistem Superadmin',
    defaultPrompt: '',
    minImages: 0,
    maxImages: 0
  },
  
  // --- Edit & Gabung ---
  merge: {
    id: 'merge',
    title: 'Gabungkan Gambar',
    description: 'Buat komposisi visual baru dari koleksi foto Anda menggunakan AI.',
    defaultPrompt: 'Foto iklan premium: Pria tampan dengan senyum karismatik sedang menikmati Keripik Talas CrizeBz Mbothe. Close-up, pencahayaan studio.',
    minImages: 2,
    maxImages: 5
  },
  thumbnail: {
    id: 'thumbnail',
    title: 'Foto Miniatur (Thumbnail)',
    description: 'Buat thumbnail YouTube atau cover media sosial yang menarik perhatian.',
    defaultPrompt: 'YouTube thumbnail: Ekspresi terkejut, teks besar "WOW", latar belakang kontras tinggi, warna cerah.',
    minImages: 1,
    maxImages: 1
  },
  expand: {
    id: 'expand',
    title: 'Perluas Foto (Outpainting)',
    description: 'Perluas latar belakang foto Anda secara seamless untuk rasio yang berbeda.',
    defaultPrompt: 'Perluas gambar ini, tambahkan latar belakang pemandangan alam yang indah dan realistis.',
    minImages: 1,
    maxImages: 1
  },
  edit: {
    id: 'edit',
    title: 'Edit Foto Magic',
    description: 'Ubah elemen dalam foto atau ganti latar belakang dengan instruksi teks.',
    defaultPrompt: 'Ganti latar belakang menjadi pantai saat matahari terbenam.',
    minImages: 1,
    maxImages: 1
  },
  faceswap: {
    id: 'faceswap',
    title: 'Face Swap (Foto)',
    description: 'Tukar wajah antar foto dengan hasil yang natural dan realistis.',
    defaultPrompt: 'Tukar wajah dari foto pertama ke orang di foto kedua. Pastikan lighting menyatu.',
    minImages: 2,
    maxImages: 2
  },
  videofaceswap: {
    id: 'videofaceswap',
    title: 'Video Face Swap / Animate',
    description: 'Hidupkan foto wajah menjadi video bergerak yang realistis (Veo AI).',
    defaultPrompt: 'Video sinematik close-up, orang ini sedang tersenyum ramah dan berbicara ke arah kamera, pencahayaan natural, resolusi tinggi.',
    minImages: 1,
    maxImages: 1,
    type: 'video'
  },
  fitting: {
    id: 'fitting',
    title: 'Kamar Pas (Fitting Room)',
    description: 'Cobalah pakaian secara virtual. Upload foto orang dan foto baju.',
    defaultPrompt: 'Pakaikan baju dari gambar kedua ke orang di gambar pertama dengan pas dan realistis.',
    minImages: 2,
    maxImages: 2
  },
  
  // --- New Feature: Nano Banana ---
  banana: {
    id: 'banana',
    title: 'Banana AI (Fast)',
    description: 'Mode kreatif super cepat menggunakan model Nano Banana.',
    defaultPrompt: 'Buat gambar surealis penuh warna, elemen buah pisang neon yang artistik.',
    minImages: 0,
    maxImages: 1
  },

  // --- New Feature: Veo 3 ---
  veo: {
    id: 'veo',
    title: 'Google Veo 3 (Video)',
    description: 'Generasi video AI berkualitas tinggi (1080p).',
    defaultPrompt: 'Video sinematik: Drone shot pemandangan pegunungan saat sunrise, kabut bergerak perlahan, 4k detail.',
    minImages: 0,
    maxImages: 1,
    type: 'video'
  },

  // --- Studio Foto AI ---
  prewedding: {
    id: 'prewedding',
    title: 'Foto Prewedding',
    description: 'Ubah foto couple biasa menjadi foto prewedding yang romantis dan estetik.',
    defaultPrompt: 'Foto prewedding romantis di tebing pinggir laut saat sunset, gaun putih elegan, cinematic lighting.',
    minImages: 1,
    maxImages: 2
  },
  wedding: {
    id: 'wedding',
    title: 'Foto Wedding',
    description: 'Simulasi foto pernikahan atau edit foto pernikahan menjadi lebih megah.',
    defaultPrompt: 'Foto pernikahan megah di dalam ballroom mewah, dekorasi bunga putih, pencahayaan dramatis.',
    minImages: 1,
    maxImages: 2
  },
  babyborn: {
    id: 'babyborn',
    title: 'Baby Born Foto',
    description: 'Buat foto bayi baru lahir dengan tema-tema lucu dan menggemaskan.',
    defaultPrompt: 'Foto newborn baby, tertidur pulas di dalam keranjang rotan dengan selimut bulu lembut, tema nature.',
    minImages: 1,
    maxImages: 1
  },
  kids: {
    id: 'kids',
    title: 'Kids Foto',
    description: 'Foto studio anak yang ceria dan penuh warna.',
    defaultPrompt: 'Foto portrait anak ceria, memegang balon warna-warni, latar belakang taman bermain fantasi.',
    minImages: 1,
    maxImages: 1
  },
  maternity: {
    id: 'maternity',
    title: 'Foto Maternity',
    description: 'Abadikan momen kehamilan dengan gaya elegan dan artistik.',
    defaultPrompt: 'Foto maternity elegan, siluet ibu hamil di depan jendela besar dengan tirai putih transparan.',
    minImages: 1,
    maxImages: 1
  },
  umrah: {
    id: 'umrah',
    title: 'Foto Umrah / Haji',
    description: 'Edit foto dengan latar belakang tanah suci Mekkah atau Madinah.',
    defaultPrompt: 'Foto di depan Kaabah Masjidil Haram, memakai pakaian ihram putih, suasana spiritual dan tenang.',
    minImages: 1,
    maxImages: 1
  },
  passphoto: {
    id: 'passphoto',
    title: 'Pas Foto Warna',
    description: 'Buat pas foto formal dengan background Merah, Biru, atau Putih.',
    defaultPrompt: 'Pas foto formal, wajah menghadap depan, background warna merah polos, kemeja putih rapi.',
    minImages: 1,
    maxImages: 1
  },

  // --- Desain & Seni ---
  interior: {
    id: 'interior',
    title: 'Desain Interior',
    description: 'Visualisasikan desain ruangan dari sketsa atau foto ruangan kosong.',
    defaultPrompt: 'Desain interior ruang tamu gaya Japandi, minimalis, lantai kayu, sofa krem, tanaman hias indoor.',
    minImages: 1,
    maxImages: 2
  },
  exterior: {
    id: 'exterior',
    title: 'Desain Eksterior',
    description: 'Desain fasad bangunan dan lansekap dari sketsa atau foto.',
    defaultPrompt: 'Desain eksterior rumah modern tropis 2 lantai, fasad batu alam dan kayu, ada taman depan.',
    minImages: 1,
    maxImages: 2
  },
  sketch: {
    id: 'sketch',
    title: 'Sketsa Gambar',
    description: 'Ubah foto menjadi sketsa pensil atau gambar teknik.',
    defaultPrompt: 'Ubah foto ini menjadi sketsa pensil artistik hitam putih, detail arsir halus.',
    minImages: 1,
    maxImages: 1
  },
  caricature: {
    id: 'caricature',
    title: 'Art & Karikatur',
    description: 'Ubah wajah menjadi karikatur lucu atau gaya lukisan artistik.',
    defaultPrompt: `An ultra-realistic large head caricature of a man like the uploaded image, wearing a 'Facebook' t-shirt in the same color as Facebook, a black stopwatch in his hand, jeans, and white shoes with a face that matches the reference image, sitting casually on a large blue round logo that says "Facebook". Around him are scattered 3D Facebook emoji icons such as a red heart, a thumbs up, a laughing face, and a happy crying face, as well as a red notification that says "34K Followers". The background is a miniature modern city with winding roads, small cars, and green trees, the National Monument, lit by a soft golden sunset light. Medium angle camera, sharp focus on the face, realistic natural lighting, realistic skin and fabric textures, natural warm tones, the result of professional photography style. There is a small "AND - Digital Official" logo in the upper right corner.`,
    minImages: 1,
    maxImages: 1
  },

  // --- Produk & Promosi ---
  product: {
    id: 'product',
    title: 'Foto Produk Profesional',
    description: 'Ubah foto produk biasa menjadi materi iklan kelas studio.',
    defaultPrompt: 'Foto produk profesional, letakkan produk di atas podium marmer, pencahayaan softbox, elegan.',
    minImages: 1,
    maxImages: 1
  },
  fashion: {
    id: 'fashion',
    title: 'Foto Fashion AI',
    description: 'Generate model virtual menggunakan pakaian dari foto Anda.',
    defaultPrompt: 'Model fashion wanita eropa memakai baju ini, pose berjalan di jalanan kota Paris.',
    minImages: 1,
    maxImages: 1
  },
  mockup: {
    id: 'mockup',
    title: 'Buat Mockup',
    description: 'Aplikasikan desain Anda ke berbagai objek realistis.',
    defaultPrompt: 'Tampilkan desain logo ini di atas mug keramik putih di meja kayu cozy.',
    minImages: 1,
    maxImages: 1
  },
  banner: {
    id: 'banner',
    title: 'Buat Banner Iklan',
    description: 'Desain banner promosi visual dari teks atau referensi.',
    defaultPrompt: 'Banner promosi diskon 50% untuk toko sepatu, gaya modern dan minimalis.',
    minImages: 0,
    maxImages: 1
  },
  carousel: {
    id: 'carousel',
    title: 'Konten Carousel',
    description: 'Buat desain slide media sosial yang informatif.',
    defaultPrompt: 'Slide edukasi tentang tips kesehatan, ilustrasi flat design modern.',
    minImages: 0,
    maxImages: 1
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<FeatureMode>('home');

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  const activeFeature = FEATURES[currentMode];

  const handleNavigate = (mode: FeatureMode) => {
    setCurrentMode(mode);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentMode('home');
  };

  const renderContent = () => {
    if (currentMode === 'home') {
      return (
        <div className="py-10 animate-in fade-in zoom-in duration-500">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="text-emerald-600 w-10 h-10 relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
              Selamat Datang di <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Andri AI Pro</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Halo Superadmin, platform all-in-one Anda untuk kreasi visual tanpa batas. Mulai proyek baru dengan memilih fitur di bawah ini.
            </p>
          </div>
          
          {/* Main Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {/* Card 1: Merge */}
            <div 
              onClick={() => setCurrentMode('merge')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 group
                hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-blue-100 group-hover:shadow-blue-500/20 relative z-10">
                <Layers className="text-blue-500 w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors relative z-10">Gabung Foto</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Buat komposisi visual baru dengan menggabungkan multiple images.</p>
            </div>

            {/* Card 2: Video */}
            <div 
              onClick={() => setCurrentMode('veo')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 group
                hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-purple-100 group-hover:shadow-purple-500/20 relative z-10">
                <Zap className="text-purple-500 w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-purple-600 transition-colors relative z-10">Video AI</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Generasi video berkualitas tinggi 1080p dengan Google Veo.</p>
            </div>

            {/* Card 3: Business */}
            <div 
              onClick={() => setCurrentMode('product')}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 group
                hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-orange-100 group-hover:shadow-orange-500/20 relative z-10">
                <Sparkles className="text-orange-500 w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-orange-600 transition-colors relative z-10">Bisnis</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Buat foto produk profesional dan materi promosi instan.</p>
            </div>
          </div>

          {/* New Section: Inspiration Gallery */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
               <h3 className="text-2xl font-bold text-slate-800">Galeri Inspirasi</h3>
               <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Generated by Andri AI</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
               {/* Gallery Item 1 (Tall) */}
               <div className="group relative rounded-2xl overflow-hidden row-span-2 cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Fashion Portrait" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                     <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Portrait</span>
                     <h4 className="text-white font-bold text-lg">Fashion Editorial</h4>
                  </div>
               </div>

               {/* Gallery Item 2 */}
               <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=500&q=80" alt="Modern Architecture" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-bold border-b-2 border-emerald-500 pb-1">Architecture</span>
                  </div>
               </div>

               {/* Gallery Item 3 */}
               <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80" alt="Product Photography" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-bold border-b-2 border-orange-500 pb-1">Product</span>
                  </div>
               </div>

               {/* Gallery Item 4 (Tall) */}
               <div className="group relative rounded-2xl overflow-hidden row-span-2 cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80" alt="Neon Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                     <span className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">Neon Art</span>
                     <h4 className="text-white font-bold text-lg">Cyberpunk Style</h4>
                  </div>
               </div>

               {/* Gallery Item 5 */}
               <div className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 col-span-2 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80" alt="Landscape" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center p-8">
                      <div>
                         <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Landscape</span>
                         <h4 className="text-white font-bold text-lg">Cinematic Nature</h4>
                      </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      );
    }

    if (currentMode === 'settings') {
      return <AdminSettings />;
    }

    return (
      <ImageMerger 
        key={activeFeature.id} 
        feature={activeFeature} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        currentMode={currentMode} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        className="hidden md:flex" 
      />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0B1E26] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="font-bold text-lg flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-400" />
          Andri AI Pro
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0B1E26]/95 p-4 animate-in slide-in-from-left backdrop-blur-sm">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-white text-xl font-bold flex items-center gap-2">
               <Sparkles size={18} className="text-emerald-400" /> Menu
             </h2>
             <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2">Tutup</button>
           </div>
           
           <div className="h-full overflow-y-auto pb-20">
             <Sidebar 
               currentMode={currentMode} 
               onNavigate={handleNavigate}
               onLogout={handleLogout}
               className="w-full h-auto bg-transparent static"
             />
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-64 p-6 md:p-12 transition-all duration-300 ease-in-out min-h-screen">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
