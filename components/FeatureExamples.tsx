
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FeatureMode } from '../types';

interface ExampleData {
  inputs: string[];
  output: string;
  label: string;
  description: string;
}

// Helper to get reliable Unsplash images with specific dimensions
const getImg = (id: string, w: number = 300) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const FEATURE_EXAMPLES: Partial<Record<FeatureMode, ExampleData>> = {
  // --- MENU UTAMA ---
  home: { inputs: [], output: "", label: "", description: "" },
  settings: { inputs: [], output: "", label: "", description: "" },
  profile: { inputs: [], output: "", label: "", description: "" },
  chatbot: { inputs: [], output: "", label: "", description: "" }, // No example needed for chat
  
  banana: {
    inputs: [getImg('1618005182384-a83a8bd57fbe', 150)], // Abstract
    output: getImg('1550684848-fac1c5b4e853', 400), // Vaporwave Art
    label: "Banana Art",
    description: "Generasi seni abstrak super cepat & kreatif."
  },
  veo: {
    inputs: [getImg('1470071459604-3b5ec3a7fe05', 150)], // Nature
    output: getImg('1492691527719-9d1e07e534b4', 400), // Cinematic Landscape
    label: "Cinematic Video",
    description: "Visual video kualitas tinggi dari teks."
  },

  // --- EDITING ---
  merge: {
    inputs: [
      getImg('1534528741775-53994a69daeb', 150), // Woman Portrait
      getImg('1479030160180-b1860951d6ec', 150)  // Nature Background
    ],
    output: getImg('1515886657613-9f3515b0c78f', 400), // Artistic Composite
    label: "Komposisi Visual",
    description: "Gabungkan subjek dengan latar belakang baru secara seamless."
  },
  thumbnail: {
    inputs: [getImg('1535713875002-d1d0cf377fde', 150)],
    output: getImg('1611162617474-5b21e879e113', 400), // Colorful YouTube style
    label: "Thumbnail YouTube",
    description: "Buat thumbnail clickbait dengan teks dan ekspresi dramatis."
  },
  expand: {
    inputs: [getImg('1469334031218-e382a71b716b', 150)], // Portrait girl
    output: getImg('1470770841072-f978cf4d019e', 400), // Wide landscape
    label: "Perluas Foto",
    description: "Ubah rasio foto dengan menambahkan latar belakang otomatis."
  },
  edit: {
    inputs: [getImg('1517841905240-472988babdf9', 150)], // Girl in city
    output: getImg('1529139574466-a30222ade8ce', 400), // Girl in forest (edited)
    label: "Magic Edit",
    description: "Ubah objek, baju, atau lokasi dengan instruksi teks."
  },
  removeobj: {
    inputs: [getImg('1512353087831-506740398914', 150)], // Desk with object
    output: getImg('1493723843689-ce14595a1808', 400), // Clean desk
    label: "Hapus Objek",
    description: "Hilangkan objek yang mengganggu dari foto dengan bersih."
  },
  removebg: {
    inputs: [getImg('1534528741775-53994a69daeb', 150)], // Woman Portrait
    output: getImg('1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80&bg=fff', 400), // Woman on white (simulated)
    label: "Hapus Background",
    description: "Isolasi subjek dan ganti background menjadi putih polos."
  },
  restore: {
    inputs: [getImg('1515510697926-21804c814424', 150)], // BW Old style
    output: getImg('1500648767791-00dcc994a43e', 400), // Colorized HD
    label: "Restorasi Foto",
    description: "Pertajam foto buram dan warnai foto hitam putih."
  },
  faceswap: {
    inputs: [
      getImg('1500648767791-00dcc994a43e', 150), // Source Face (Man)
      getImg('1507679721516-fed88b35c610', 150)  // Target Body (Suit)
    ],
    output: getImg('1560250097-0b93528c311a', 400), // Result Man in Suit
    label: "Tukar Wajah",
    description: "Ganti wajah target dengan wajah sumber secara realistis."
  },
  animate: {
    inputs: [getImg('1470071459604-3b5ec3a7fe05', 150)], // Nature
    output: getImg('1472214103451-9374bd1c7dd1', 400), // Nature Motion
    label: "Animate Veo",
    description: "Ubah foto diam menjadi video cinematic (Zoom/Pan)."
  },
  videofaceswap: {
    inputs: [
      getImg('1494790108377-be9c29b29330', 150), // Woman Smiling
    ],
    output: getImg('1492633426602-9dd7f241c728', 400), // Cinematic Video Look
    label: "Video Animasi",
    description: "Hidupkan foto diam menjadi video bergerak."
  },
  fitting: {
    inputs: [
      getImg('1534528741775-53994a69daeb', 150), // Model
      getImg('1515347619252-60a6bf4fffce', 150)  // Dress
    ],
    output: getImg('1515886657613-9f3515b0c78f', 400), // Result Fashion
    label: "Virtual Try-On",
    description: "Coba pakaian secara virtual pada foto model."
  },

  // --- STUDIO FOTO AI ---
  prewedding: {
    inputs: [
        getImg('1500648767791-00dcc994a43e', 150), // Man
        getImg('1534528741775-53994a69daeb', 150)  // Woman
    ], 
    output: getImg('1515934751635-c81c6bc9a2d8', 400), // Wedding Couple
    label: "Prewedding Merge",
    description: "Gabungkan foto pria dan wanita menjadi satu frame prewedding."
  },
  wedding: {
    inputs: [getImg('1519741497674-611481863552', 150)], // Wedding
    output: getImg('1511285560987-54db96628f63', 400), // Grand Wedding
    label: "Wedding Luxury",
    description: "Simulasi pernikahan mewah dengan dekorasi impian."
  },
  babyborn: {
    inputs: [getImg('1519689609971-54e634566b43', 150)], // Baby
    output: getImg('1555252309-43b384c7a02c', 400), // Newborn Art
    label: "Newborn Art",
    description: "Foto bayi dengan properti lucu dan pencahayaan lembut."
  },
  kids: {
    inputs: [getImg('1471286174899-8c1175250478', 150)], // Kid
    output: getImg('1503454537195-1dcabb73ffb9', 400), // Playful Kid
    label: "Kids Portrait",
    description: "Foto anak ceria dengan tema fantasi atau studio."
  },
  maternity: {
    inputs: [getImg('1562591979-913a86c67530', 150)], // Pregnant Woman
    output: getImg('1584266347743-30648f52210e', 400), // Artistic Maternity
    label: "Maternity",
    description: "Foto kehamilan elegan dengan siluet dramatis."
  },
  umrah: {
    inputs: [getImg('1507003211169-0a1dd7228f2d', 150)], // Man Portrait
    output: getImg('1565611746243-e4d650085a60', 400), // Mecca/Kaaba
    label: "Tanah Suci",
    description: "Edit foto berlatar belakang Masjidil Haram atau Kaabah."
  },
  passphoto: {
    inputs: [getImg('1500648767791-00dcc994a43e', 150)], // Man Casual
    output: getImg('1506803682981-6e718a9dd3ee', 400), // Man Formal
    label: "Pas Foto",
    description: "Ganti baju formal dan background merah/biru otomatis."
  },

  // --- DESAIN & SENI ---
  interior: {
    inputs: [getImg('1586023492125-27b2c045efd7', 150)], // Empty Room
    output: getImg('1618221195710-dd6b41faaea6', 400), // Furnished Room
    label: "Interior Design",
    description: "Isi ruangan kosong dengan desain furniture modern."
  },
  exterior: {
    inputs: [getImg('1568605117036-5fe5e7bab0b7', 150)], // Sketch House
    output: getImg('1600585154340-be6161a56a0c', 400), // Modern House
    label: "Exterior Render",
    description: "Visualisasi arsitektur rumah dari sketsa kasar."
  },
  sketch: {
    inputs: [getImg('1507003211169-0a1dd7228f2d', 150)], // Man
    output: getImg('1580251703260-c3613094ed48', 400), // Sketch
    label: "Pencil Sketch",
    description: "Ubah foto menjadi lukisan sketsa pensil artistik."
  },
  caricature: {
    inputs: [getImg('1542909168-82c3e7fdca5c', 150)], // Face
    output: getImg('1544568100-847a948fac63', 400), // Cartoon/Art
    label: "Karikatur 3D",
    description: "Ubah wajah menjadi karakter 3D atau kartun lucu."
  },

  // --- BISNIS & PROMOSI ---
  fotomodel: {
    inputs: [getImg('1523381210434-271e8be1f52b', 150)], // T-shirt
    output: getImg('1515886657613-9f3515b0c78f', 400), // Model Wearing It
    label: "AI Fashion Model",
    description: "Model AI mengenakan produk fashion Anda."
  },
  product: {
    inputs: [getImg('1523275335684-37898b6baf30', 150)], // Watch
    output: getImg('1505740420928-5e560c06d30e', 400), // Product Studio
    label: "Product Studio",
    description: "Foto produk profesional dengan lighting studio."
  },
  fashion: {
    inputs: [getImg('1515347619252-60a6bf4fffce', 150)], // Dress
    output: getImg('1483985988355-763728e1935b', 400), // Fashion Model
    label: "Fashion Catalog",
    description: "Model AI memakai produk fashion Anda secara otomatis."
  },
  mockup: {
    inputs: [getImg('1629367494556-f4877399ef30', 150)], // Logo
    output: getImg('1517260739837-70ebdfdf6c06', 400), // Mockup on paper/wall
    label: "Mockup Branding",
    description: "Tempel logo atau desain pada objek nyata."
  },
  banner: {
    inputs: [getImg('1542291026-7eec264c27ff', 150)], // Shoe Product
    output: getImg('1557804506-669a67965ba0', 400), // Banner Ad
    label: "Banner Iklan",
    description: "Desain banner promosi untuk web dan sosmed."
  },
  carousel: {
    inputs: [getImg('1434030216411-0b793f4b4173', 150)], // Concept
    output: getImg('1611162617474-5b21e879e113', 400), // Carousel Slide
    label: "IG Carousel",
    description: "Slide edukasi atau promosi berurutan."
  },
  flayer: {
    inputs: [getImg('1497935586351-b67a49e012bf', 150)], // Coffee
    output: getImg('1586880244406-556ebe35f282', 400), // Menu Flyer
    label: "Flyer Design",
    description: "Desain selebaran promosi siap cetak."
  },

  // --- DOWNLOADERS ---
  youtube: {
    inputs: [],
    output: getImg('1611162616475-99137d7b5758', 400), // YouTube UI vibe
    label: "YouTube Video",
    description: "Unduh video Youtube resolusi tinggi."
  },
  tiktok: {
    inputs: [],
    output: getImg('1611605698323-b91986977187', 400), // Mobile video vibe
    label: "TikTok Video",
    description: "Unduh tanpa watermark."
  },
  instagram: {
    inputs: [],
    output: getImg('1611262588024-d12430b98920', 400), // IG vibe
    label: "IG Reels",
    description: "Simpan foto dan video Instagram."
  },
  facebook: {
    inputs: [],
    output: getImg('1563986768609-322da13575f3', 400), // FB vibe
    label: "FB Video",
    description: "Simpan video dari Facebook."
  },
  twitter: {
    inputs: [],
    output: getImg('1611605698323-b91986977187', 400), // Twitter vibe
    label: "X / Twitter",
    description: "Unduh media dari X."
  }
};

export const FeatureExample: React.FC<{ mode: FeatureMode }> = ({ mode }) => {
  const example = FEATURE_EXAMPLES[mode];

  if (!example || !example.output) return null;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-xl p-6 border border-slate-200/60 mb-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-emerald-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{example.label} — Contoh Hasil</h3>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        {/* Inputs */}
        <div className="flex -space-x-4">
          {example.inputs.map((src, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-md transform transition-transform hover:scale-105 hover:z-10 bg-slate-200">
              <img src={src} alt={`Input ${i}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                Input {i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Arrow (Only if inputs exist) */}
        {example.inputs.length > 0 && (
          <div className="hidden md:flex flex-col items-center justify-center text-slate-300">
            <ArrowRight size={24} />
            <span className="text-[10px] font-bold mt-1">PROCESS</span>
          </div>
        )}

        {/* Output */}
        <div className="relative w-full md:w-64 aspect-video md:aspect-auto md:h-32 rounded-lg overflow-hidden border-2 border-emerald-200 shadow-lg group bg-slate-200">
           <img src={example.output} alt="Output Result" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
             <p className="text-white text-xs font-medium line-clamp-2">{example.description}</p>
           </div>
           <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
             RESULT
           </div>
        </div>
      </div>
    </div>
  );
};