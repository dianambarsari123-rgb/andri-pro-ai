
import React, { useState, useEffect } from 'react';
import { Settings, Key, Shield, Save, CheckCircle, Activity, Globe, ToggleLeft, ToggleRight, Server, Sun, Moon, Monitor, Palette, ExternalLink } from 'lucide-react';

interface AdminSettingsProps {
    theme?: string;
    setTheme?: (theme: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ theme = 'dark', setTheme }) => {
  const [apiKey, setApiKey] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 1. Cek LocalStorage dulu (User input)
    const localKey = localStorage.getItem('SUPERADMIN_API_KEY');
    if (localKey) {
        setApiKey(localKey);
    } else {
        // 2. Jika kosong, cek Env vars (untuk display saja)
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
             // @ts-ignore
             setApiKey(import.meta.env.VITE_API_KEY);
        } else if (process.env.API_KEY) {
             setApiKey(process.env.API_KEY);
        }
    }
  }, []);

  const handleSave = () => {
    // Simpan ke LocalStorage agar Service bisa membacanya tanpa perlu build ulang
    localStorage.setItem('SUPERADMIN_API_KEY', apiKey.trim());
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="mb-8">
         <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-3">
           <Settings size={32} className="text-emerald-600" />
           Pengaturan Superadmin
         </h2>
         <p className="text-slate-500">Konfigurasi sistem, manajemen API Key, dan status server.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Configuration Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Appearance / Theme Settings */}
          {setTheme && (
              <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
                  <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <Monitor size={18} className="text-purple-500" /> Tampilan Aplikasi (Theme)
                  </h3>
                </div>
                <div className="p-6">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 text-slate-500'}`}
                      >
                         <Sun size={24} />
                         <span className="font-bold text-xs">Light Mode</span>
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 text-slate-500'}`}
                      >
                         <Moon size={24} />
                         <span className="font-bold text-xs">Dark Mode</span>
                      </button>
                      <button 
                        onClick={() => setTheme('purple')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'purple' ? 'border-purple-500 bg-purple-900/20 text-purple-300' : 'border-slate-200 dark:border-slate-700 hover:border-purple-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg"></div>
                         <span className="font-bold text-xs">Purple Gradient</span>
                      </button>
                      
                       <button 
                        onClick={() => setTheme('ocean')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'ocean' ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"></div>
                         <span className="font-bold text-xs">Ocean Blue</span>
                      </button>

                      <button 
                        onClick={() => setTheme('emerald')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'emerald' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"></div>
                         <span className="font-bold text-xs">Emerald Green</span>
                      </button>

                      <button 
                        onClick={() => setTheme('sunset')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'sunset' ? 'border-orange-500 bg-orange-900/20 text-orange-300' : 'border-slate-200 dark:border-slate-700 hover:border-orange-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"></div>
                         <span className="font-bold text-xs">Sunset Orange</span>
                      </button>

                       <button 
                        onClick={() => setTheme('midnight')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'midnight' ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg border border-white/10"></div>
                         <span className="font-bold text-xs">Midnight</span>
                      </button>

                       <button 
                        onClick={() => setTheme('cyberpunk')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'cyberpunk' ? 'border-fuchsia-500 bg-fuchsia-900/20 text-fuchsia-300' : 'border-slate-200 dark:border-slate-700 hover:border-fuchsia-500/50 text-slate-500'}`}
                      >
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg"></div>
                         <span className="font-bold text-xs">Cyberpunk</span>
                      </button>
                   </div>
                </div>
              </div>
          )}

          {/* API Key Management */}
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-amber-500" /> API Configuration
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {apiKey ? 'Active' : 'Missing'}
              </span>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Google Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 pr-24 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 dark:text-slate-300 font-mono text-sm bg-white dark:bg-black/20"
                  placeholder="Paste AIzaSy... here"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-2 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 rounded"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                <p className="text-xs text-slate-400 max-w-sm">
                  Kunci API disimpan di Browser (LocalStorage). Gunakan API Key dari <strong>Google AI Studio</strong>.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
                >
                  <ExternalLink size={12} /> Dapatkan API Key Gratis
                </a>
              </div>
            </div>
          </div>

          {/* System Control */}
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
              <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-blue-500" /> System Control
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">Maintenance Mode</h4>
                  <p className="text-xs text-slate-500">Nonaktifkan akses user untuk sementara.</p>
                </div>
                <button 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`text-2xl transition-colors ${isMaintenanceMode ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {isMaintenanceMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
             >
                {saved ? <CheckCircle size={20} /> : <Save size={20} />}
                {saved ? 'Tersimpan!' : 'Simpan Konfigurasi'}
             </button>
          </div>

        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
           
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <Activity size={20} /> Server Status
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">CPU Load</span>
                    <span className="font-mono font-bold">12%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">Memory</span>
                    <span className="font-mono font-bold">1.2GB / 4GB</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                    <span className="opacity-80">Uptime</span>
                    <span className="font-mono font-bold">4d 12h 30m</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">Latency</span>
                    <span className="font-mono font-bold text-emerald-200">24ms</span>
                 </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                 <div className="flex items-center gap-2 text-xs opacity-75">
                    <Globe size={14} />
                    <span>Region: asia-southeast2 (Jakarta)</span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2">
                 <Server size={18} className="text-slate-400" /> System Info
              </h3>
              <div className="space-y-3 text-sm text-slate-500">
                 <div className="flex justify-between">
                    <span>App Version</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">v3.1.0 (Pro)</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Engine</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gemini 3 Pro</span>
                 </div>
                  <div className="flex justify-between">
                    <span>Video Model</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Veo-2.5-Preview</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Build Date</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Oct 25, 2024</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
