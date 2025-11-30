
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FeatureMode } from '../types';

interface ExampleData {
  inputs: string[];
  output: string;
  label: string;
  description: string;
}

// Helper to get reliable Unsplash images
const getImg = (id: string, w: number = 300) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const FEATURE_EXAMPLES: Partial<Record<FeatureMode, ExampleData>> = {
  merge: {
    inputs: [
      getImg('1534528741775-53994a69daeb', 150), // Woman Portrait
      getImg('1470071459604-3b5ec3a7fe05', 150)  // Nature Background
    ],
    output: getImg('1520633887019-2457c177b908', 400), // Woman in Nature Composite
    label: "Komposisi Visual",
    description: "Gabungkan subjek dengan latar belakang baru secara seamless dan realistis."
  },
  faceswap: {
    inputs: [
      getImg('1500648767791-00dcc994a43e', 150), // Source Face (Man)
      getImg('1560250097-0b93528c311a', 150)  // Target Body (Man in Suit)
    ],
    output: getImg('1507003211169-0a1dd7228f2d', 400), // Result Professional
    label: "Tukar Wajah",
    description: "Ganti wajah target dengan wajah sumber secara realistis."
  },
  videofaceswap: {
    inputs: [
      getImg('1535713875002-d1d0cf377fde', 150), // Woman Face
    ],
    output: getImg('1492633426602-9dd7f241c728', 400), // Cinematic video thumbnail (simulated)
    label: "Video Animasi Wajah",
    description: "Hidupkan foto diam menjadi video bergerak sesuai instruksi (Veo)."
  },
  fitting: {
    inputs: [
      getImg('1534528741775-53994a69daeb', 150), // Model
      getImg('1434389677669-e08b4cac3105', 150)  // Clothes/Dress
    ],
    output: getImg('1496747611176-843222e1e57c', 400), // Result Model Wearing Dress
    label: "Virtual Try-On",
    description: "Cobalah pakaian baru pada foto Anda secara instan."
  },
  product: {
    inputs: [
      getImg('1542291026-7eec264c27ff', 150) // Red Shoe
    ],
    output: getImg('1560769625-ed597487d60e', 400), // Creative Shoe Shot
    label: "Foto Produk Studio",
    description: "Ubah foto produk sederhana menjadi materi iklan profesional."
  },
  interior: {
    inputs: [
      getImg('1513694203232-719a280e022f', 150) // Empty/White Room
    ],
    output: getImg('1618221195710-dd6b41faaea6', 400), // Furnished Living Room
    label: "Desain Interior",
    description: "Visualisasikan ruangan kosong menjadi desain interior menawan."
  },
  prewedding: {
    inputs: [
      getImg('1529626455594-4ff0802cfb7e', 150) // Couple Casual
    ],
    output: getImg('1515934751635-c81c6bc9a2d8', 400), // Cinematic couple sunset
    label: "Cinematic Prewedding",
    description: "Ubah foto biasa menjadi momen prewedding yang romantis."
  },
  wedding: {
    inputs: [
      getImg('1519741497674-611481863552', 150) // Wedding Indoor
    ],
    output: getImg('1511285560982-1351cdeb9821', 400), // Grand Wedding Venue
    label: "Wedding Glamour",
    description: "Tingkatkan kemewahan foto pernikahan Anda."
  },
  babyborn: {
    inputs: [
      getImg('1519689680058-324335c77eba', 150) // Baby Close up
    ],
    output: getImg('1510153806139-0d7af8f4528c', 400), // Newborn Setup
    label: "Newborn Photography",
    description: "Tema foto bayi yang lucu dan estetik."
  },
  kids: {
    inputs: [
      getImg('1488521787991-ed7bbaae773c', 150) // Kid Outside
    ],
    output: getImg('1503454537195-1dcabb73ffb9', 400), // Kid Portrait Studio
    label: "Foto Anak Ceria",
    description: "Abadikan momen ceria anak dengan lighting studio sempurna."
  },
  maternity: {
    inputs: [
      getImg('1551853613-2c176722d4d8', 150) // Pregnant Woman
    ],
    output: getImg('1584265538944-79350c377d01', 400), // Artistic Maternity
    label: "Maternity Elegan",
    description: "Foto kehamilan yang artistik dan penuh emosi."
  },
  passphoto: {
    inputs: [
      getImg('1506794778202-cad84cf45f1d', 150) // Portrait Man Casual
    ],
    output: getImg('1507003211169-0a1dd7228f2d', 400), // Formal Headshot
    label: "Pas Foto Formal",
    description: "Ganti background menjadi Merah/Biru untuk keperluan formal."
  },
  exterior: {
    inputs: [
      getImg('1564013799919-ab600027ffc6', 150) // House Construction
    ],
    output: getImg('1600596542815-a69096927579', 400), // Modern Luxury House
    label: "Desain Eksterior",
    description: "Ubah sketsa atau foto rumah lama menjadi desain modern."
  },
  sketch: {
    inputs: [
      getImg('1531123897727-8f129e1688ce', 150) // Portrait Woman
    ],
    output: getImg('1579783902614-a3fb3927b6a5', 400), // Pencil Sketch Art
    label: "Sketsa Artistik",
    description: "Ubah foto menjadi lukisan pensil atau sketsa."
  },
  caricature: {
    inputs: [
      getImg('1500648767791-00dcc994a43e', 150) // Man Face
    ],
    output: getImg('1580130601275-c9b0e352fa10', 400), // Illustration Style
    label: "Karikatur Lucu",
    description: "Gaya kartun 3D atau karikatur wajah yang unik."
  },
  banana: {
    inputs: [],
    output: getImg('1490750967868-69c2d016e346', 400), // Abstract Neon Art
    label: "Generasi Cepat",
    description: "Hasil kreatif instan dengan model Banana AI."
  },
  veo: {
    inputs: [],
    output: getImg('1464822759023-fed622ff2c3b', 400), // Mountain Landscape
    label: "Video Sinematik",
    description: "Buat video 1080p berkualitas tinggi dari teks."
  },
  umrah: {
    inputs: [
       getImg('1566938995577-62f43dc7f8c2', 150) // Man Smiling Portrait (High Quality)
    ],
    output: getImg('1565026939922-b5e28292d3d9', 400), // Kaaba / Mecca (Majestic)
    label: "Momen Tanah Suci",
    description: "Hadirkan suasana spiritual Mekkah dan Madinah."
  },
  thumbnail: {
    inputs: [
       getImg('1544005313-94ddf0286df2', 150) // Portrait Woman
    ],
    output: getImg('1611162617474-5b21e879e113', 400), // Colorful / Vibrant
    label: "Thumbnail Viral",
    description: "Desain thumbnail yang mengundang klik."
  },
  mockup: {
    inputs: [
      getImg('1611162617474-5b21e879e113', 150) // Abstract Graphic
    ],
    output: getImg('1517260739837-79eb90bd3d91', 400), // Coffee Mug Mockup
    label: "Mockup Realistis",
    description: "Tempel desain pada benda nyata."
  },
  expand: {
    inputs: [
      getImg('1470071459604-3b5ec3a7fe05', 150) // Nature Tight
    ],
    output: getImg('1472214103451-9374bd1c798e', 400), // Wide Nature
    label: "Perluas Foto",
    description: "Outpainting latar belakang agar lebih luas."
  },
  edit: {
    inputs: [
      getImg('1507525428034-b723cf961d3e', 150) // Beach Day
    ],
    output: getImg('1475924156734-496f6cac6ec1', 400), // Beach Sunset
    label: "Edit Magic",
    description: "Ubah suasana atau elemen foto dengan perintah teks."
  },
  banner: {
    inputs: [],
    output: getImg('1542314831-068cd1dbfeeb', 400), // Design Layout
    label: "Banner Promosi",
    description: "Desain banner profesional untuk kebutuhan iklan."
  },
  carousel: {
    inputs: [],
    output: getImg('1557804506-669a67965ba0', 400), // Slides/Presentation
    label: "Konten Carousel",
    description: "Slide edukatif dan visual untuk media sosial."
  },
  fashion: {
    inputs: [
       getImg('1434389677669-e08b4cac3105', 150) // Clothes
    ],
    output: getImg('1534528741775-53994a69daeb', 400), // Fashion Model
    label: "Foto Fashion",
    description: "Model virtual mengenakan produk fashion Anda."
  }
};

export const FeatureExample: React.FC<{ mode: FeatureMode }> = ({ mode }) => {
  const example = FEATURE_EXAMPLES[mode];

  if (!example) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center gap-2 mb-3 px-1">
         <Sparkles size={16} className="text-emerald-500" />
         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Contoh Hasil (Inspirasi)</h4>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            
            {/* Inputs */}
            {example.inputs.length > 0 && (
              <div className="flex gap-2">
                  {example.inputs.map((url, idx) => (
                    <div key={idx} className="relative group">
                       <img 
                          src={url} 
                          alt={`Input ${idx + 1}`} 
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm border border-white opacity-90 group-hover:opacity-100 transition-opacity bg-slate-200"
                          loading="lazy"
                       />
                       <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 rounded backdrop-blur-sm">
                          Input {idx + 1}
                       </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Arrow */}
            {example.inputs.length > 0 && (
              <div className="text-slate-400 rotate-90 md:rotate-0">
                  <ArrowRight size={24} className="animate-pulse" />
              </div>
            )}

            {/* Output */}
            <div className="relative group cursor-pointer">
               <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
               <img 
                  src={example.output} 
                  alt="Output Result" 
                  className="h-32 w-auto object-cover rounded-lg shadow-md border-2 border-white ring-2 ring-emerald-100 bg-slate-200"
                  loading="lazy"
               />
               <span className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                  HASIL AI
               </span>
            </div>
            
            {/* Description */}
            <div className="text-center md:text-left max-w-xs">
                <h5 className="font-bold text-slate-800">{example.label}</h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{example.description}</p>
            </div>

        </div>
      </div>
    </div>
  );
};
