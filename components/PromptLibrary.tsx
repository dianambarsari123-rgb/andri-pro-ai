
import React, { useState } from 'react';
import { Copy, Check, X, BookOpen, Sparkles } from 'lucide-react';

interface PromptLibraryProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

const PROMPT_COLLECTIONS = [
  {
    category: "Cinematic & Realistic (Foto Nyata)",
    items: [
      "A cinematic shot of a futuristic cyberpunk city street at night, raining, neon lights reflecting on wet pavement, towering skyscrapers with holographic ads, flying cars, atmosphere of mystery, 8k resolution, shot on Arri Alexa, color graded.",
      "Hyper-realistic portrait of an old astronaut looking out of a window, reflection of earth on helmet visor, detailed skin texture, dramatic lighting, emotional expression, 85mm lens f/1.8, bokeh background.",
      "A majestic white tiger resting in a magical bioluminescent forest, glowing plants, fireflies, soft moonlight, ethereal atmosphere, national geographic style photography, incredibly detailed fur."
    ]
  },
  {
    category: "3D Art & Animation (Kartun/3D)",
    items: [
      "Cute fluffy baby dragon sitting on a pile of gold coins, Pixar movie style, big expressive eyes, bright vibrant colors, soft studio lighting, 3d render, blender cycles, 4k.",
      "Isometric view of a cozy gamer room, neon purple and blue lighting, gaming pc setup, posters on wall, detailed clutter, low poly style, soft shadows, warm atmosphere.",
      "Cyberpunk samurai character design, intricate metallic armor with glowing red circuitry, katana, dynamic pose, Unreal Engine 5 render, ray tracing, volumetric fog, digital art."
    ]
  },
  {
    category: "Fashion & Commercial (Produk/Model)",
    items: [
      "High-fashion editorial shot of a model wearing avant-garde streetwear, futuristic sunglasses, standing in a white minimalist desert, harsh sunlight, sharp shadows, vogue magazine style.",
      "Professional product photography of a luxury perfume bottle on a black marble podium, water splashes, golden backlighting, elegant and expensive look, 8k resolution.",
      "Sneaker advertisement mockup, floating shoe, deconstructed parts, colorful background, dynamic motion blur, commercial lighting, high detail."
    ]
  },
  {
    category: "Architecture & Interior (Desain)",
    items: [
      "Modern minimalist living room interior, floor-to-ceiling windows with ocean view, beige and white color palette, scandinavian furniture, soft morning sunlight, architectural digest style.",
      "Futuristic eco-friendly skyscraper covered in vertical gardens, glass facade, drone view, sunset lighting, realistic architectural visualization, corona render.",
      "Cozy coffee shop interior at night, warm yellow lights, rainy window, wooden textures, steam rising from coffee cup, relaxing atmosphere."
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
