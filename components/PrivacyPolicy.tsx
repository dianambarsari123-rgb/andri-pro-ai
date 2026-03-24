
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-['Inter'] selection:bg-emerald-500/30">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
             >
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold text-white tracking-tight">Privacy Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
         <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
               <Shield size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Kebijakan Privasi</h2>
            <p className="text-slate-400">Terakhir diperbarui: 25 Oktober 2024</p>
         </div>

         <div className="space-y-12">
            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Eye className="text-emerald-500" size={20} /> 1. Pengumpulan Data
               </h3>
               <p className="leading-relaxed text-slate-400">
                  Kami mengumpulkan informasi terbatas yang diperlukan untuk layanan:
               </p>
               <ul className="list-disc pl-5 space-y-2 text-slate-400 marker:text-emerald-500">
                  <li><strong>Informasi Akun:</strong> Nama dan data login terenkripsi.</li>
                  <li><strong>Konten Pengguna:</strong> Gambar dan teks yang Anda unggah untuk diproses AI.</li>
                  <li><strong>Log Teknis:</strong> Data anonim untuk pemecahan masalah dan keamanan.</li>
               </ul>
            </section>

            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Server className="text-emerald-500" size={20} /> 2. Pemrosesan AI
               </h3>
               <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                     Data Anda diproses oleh API Google (Gemini/Veo). Kami menjamin bahwa input Anda tidak digunakan untuk melatih model publik tanpa izin. Data sementara dihapus segera setelah pemrosesan selesai.
                  </p>
               </div>
            </section>

            <section className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Lock className="text-emerald-500" size={20} /> 3. Keamanan
               </h3>
               <p className="leading-relaxed text-slate-400">
                  Kami menggunakan enkripsi SSL/TLS untuk semua transmisi data. API Key Anda disimpan secara lokal di browser Anda (LocalStorage) dan tidak pernah dikirim ke server kami, memberikan kontrol penuh kepada Anda.
               </p>
            </section>
         </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
