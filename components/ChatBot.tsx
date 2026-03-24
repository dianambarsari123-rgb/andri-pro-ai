
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, X, MessageSquare, ChevronDown } from 'lucide-react';
import { chatWithGemini, ChatMessage } from '../services/geminiService';

const BOT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"; // Professional model avatar

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle widget
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya Indigital Studio Assistant. Ada yang bisa saya bantu?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add User Message
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Call API
      const apiHistory = newHistory.slice(0, -1);
      const responseText = await chatWithGemini(apiHistory, userMsg);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'Halo! Saya Indigital Studio Assistant. Ada yang bisa saya bantu?' }]);
  };

  // --- RENDER: CLOSED STATE (FLOATING BUTTON) ---
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] group flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-110 hover:shadow-emerald-500/50 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-10 p-0 overflow-hidden border-2 border-white/20"
      >
        <img 
          src={BOT_AVATAR} 
          alt="AI Assistant" 
          className="w-full h-full object-cover"
        />
        
        {/* Notification Dot */}
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
        </span>

        {/* Tooltip */}
        <div className="absolute right-full mr-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           Butuh bantuan AI?
           <div className="absolute top-1/2 -right-1 -mt-1 w-2 h-2 bg-white dark:bg-slate-800 transform rotate-45"></div>
        </div>
      </button>
    );
  }

  // --- RENDER: OPEN STATE (CHAT WINDOW) ---
  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-sm">
            <img src={BOT_AVATAR} alt="Bot" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Indigital Studio Assistant</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
               <span className="text-[10px] text-emerald-100 font-medium">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Reset Chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Minimize"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#09090b] custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300' 
                : 'bg-emerald-100 dark:bg-emerald-500/20'
            }`}>
              {msg.role === 'user' ? 'YOU' : <img src={BOT_AVATAR} alt="Bot" className="w-full h-full object-cover" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-white/10">
                <img src={BOT_AVATAR} alt="Bot" className="w-full h-full object-cover opacity-80" />
             </div>
             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-emerald-500" />
                <span className="text-slate-400 text-xs">Mengetik...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-[#0c0c0e] border-t border-slate-200 dark:border-white/10">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya sesuatu..."
            className="flex-1 bg-slate-100 dark:bg-white/5 border-0 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatBot;
