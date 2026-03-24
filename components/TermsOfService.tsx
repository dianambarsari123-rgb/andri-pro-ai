
import React, { useState } from 'react';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-['Inter'] selection:bg-emerald-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold text-white">Terms of Service</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
         <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
               <FileText size={32} className="text-blue-500" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Syarat & Ketentuan</h2>
            <p className="text-slate-400">Efektif: 1 Januari 2024</p>
         </div>

         <div className="space-y-10">
            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle size={20} className="text-blue-500"/> 1. Penerimaan</h3>
               <p className="leading-relaxed text-slate-400">
                  Dengan menggunakan INDIGITAL STUDIO, Anda menyetujui syarat ini. Layanan ini ditujukan untuk penggunaan profesional dan kreatif yang sah.
               </p>
            </section>

            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> 2. Larangan Penggunaan</h3>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <li className="bg-white/5 p-4 rounded-lg border border-white/5 text-sm">
                     <strong className="block text-white mb-1">Konten Ilegal</strong>
                     Dilarang membuat konten pornografi, kekerasan, atau ilegal.
                  </li>
                  <li className="bg-white/5 p-4 rounded-lg border border-white/5 text-sm">
                     <strong className="block text-white mb-1">Deepfake Berbahaya</strong>
                     Dilarang meniru tokoh publik untuk tujuan penipuan.
                  </li>
               </ul>
            </section>

            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white">3. Hak Cipta</h3>
               <p className="leading-relaxed text-slate-400">
                  Anda memegang hak penuh atas input yang Anda unggah. INDIGITAL STUDIO tidak mengklaim kepemilikan atas hasil karya yang dihasilkan oleh AI untuk Anda.
               </p>
            </section>
         </div>
      </div>
    </div>
  );
};

export default TermsOfService;
