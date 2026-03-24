
import React, { useState } from 'react';
import { Lock, User, ArrowRight, Sparkles, AlertCircle, Hexagon, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (status: boolean) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
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

    setTimeout(() => {
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
        setError('Username atau password salah.');
        setLoading(false);
      }
    }, 1500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-[Inter] bg-[#050505]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img 
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2532&auto=format&fit=crop" 
          alt="AI Background" 
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505]/90 to-emerald-950/80"></div>
      </div>

      {/* Shapes */}
      <div className="absolute top-20 left-20 text-emerald-500/10 animate-bounce duration-[4000ms]"><Hexagon size={64} /></div>
      <div className="absolute bottom-40 right-40 text-blue-500/10 animate-pulse duration-[3000ms]"><Hexagon size={96} /></div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            title="Kembali"
          >
             <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="text-center mb-10 mt-4">
          <div className="relative w-20 h-20 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
            <div className="relative bg-gradient-to-tr from-emerald-500 to-cyan-600 rounded-2xl w-full h-full flex items-center justify-center shadow-2xl border border-white/20">
              <Sparkles className="text-white w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Login System</h1>
          <p className="text-slate-400 mt-2 text-sm">Masuk untuk mengakses Dashboard AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><User size={20} /></div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><Lock size={20} /></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder="Password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-200 text-sm border border-red-500/20 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Memproses...' : <>Masuk <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
