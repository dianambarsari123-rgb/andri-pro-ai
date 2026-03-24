
import React, { useState } from 'react';
import { Copy, Check, X, BookOpen, Sparkles } from 'lucide-react';

interface PromptLibraryProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

const PROMPT_COLLECTIONS = [
  {
    category: "Sinematik & Realistis (Foto Nyata)",
    items: [
      "Sebuah foto sinematik jalanan kota cyberpunk futuristik di malam hari, hujan deras, cahaya neon memantul di jalanan basah, gedung pencakar langit dengan iklan hologram, mobil terbang, suasana misterius, resolusi 8k, diambil dengan kamera Arri Alexa, color graded.",
      "Potret hyper-realistic seorang astronot tua melihat keluar jendela, pantulan bumi di kaca helm, tekstur kulit sangat detail, pencahayaan dramatis, ekspresi emosional, lensa 85mm f/1.8, latar belakang bokeh.",
      "Seekor harimau putih agung sedang beristirahat di hutan bioluminescent yang ajaib, tanaman bercahaya, kunang-kunang, cahaya bulan lembut, suasana ethereal, gaya fotografi national geographic, bulu sangat detail."
    ]
  },
  {
    category: "Seni 3D & Animasi (Kartun/3D)",
    items: [
      "Bayi naga lucu berbulu duduk di tumpukan koin emas, gaya film animasi Pixar, mata besar ekspresif, warna cerah dan hidup, pencahayaan studio lembut, render 3d, blender cycles, 4k.",
      "Tampilan isometrik dari kamar gamer yang nyaman, pencahayaan neon ungu dan biru, setup pc gaming, poster di dinding, detail berantakan yang rapi, gaya low poly, bayangan lembut, suasana hangat.",
      "Desain karakter samurai cyberpunk, baju besi logam yang rumit dengan sirkuit merah bercahaya, memegang katana, pose dinamis, render Unreal Engine 5, ray tracing, kabut volumetrik, seni digital."
    ]
  },
  {
    category: "Fashion & Komersial (Produk/Model)",
    items: [
      "Foto editorial fashion tingkat tinggi dari seorang model mengenakan streetwear avant-garde, kacamata hitam futuristik, berdiri di gurun minimalis putih, sinar matahari terik, bayangan tajam, gaya majalah vogue.",
      "Fotografi produk profesional botol parfum mewah di atas podium marmer hitam, percikan air, pencahayaan latar emas, tampilan elegan dan mahal, resolusi 8k.",
      "Mockup iklan sepatu sneakers, sepatu melayang, bagian-bagian terurai (deconstructed), latar belakang warna-warni, motion blur dinamis, pencahayaan komersial, detail tinggi."
    ]
  },
  {
    category: "Arsitektur & Interior (Desain)",
    items: [
      "Interior ruang tamu minimalis modern, jendela setinggi langit-langit dengan pemandangan laut, palet warna krem dan putih, furnitur scandinavian, sinar matahari pagi yang lembut, gaya architectural digest.",
      "Gedung pencakar langit ramah lingkungan futuristik yang tertutup taman vertikal, fasad kaca, pemandangan drone, pencahayaan matahari terbenam, visualisasi arsitektur realistis, render corona.",
      "Interior kedai kopi yang nyaman di malam hari, lampu kuning hangat, jendela berembun karena hujan, tekstur kayu, uap mengepul dari cangkir kopi, suasana santai."
    ]
  }
];

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onSelect, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
    onSelect(text); // Auto fill parent
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="text-emerald-500" size={24} /> 
              Inspirasi Prompt Kekinian
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pilih prompt di bawah untuk hasil AI yang menakjubkan.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {PROMPT_COLLECTIONS.map((collection, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles size={14} /> {collection.category}
              </h4>
              <div className="grid gap-3">
                {collection.items.map((prompt, pIdx) => {
                  const id = `${idx}-${pIdx}`;
                  return (
                    <button
                      key={id}
                      onClick={() => handleCopy(prompt, id)}
                      className="group text-left p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all relative"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-8 line-clamp-3 group-hover:line-clamp-none">
                        {prompt}
                      </p>
                      <div className="absolute top-4 right-4 text-slate-400 group-hover:text-emerald-500 transition-colors">
                        {copiedIndex === id ? <Check size={18} /> : <Copy size={18} />}
                      </div>
                      {copiedIndex === id && (
                         <div className="absolute bottom-2 right-2 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded shadow-sm">
                            Tersalin!
                         </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center">
          <p className="text-xs text-slate-400">Tips: Anda bisa mengedit prompt setelah menyalinnya.</p>
        </div>

      </div>
    </div>
  );
};
