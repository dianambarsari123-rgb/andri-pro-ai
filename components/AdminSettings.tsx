
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Key, Shield, Save, CheckCircle, Activity, Globe, ToggleLeft, ToggleRight, Server, Sun, Moon, Monitor, Palette, ExternalLink, Crown, Database, Download, Upload, Trash2, AlertTriangle, RefreshCw, Cloud, LogIn } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';

interface AdminSettingsProps {
    theme?: string;
    setTheme?: (theme: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ theme = 'luxury', setTheme }) => {
  const [apiKey, setApiKey] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dataSize, setDataSize] = useState('0 KB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase Config State
  const [fbConfig, setFbConfig] = useState({
    appName: 'Indigital Studio',
    maintenanceMode: false,
    welcomeMessage: 'Selamat datang di Indigital Studio',
    maxGenerationsPerUser: 10,
    defaultImageModel: 'gemini-2.5-flash-image',
    enableVideoGeneration: true,
    announcementBanner: ''
  });
  const [fbSaved, setFbSaved] = useState(false);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
    calculateStorageSize();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchFirebaseConfig();
      } else {
        setFbLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      setFbError("Gagal login: " + error.message);
    }
  };

  const fetchFirebaseConfig = async () => {
    try {
      setFbLoading(true);
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFbConfig({
          appName: data.appName || 'Indigital Studio',
          maintenanceMode: data.maintenanceMode || false,
          welcomeMessage: data.welcomeMessage || '',
          maxGenerationsPerUser: data.maxGenerationsPerUser || 10,
          defaultImageModel: data.defaultImageModel || 'gemini-2.5-flash-image',
          enableVideoGeneration: data.enableVideoGeneration !== undefined ? data.enableVideoGeneration : true,
          announcementBanner: data.announcementBanner || ''
        });
      }
    } catch (error: any) {
      console.error("Error fetching config:", error);
      setFbError(error.message || 'Gagal mengambil konfigurasi dari Firebase.');
    } finally {
      setFbLoading(false);
    }
  };

  const handleSaveFirebaseConfig = async () => {
    try {
      if (!auth.currentUser) {
        setFbError('Anda harus login sebagai admin untuk menyimpan konfigurasi.');
        return;
      }
      setFbError('');
      const docRef = doc(db, 'settings', 'config');
      await setDoc(docRef, {
        ...fbConfig,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid
      }, { merge: true });
      
      setFbSaved(true);
      setTimeout(() => setFbSaved(false), 3000);
    } catch (error: any) {
      console.error("Error saving config:", error);
      setFbError(error.message || 'Gagal menyimpan konfigurasi ke Firebase.');
    }
  };

  const calculateStorageSize = () => {
      let total = 0;
      for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
              total += ((localStorage[key].length + key.length) * 2);
          }
      }
      const sizeInKB = total / 1024;
      setDataSize(sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(2)} MB` : `${sizeInKB.toFixed(2)} KB`);
  };

  const handleSave = () => {
    localStorage.setItem('SUPERADMIN_API_KEY', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
      const data = {
          history: localStorage.getItem('andri_ai_history'),
          favorites: localStorage.getItem('andri_ai_favorites'),
          profile: localStorage.getItem('user_profile'),
          voices: localStorage.getItem('andri_ai_custom_voices'),
          auth: localStorage.getItem('user_auth'), // Optional: include auth or not
          exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Indigital-Backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.history) localStorage.setItem('andri_ai_history', json.history);
              if (json.favorites) localStorage.setItem('andri_ai_favorites', json.favorites);
              if (json.profile) localStorage.setItem('user_profile', json.profile);
              if (json.voices) localStorage.setItem('andri_ai_custom_voices', json.voices);
              
              alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
              window.location.reload();
          } catch (err) {
              alert('Gagal membaca file backup. Pastikan format JSON valid.');
          }
      };
      reader.readAsText(file);
  };

  const handleResetData = () => {
      if (confirm('PERINGATAN: Ini akan menghapus SEMUA riwayat gambar, favorit, dan pengaturan lokal Anda. Tindakan ini tidak bisa dibatalkan. Lanjutkan?')) {
          localStorage.removeItem('andri_ai_history');
          localStorage.removeItem('andri_ai_favorites');
          localStorage.removeItem('andri_ai_custom_voices');
          window.location.reload();
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="mb-8">
         <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-3">
           <Settings size={32} className="text-emerald-600" />
           Pengaturan Superadmin
         </h2>
         <p className="text-slate-600 dark:text-slate-500">Konfigurasi sistem, manajemen API Key, dan backup data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Configuration Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Appearance / Theme Settings */}
          {setTheme && (
              <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Monitor size={18} className="text-purple-500" /> Tampilan Aplikasi (Theme)
                  </h3>
                </div>
                <div className="p-6">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button onClick={() => setTheme('luxury')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'luxury' ? 'border-amber-500 bg-amber-900/20 text-amber-500' : 'border-slate-200 dark:border-slate-700 hover:border-amber-500/50 text-slate-600 dark:text-slate-500'}`}>
                         <Crown size={24} /> <span className="font-bold text-xs">Luxury Gold</span>
                      </button>
                      <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 text-slate-600 dark:text-slate-500'}`}>
                         <Sun size={24} /> <span className="font-bold text-xs">Light Mode</span>
                      </button>
                      <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 text-slate-600 dark:text-slate-500'}`}>
                         <Moon size={24} /> <span className="font-bold text-xs">Dark Mode</span>
                      </button>
                      <button onClick={() => setTheme('cyberpunk')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'cyberpunk' ? 'border-fuchsia-500 bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-300' : 'border-slate-200 dark:border-slate-700 hover:border-fuchsia-500/50 text-slate-600 dark:text-slate-500'}`}>
                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg"></div> <span className="font-bold text-xs">Cyberpunk</span>
                      </button>
                   </div>
                </div>
              </div>
          )}

          {/* Firebase Cloud Configuration */}
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Cloud size={18} className="text-blue-500" /> Konfigurasi Sistem (Firebase)
              </h3>
              <div className="flex items-center gap-3">
                {currentUser && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                    {currentUser.email}
                  </span>
                )}
                {fbLoading && <RefreshCw size={16} className="text-slate-400 animate-spin" />}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {!currentUser ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                    <Shield size={32} className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Otentikasi Diperlukan</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                      Anda harus login sebagai Superadmin untuk mengakses dan mengubah konfigurasi sistem di Firebase.
                    </p>
                  </div>
                  <button 
                    onClick={handleFirebaseLogin}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <LogIn size={18} />
                    Login dengan Google
                  </button>
                  {fbError && <p className="text-red-500 text-sm mt-2">{fbError}</p>}
                </div>
              ) : (
                <>
                  {fbError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <p>{fbError}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Aplikasi</label>
                  <input 
                    type="text" 
                    value={fbConfig.appName}
                    onChange={(e) => setFbConfig({...fbConfig, appName: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 text-sm bg-white dark:bg-black/20"
                    disabled={fbLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Generasi / User</label>
                  <input 
                    type="number" 
                    value={fbConfig.maxGenerationsPerUser}
                    onChange={(e) => setFbConfig({...fbConfig, maxGenerationsPerUser: parseInt(e.target.value) || 0})}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 text-sm bg-white dark:bg-black/20"
                    disabled={fbLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pesan Selamat Datang</label>
                <textarea 
                  value={fbConfig.welcomeMessage}
                  onChange={(e) => setFbConfig({...fbConfig, welcomeMessage: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 text-sm bg-white dark:bg-black/20 resize-none h-20"
                  disabled={fbLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model Gambar Default</label>
                  <select 
                    value={fbConfig.defaultImageModel}
                    onChange={(e) => setFbConfig({...fbConfig, defaultImageModel: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 text-sm bg-white dark:bg-black/20"
                    disabled={fbLoading}
                  >
                    <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                    <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image Preview</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Banner Pengumuman (Opsional)</label>
                  <input 
                    type="text" 
                    value={fbConfig.announcementBanner}
                    onChange={(e) => setFbConfig({...fbConfig, announcementBanner: e.target.value})}
                    placeholder="Teks banner di atas aplikasi..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 text-sm bg-white dark:bg-black/20"
                    disabled={fbLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Fitur Video Generation</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aktifkan atau nonaktifkan fitur pembuatan video</p>
                </div>
                <button 
                  onClick={() => setFbConfig({...fbConfig, enableVideoGeneration: !fbConfig.enableVideoGeneration})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fbConfig.enableVideoGeneration ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  disabled={fbLoading}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fbConfig.enableVideoGeneration ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Maintenance Mode</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tutup akses aplikasi untuk perbaikan</p>
                </div>
                <button 
                  onClick={() => setFbConfig({...fbConfig, maintenanceMode: !fbConfig.maintenanceMode})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fbConfig.maintenanceMode ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  disabled={fbLoading}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fbConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  onClick={() => {
                      alert("Deploying to Firebase... (Simulated in UI)");
                      setTimeout(() => alert("Deploy successful!"), 1500);
                  }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all text-sm"
                >
                  <Cloud size={16} />
                  Deploy to Firebase
                </button>
                <button 
                  onClick={handleSaveFirebaseConfig}
                  disabled={fbLoading}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all text-sm"
                >
                  {fbSaved ? <CheckCircle size={16} /> : <Save size={16} />}
                  {fbSaved ? 'Tersimpan!' : 'Simpan ke Cloud'}
                </button>
              </div>
            </>
            )}
            </div>
          </div>

          {/* Data Management (NEW FEATURE) */}
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Database size={18} className="text-blue-500" /> Manajemen Data
              </h3>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">
                  Used: {dataSize}
              </span>
            </div>
            <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex gap-3">
                    <Activity className="shrink-0" size={20} />
                    <p>
                        Aplikasi ini menyimpan data secara lokal di browser Anda. Lakukan <strong>Export Backup</strong> secara berkala agar data galeri Anda aman atau untuk dipindahkan ke perangkat lain.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                        onClick={handleExportData}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all gap-2 group"
                    >
                        <Download size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Export Backup</span>
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all gap-2 group"
                    >
                        <Upload size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Import Restore</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />

                    <button 
                        onClick={handleResetData}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all gap-2 group"
                    >
                        <Trash2 size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm text-red-600 dark:text-red-400">Reset Data</span>
                    </button>
                </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="bg-white dark:bg-[#0c0c0e] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
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
                  className="w-full p-3 pr-24 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 font-mono text-sm bg-white dark:bg-black/20"
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
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Kunci API disimpan di Browser (LocalStorage). Gunakan API Key dari <strong>Google AI Studio</strong>.
                </p>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-emerald-500/20 transition-all text-sm"
                    >
                        {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                        {saved ? 'Tersimpan!' : 'Simpan'}
                    </button>
                </div>
              </div>
            </div>
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
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <Server size={18} className="text-slate-400" /> System Info
              </h3>
              <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                 <div className="flex justify-between">
                    <span>App Version</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">v3.2.0 (Pro)</span>
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
                    <span>Local Storage</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dataSize}</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
