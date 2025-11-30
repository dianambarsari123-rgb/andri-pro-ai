
import React, { useState, useEffect } from 'react';
import { Settings, Key, Shield, Save, CheckCircle, Activity, Globe, ToggleLeft, ToggleRight, Server } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing key (simulated from env or local storage for this demo)
    const currentKey = process.env.API_KEY || '';
    setApiKey(currentKey);
  }, []);

  const handleSave = () => {
    // In a real app, this would save to a backend or update environment context
    // For this demo, we simulate saving to LocalStorage to persist across reloads
    localStorage.setItem('SUPERADMIN_API_KEY', apiKey);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="mb-8">
         <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-3">
           <Settings size={32} className="text-emerald-600" />
           Pengaturan Superadmin
         </h2>
         <p className="text-slate-500">Konfigurasi sistem, manajemen API Key, dan status server.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Configuration Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* API Key Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Key size={18} className="text-amber-500" /> API Configuration
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Google Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-3 pr-24 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-600 font-mono text-sm"
                  placeholder="AIzaSy..."
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-2 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Kunci API ini digunakan untuk seluruh request AI (Merge, Veo, Edit). Pastikan menggunakan kunci dari Project Google Cloud dengan billing aktif untuk fitur Video.
              </p>
            </div>
          </div>

          {/* System Control */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" /> System Control
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">Maintenance Mode</h4>
                  <p className="text-xs text-slate-500">Nonaktifkan akses user untuk sementara.</p>
                </div>
                <button 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`text-2xl transition-colors ${isMaintenanceMode ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {isMaintenanceMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>
              
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">Debug Logging</h4>
                  <p className="text-xs text-slate-500">Tampilkan log error detail di console browser.</p>
                </div>
                <button className="text-2xl text-emerald-500">
                   <ToggleRight size={40} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-4">
            {saved && (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in">
                <CheckCircle size={16} /> Perubahan Disimpan
              </span>
            )}
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2 font-medium"
            >
              <Save size={18} /> Simpan Konfigurasi
            </button>
          </div>

        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" /> Status Server
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">System Uptime</span>
                  <span className="font-mono font-medium text-slate-700">99.9%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[99%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">API Latency</span>
                  <span className="font-mono font-medium text-emerald-600">120ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Daily Requests</span>
                  <span className="font-mono font-medium text-slate-700">1,240 / 10K</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%]"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">2.5</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Gemini Ver</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">Pro</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">License</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0B1E26] to-[#132E35] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <Server className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
            <h3 className="font-bold text-lg mb-1 relative z-10">Andri AI Core</h3>
            <p className="text-emerald-400 text-xs font-mono mb-4 relative z-10">v3.0.1-stable-build</p>
            
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Gemini 2.5 Flash: <span className="text-white ml-auto">Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Google Veo 3: <span className="text-white ml-auto">Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Nano Banana: <span className="text-white ml-auto">Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
