
import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Save, Camera, Shield, Mail, MapPin, CheckCircle, AlertCircle, Upload, Image } from 'lucide-react';

const UserProfile: React.FC = () => {
  // State for Profile Data
  const [profile, setProfile] = useState({
    fullName: 'Andri Waskitho',
    role: 'Superadmin',
    email: 'admin@indigitalstudio.com',
    bio: 'AI Engineer & Fullstack Developer specializing in Generative AI solutions.',
    location: 'Jakarta, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  });

  // State for Security Data
  const [security, setSecurity] = useState({
    username: 'andriwaskitho',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    const savedAuth = localStorage.getItem('user_auth');
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setSecurity(prev => ({ ...prev, username: authData.username }));
    }
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    showMsg('success', 'Profil berhasil diperbarui!');
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      showMsg('error', 'Password baru tidak cocok!');
      return;
    }

    if (security.newPassword && security.newPassword.length < 6) {
      showMsg('error', 'Password minimal 6 karakter.');
      return;
    }

    // Retrieve current stored password to validate "Current Password"
    // Default password if not set in storage
    const savedAuth = JSON.parse(localStorage.getItem('user_auth') || '{}');
    const actualCurrentPass = savedAuth.password || '86050475@Ndri*123#';

    if (security.currentPassword !== actualCurrentPass) {
       showMsg('error', 'Password saat ini salah!');
       return;
    }

    // Save New Auth Data
    const newAuthData = {
      username: security.username,
      password: security.newPassword || actualCurrentPass // Update if new provided, else keep old
    };

    localStorage.setItem('user_auth', JSON.stringify(newAuthData));
    setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    showMsg('success', 'Kredensial keamanan berhasil diperbarui!');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Check size (limit to 2MB for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            showMsg('error', 'Ukuran foto terlalu besar (Max 2MB)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setProfile(prev => ({ ...prev, avatar: base64 }));
            showMsg('success', 'Foto dipilih. Klik "Simpan Perubahan" untuk menetapkan.');
        };
        reader.readAsDataURL(file);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="relative h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900 mb-20 shadow-xl">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         <div className="absolute bottom-0 left-0 p-8 flex items-end">
            {/* Banner Content */}
         </div>
      </div>

      {/* Profile Card Overlay */}
      <div className="relative px-8 -mt-24">
         <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
            {/* Avatar */}
            <div className="relative group">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs">
                      Ganti Foto
                  </div>
               </div>
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-2.5 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors z-10 border border-white"
                  title="Ganti Foto"
               >
                  <Camera size={18} />
               </button>
               {/* Hidden File Input */}
               <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
               />
            </div>
            
            {/* Name & Role */}
            <div className="flex-1 mb-2 md:mt-4">
               <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{profile.fullName}</h1>
               <div className="flex items-center gap-2 text-emerald-600 font-medium mt-1">
                  <Shield size={16} /> {profile.role}
               </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-[#1a1a1c] rounded-xl p-1 shadow-sm border border-slate-200 dark:border-white/10">
               <button 
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
               >
                  Info Profil
               </button>
               <button 
                  onClick={() => setActiveTab('security')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
               >
                  Keamanan
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8 px-2">
         
         {msg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
               {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
               {msg.text}
            </div>
         )}

         {activeTab === 'info' ? (
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10 space-y-6">
               <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
                  <User className="text-emerald-500" />
                  <h3 className="font-bold text-lg text-slate-700 dark:text-white">Informasi Pribadi</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Nama Lengkap</label>
                     <input 
                        type="text" 
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Email</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="email" 
                           value={profile.email}
                           onChange={(e) => setProfile({...profile, email: e.target.value})}
                           className="w-full pl-10 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Lokasi</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                           type="text" 
                           value={profile.location}
                           onChange={(e) => setProfile({...profile, location: e.target.value})}
                           className="w-full pl-10 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Foto URL (Base64)</label>
                     <div className="relative">
                        <Image className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={profile.avatar ? "Image Data Loaded (Base64)" : "No Image"}
                            readOnly
                            className="w-full pl-10 p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-xs text-slate-500 cursor-not-allowed font-mono"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Bio</label>
                  <textarea 
                     rows={4}
                     value={profile.bio}
                     onChange={(e) => setProfile({...profile, bio: e.target.value})}
                     className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                  />
               </div>

               <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 transform active:scale-95">
                     <Save size={18} /> Simpan Perubahan
                  </button>
               </div>
            </form>
         ) : (
            <form onSubmit={handleSecuritySave} className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10 space-y-6">
               <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-white/5 pb-4">
                  <Lock className="text-emerald-500" />
                  <h3 className="font-bold text-lg text-slate-700 dark:text-white">Keamanan & Login</h3>
               </div>

               <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400 mb-6 flex gap-3">
                  <AlertCircle className="shrink-0" />
                  <p>Mengubah username atau password akan memaksa Anda untuk login ulang pada sesi berikutnya.</p>
               </div>

               <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Username</label>
                     <input 
                        type="text" 
                        value={security.username}
                        onChange={(e) => setSecurity({...security, username: e.target.value})}
                        className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                     />
                  </div>
                  
                  <hr className="border-slate-100 dark:border-white/10 my-4" />

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Password Saat Ini</label>
                     <input 
                        type="password" 
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                        className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                        placeholder="Masukkan password lama untuk verifikasi"
                        required
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Password Baru</label>
                        <input 
                           type="password" 
                           value={security.newPassword}
                           onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                           className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                           placeholder="Minimal 6 karakter"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Konfirmasi Password</label>
                        <input 
                           type="password" 
                           value={security.confirmPassword}
                           onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                           className="w-full p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                           placeholder="Ulangi password baru"
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-8 py-3 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 transform active:scale-95">
                     <Shield size={18} /> Update Kredensial
                  </button>
               </div>
            </form>
         )}

      </div>
    </div>
  );
};

export default UserProfile;
