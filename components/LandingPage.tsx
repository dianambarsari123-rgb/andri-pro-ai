
import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Image as ImageIcon, Video, Users, ArrowRight, PlayCircle, Shield, Menu, X, Check, Star, Play } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: 'privacy' | 'terms' | 'contact') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key to close demo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDemo(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter'] selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sparkles className="text-white w-6 h-6" />
             </div>
             <span className="text-xl font-bold tracking-tight">INDIGITAL <span className="text-emerald-500">STUDIO</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
             <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy</button>
             <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms</button>
             <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button>
             <button 
                onClick={onGetStarted}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
             >
               Login / Masuk
             </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
           <div className="md:hidden absolute top-full left-0 right-0 bg-[#0c0c0e] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
              <button onClick={() => onNavigate('privacy')} className="text-left py-2 text-slate-300">Privacy Policy</button>
              <button onClick={() => onNavigate('terms')} className="text-left py-2 text-slate-300">Terms of Service</button>
              <button onClick={() => onNavigate('contact')} className="text-left py-2 text-slate-300">Contact Support</button>
              <button onClick={onGetStarted} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold">Login App</button>
           </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
               <Zap size={14} className="fill-current" /> Next Gen Generative AI
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
               Transform Ideas into <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">Digital Reality.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
               Studio kreatif AI all-in-one untuk profesional. Akses Gemini 3 Pro & Google Veo untuk membuat gambar, video sinematik, dan desain produk dalam hitungan detik.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
               <button 
                 onClick={onGetStarted}
                 className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 flex items-center gap-3 text-lg group"
               >
                 Mulai Gratis <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button 
                 onClick={() => setShowDemo(true)}
                 className="px-8 py-4 bg-[#1A1D25] hover:bg-[#252830] border border-white/10 text-white font-bold rounded-full transition-all flex items-center gap-3 text-lg group"
               >
                 <PlayCircle size={20} className="group-hover:text-emerald-400 transition-colors" /> Lihat Demo
               </button>
            </div>
            
            {/* Hero Visual Mockup */}
            <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
                <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#0c0c0e]">
                   <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" alt="Dashboard Preview" className="w-full opacity-80" />
                </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-[#080808] relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">Fitur Kelas Dunia</h2>
               <p className="text-slate-400 max-w-2xl mx-auto text-lg">Platform tunggal yang mengintegrasikan model AI terbaik untuk setiap kebutuhan kreatif Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FeatureCard 
                  icon={<ImageIcon size={32} className="text-purple-400" />}
                  title="Text to Image (Flux/Gemini)"
                  desc="Buat gambar ultra-realistis dari teks. Mendukung gaya 3D, anime, hingga fotografi produk."
               />
               <FeatureCard 
                  icon={<Video size={32} className="text-pink-400" />}
                  title="Google Veo Video"
                  desc="Ubah foto diam menjadi video sinematik 1080p dengan kontrol kamera presisi."
               />
               <FeatureCard 
                  icon={<Users size={32} className="text-blue-400" />}
                  title="AI Face Swap Pro"
                  desc="Tukar wajah dalam foto & video dengan presisi tinggi dan pencahayaan natural."
               />
               <FeatureCard 
                  icon={<Zap size={32} className="text-yellow-400" />}
                  title="Banana Fast Mode"
                  desc="Generasi instan <1 detik untuk brainstorming ide tanpa batas."
               />
               <FeatureCard 
                  icon={<Shield size={32} className="text-emerald-400" />}
                  title="Enterprise Security"
                  desc="Enkripsi end-to-end. API Key Anda tersimpan lokal di perangkat Anda."
               />
               <FeatureCard 
                  icon={<Star size={32} className="text-orange-400" />}
                  title="Commercial License"
                  desc="Hak cipta penuh atas semua karya yang Anda hasilkan untuk penggunaan komersial."
               />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-[#050505]"></div>
         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center bg-[#0c0c0e] border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-8">Siap Berkarya?</h2>
            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">Bergabunglah dengan ribuan kreator profesional. Tidak perlu kartu kredit untuk mencoba.</p>
            <button 
              onClick={onGetStarted}
              className="px-12 py-5 bg-white text-black hover:bg-slate-200 font-bold rounded-full shadow-2xl transition-all hover:scale-105 text-lg"
            >
               Buka Dashboard
            </button>
            <p className="mt-6 text-sm text-slate-500">Powered by Google Gemini 3 Pro & Veo</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#020202] text-slate-500 text-sm">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
               </div>
               <span className="text-white font-bold text-lg">INDIGITAL STUDIO</span>
            </div>
            <div className="flex gap-8 font-medium">
               <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
               <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">Terms of Service</button>
               <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">Contact Support</button>
            </div>
            <div>
               &copy; {new Date().getFullYear()} INDIGITAL STUDIO Inc.
            </div>
         </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div 
               className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
               <button 
                  onClick={() => setShowDemo(false)} 
                  className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors backdrop-blur"
               >
                 <X size={24} />
               </button>
               
               <div className="absolute inset-0 flex items-center justify-center">
                   {/* Using Google Gemini Era Demo Video as a Placeholder for the App Demo */}
                   <iframe 
                     width="100%" 
                     height="100%" 
                     src="https://www.youtube.com/embed/jV1vkHv4zq8?autoplay=1&rel=0&modestbranding=1" 
                     title="App Demo Video" 
                     frameBorder="0" 
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                     allowFullScreen
                     className="w-full h-full"
                   ></iframe>
               </div>
            </div>
            
            {/* Close on click outside */}
            <div className="absolute inset-0 -z-10" onClick={() => setShowDemo(false)}></div>
         </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300">
     <div className="mb-6 bg-black/40 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
        {icon}
     </div>
     <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
     <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
