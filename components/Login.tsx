
import React, { useState } from 'react';
import { Lock, User, ArrowRight, Sparkles, AlertCircle, Hexagon } from 'lucide-react';

interface LoginProps {
  onLogin: (status: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Pre-filled credentials for development ease (defaults)
  const defaultUser = 'andriwaskitho';
  const defaultPass = '86050475@Ndri*123#';

  const [username, setUsername] = useState(defaultUser);
  const [password, setPassword] = useState(defaultPass);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate a brief network delay for UX
    setTimeout(() => {
      // Check LocalStorage for updated credentials
      const storedAuth = localStorage.getItem('user_auth');
      let validUser = defaultUser;
      let validPass = defaultPass;

      if (storedAuth) {
         try {
            const parsed = JSON.parse(storedAuth);
            validUser = parsed.username || defaultUser;
            validPass = parsed.password || defaultPass;
         } catch (e) {
            console.error("Auth parse error", e);
         }
      }

      if (username === validUser && password === validPass) {
        onLogin(true);
      } else {
        setError('Username atau password salah. Akses ditolak.');
        setLoading(false);
      }
    }, 1500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-[Inter] bg-[#0B1E26]">
      {/* Background Image with Animation */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src="https://ik.imagekit.io/d3nxlzdjsu/abstract-digital-fingerprint-login-concept-identity-verification-illustration-with-digital-hand-wireframe-security-protection-on-a-futuristic-modern-background-vector.jpg" 
          alt="AI Digital Background" 
          className="w-full h-full object-cover scale-105"
          style={{ animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1E26] via-[#0B1E26]/90 to-emerald-950/80"></div>
      </div>

      {/* Floating Digital Particles */}
      <div className="absolute top-20 left-20 text-emerald-500/10 animate-bounce duration-[4000ms]">
         <Hexagon size={64} />
      </div>
      <div className="absolute bottom-40 right-40 text-blue-500/10 animate-pulse duration-[3000ms]">
         <Hexagon size={96} />
      </div>
      <div className="absolute top-1/3 right-10 text-emerald-400/20 animate-spin duration-[10000ms]">
         <Hexagon size={48} />
      </div>

      {/* Glassmorphism Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-6 group">
            {/* Logo Glow Effect */}
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000 animate-pulse"></div>
            <div className="relative bg-gradient-to-tr from-emerald-500 to-cyan-600 rounded-2xl w-full h-full flex items-center justify-center shadow-2xl border border-white/20">
              <Sparkles className="text-white w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Andri AI Pro</h1>
          <p className="text-emerald-200/70 mt-3 font-medium text-lg tracking-wide">System Intelligence Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-emerald-400/80 ml-1">Username Superadmin</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white font-medium placeholder:text-slate-600 shadow-inner hover:bg-slate-900/60"
                placeholder="Identitas Pengguna"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-emerald-400/80 ml-1">Password Keamanan</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white font-medium placeholder:text-slate-600 shadow-inner hover:bg-slate-900/60"
                placeholder="Kode Akses"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-200 text-sm font-medium border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
              <AlertCircle size={20} className="shrink-0 text-red-400" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base mt-4 border border-white/10 ${loading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengautentikasi...
              </span>
            ) : (
              <>
                Akses Dashboard <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center flex justify-center gap-4 opacity-30">
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping delay-150"></div>
          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping delay-300"></div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-slate-500 text-xs font-mono tracking-widest opacity-60">
        SECURE CONNECTION ESTABLISHED
      </div>
    </div>
  );
};

export default Login;
