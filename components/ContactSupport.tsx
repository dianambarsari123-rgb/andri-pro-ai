
import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, MessageSquare } from 'lucide-react';

interface ContactSupportProps {
  onBack: () => void;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ onBack }) => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-['Inter'] selection:bg-emerald-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold text-white">Support Center</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div>
                  <h2 className="text-4xl font-bold text-white mb-4">Hubungi Kami</h2>
                  <p className="text-lg text-slate-400">Tim kami siap membantu Anda 24/7 untuk segala kendala teknis.</p>
               </div>
               
               <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4">
                     <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl h-fit"><Mail size={24}/></div>
                     <div>
                        <h3 className="font-bold text-white">Email</h3>
                        <p className="text-sm text-slate-400">support@indigitalstudio.com</p>
                     </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4">
                     <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl h-fit"><MessageSquare size={24}/></div>
                     <div>
                        <h3 className="font-bold text-white">Live Chat</h3>
                        <p className="text-sm text-slate-400">Senin - Jumat, 09:00 - 17:00</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               {sent ? (
                   <div className="text-center py-10">
                       <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><Send className="text-white"/></div>
                       <h3 className="text-xl font-bold text-white">Terkirim!</h3>
                       <p className="text-slate-400 mt-2">Kami akan segera merespon pesan Anda.</p>
                   </div>
               ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Email</label>
                        <input type="email" required className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder="nama@email.com" />
                     </div>
                     <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Pesan</label>
                        <textarea required rows={4} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none resize-none" placeholder="Jelaskan masalah Anda..."></textarea>
                     </div>
                     <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Send size={18} /> Kirim Pesan
                     </button>
                  </form>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ContactSupport;
