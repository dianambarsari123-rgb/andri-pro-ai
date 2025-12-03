
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  Maximize2, 
  Edit3, 
  Users, 
  ShoppingBag, 
  Shirt, 
  LayoutTemplate, 
  Type, 
  Columns,
  Sparkles,
  Heart,
  Baby,
  Smile,
  User,
  UserSquare,
  Home as HomeIcon,
  PenTool,
  Palette,
  Scissors,
  LogOut,
  Zap,
  Video,
  ChevronDown,
  Camera,
  Briefcase,
  Brush,
  Settings,
  Film,
  Moon,
  FileText,
  Eraser,
  ImageMinus,
  Download,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  UserCircle,
  Image
} from 'lucide-react';
import { FeatureMode } from '../types';

interface SidebarProps {
  currentMode: FeatureMode;
  onNavigate: (mode: FeatureMode) => void;
  onLogout: () => void;
  className?: string;
}

// Define the structure of the menu
type MenuItem = {
  mode: FeatureMode;
  label: string;
  icon: React.ReactNode;
};

type MenuGroup = {
  id: string;
  label: string;
  icon?: React.ReactNode; // Icon for the group header
  items: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onNavigate, onLogout, className }) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'edit_group': true,
    'studio_group': false,
    'design_group': false,
    'biz_group': false,
    'dl_group': false
  });

  // Load username/role for display
  const [userInfo, setUserInfo] = useState({ name: 'Andri AI', role: 'Superadmin V3.0' });
  useEffect(() => {
     const storedProfile = localStorage.getItem('user_profile');
     if (storedProfile) {
        const p = JSON.parse(storedProfile);
        setUserInfo({ name: p.fullName || 'Andri AI', role: p.role || 'Superadmin' });
     }
  }, [currentMode]); // Refresh on nav change in case profile updated

  // Definition of Menu Groups
  const MENU_GROUPS: MenuGroup[] = [
    {
      id: 'edit_group',
      label: 'EDITING',
      icon: <Layers size={16} />,
      items: [
        { mode: 'imagine', label: 'Buat Gambar (Text)', icon: <Image size={18} /> }, 
        { mode: 'merge', label: 'Gabung Foto', icon: <Layers size={18} /> },
        { mode: 'thumbnail', label: 'Foto Miniatur', icon: <Edit3 size={18} /> },
        { mode: 'expand', label: 'Perluas Foto', icon: <Maximize2 size={18} /> },
        { mode: 'edit', label: 'Edit Foto Magic', icon: <Edit3 size={18} /> },
        { mode: 'removeobj', label: 'Remove Object', icon: <Eraser size={18} /> },
        { mode: 'removebg', label: 'Remove Background', icon: <ImageMinus size={18} /> },
        { mode: 'restore', label: 'Restorasi Foto Lama', icon: <Palette size={18} /> }, 
        { mode: 'faceswap', label: 'Face Swap (Foto)', icon: <Users size={18} /> },
        { mode: 'videofaceswap', label: 'Video Face Swap', icon: <Film size={18} /> },
        { mode: 'animate', label: 'Hidupkan Foto (Veo)', icon: <Video size={18} /> }, 
        { mode: 'fitting', label: 'Kamar Pas', icon: <Scissors size={18} /> },
      ]
    },
    {
      id: 'studio_group',
      label: 'Studio Foto AI',
      icon: <Camera size={16} />,
      items: [
        { mode: 'prewedding', label: 'Foto Prewedding', icon: <Heart size={18} /> },
        { mode: 'wedding', label: 'Foto Wedding', icon: <Users size={18} /> },
        { mode: 'babyborn', label: 'Baby Born', icon: <Baby size={18} /> },
        { mode: 'kids', label: 'Kids Foto', icon: <Smile size={18} /> },
        { mode: 'maternity', label: 'Maternity', icon: <User size={18} /> },
        { mode: 'umrah', label: 'Umrah/Haji', icon: <Moon size={18} /> },
        { mode: 'passphoto', label: 'Pas Foto Warna', icon: <UserSquare size={18} /> },
      ]
    },
    {
      id: 'design_group',
      label: 'Desain & Seni',
      icon: <Brush size={16} />,
      items: [
        { mode: 'interior', label: 'Desain Interior', icon: <HomeIcon size={18} /> },
        { mode: 'exterior', label: 'Desain Eksterior', icon: <LayoutTemplate size={18} /> },
        { mode: 'sketch', label: 'Sketsa Gambar', icon: <PenTool size={18} /> },
        { mode: 'caricature', label: 'Art & Karikatur', icon: <Palette size={18} /> },
      ]
    },
    {
      id: 'biz_group',
      label: 'Bisnis & Promosi',
      icon: <Briefcase size={16} />,
      items: [
        { mode: 'product', label: 'Foto Produk', icon: <ShoppingBag size={18} /> },
        { mode: 'fashion', label: 'Foto Fashion', icon: <Shirt size={18} /> },
        { mode: 'mockup', label: 'Buat Mockup', icon: <LayoutTemplate size={18} /> },
        { mode: 'banner', label: 'Buat Banner', icon: <Type size={18} /> },
        { mode: 'carousel', label: 'Buat Carousel', icon: <Columns size={18} /> },
        { mode: 'flayer', label: 'Desain Flyer', icon: <FileText size={18} /> },
      ]
    },
    {
      id: 'dl_group',
      label: 'VIDEO DOWNLOADER',
      icon: <Download size={16} />,
      items: [
        { mode: 'youtube', label: 'Youtube Download', icon: <Youtube size={18} /> },
        { mode: 'tiktok', label: 'Tiktok Download', icon: <Video size={18} /> }, 
        { mode: 'instagram', label: 'Instagram Download', icon: <Instagram size={18} /> },
        { mode: 'facebook', label: 'Facebook Download', icon: <Facebook size={18} /> },
        { mode: 'twitter', label: 'X Download', icon: <Twitter size={18} /> },
      ]
    }
  ];

  // Auto-expand the group containing the active item
  useEffect(() => {
    const newExpandedState = { ...expandedGroups };
    let found = false;

    MENU_GROUPS.forEach(group => {
      if (group.items.some(item => item.mode === currentMode)) {
        newExpandedState[group.id] = true;
        found = true;
      }
    });

    if (found) {
      setExpandedGroups(newExpandedState);
    }
  }, [currentMode]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <div className={`w-72 bg-[#09090b] text-slate-300 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-all duration-300 border-r border-white/5 shadow-2xl ${className}`}>
      
      {/* Premium Brand Header */}
      <div className="p-6 pb-4 shrink-0 relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('home')}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="text-white w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-none mb-1 font-['Inter']">Andri AI <span className="text-emerald-400">Pro</span></h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase truncate max-w-[140px]">{userInfo.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        {/* Core Features (Always Visible) */}
        <div className="space-y-1.5">
           <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu Utama</p>
           <NavItem 
              icon={<Home size={18} />} 
              label="Dashboard" 
              active={currentMode === 'home'} 
              onClick={() => onNavigate('home')}
            />
            {/* Chatbot Removed from here */}
            <NavItem 
              icon={<Zap size={18} />} 
              label="Banana AI (Fast)" 
              active={currentMode === 'banana'} 
              onClick={() => onNavigate('banana')}
              highlightColor="text-yellow-400"
            />
            <NavItem 
              icon={<Video size={18} />} 
              label="Google Veo 3" 
              active={currentMode === 'veo'} 
              onClick={() => onNavigate('veo')}
              highlightColor="text-purple-400"
            />
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-2"></div>

        {/* Collapsible Groups */}
        <div className="space-y-4">
          {MENU_GROUPS.map((group) => (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 group ${
                  expandedGroups[group.id] ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded ${expandedGroups[group.id] ? 'bg-white/10 text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {group.icon}
                  </div>
                  <span>{group.label}</span>
                </div>
                <div className={`transition-transform duration-300 ${expandedGroups[group.id] ? 'rotate-180' : ''}`}>
                   <ChevronDown size={14} />
                </div>
              </button>
              
              <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out relative pl-2 ${
                expandedGroups[group.id] ? 'max-h-[800px] opacity-100 pt-1' : 'max-h-0 opacity-0'
              }`}>
                {/* Visual Line for tree structure */}
                <div className="absolute left-[1.15rem] top-0 bottom-2 w-px bg-white/5"></div>
                
                {group.items.map((item) => (
                  <NavItem 
                    key={item.mode}
                    icon={item.icon} 
                    label={item.label} 
                    active={currentMode === item.mode} 
                    onClick={() => onNavigate(item.mode)}
                    isSubItem
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </nav>

      {/* Footer / Settings */}
      <div className="p-4 bg-[#0c0c0e] border-t border-white/5 space-y-2 mt-auto relative z-20">
         <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"></div>
         
         {/* Profile Link in Footer */}
         <button 
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium group ${
            currentMode === 'profile' 
              ? 'bg-white/10 text-emerald-400 shadow-lg shadow-emerald-900/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCircle size={18} className="group-hover:text-emerald-400 transition-colors" />
          <span>Profil Saya</span>
        </button>

        <button 
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium group ${
            currentMode === 'settings' 
              ? 'bg-white/10 text-emerald-400 shadow-lg shadow-emerald-900/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={18} className={`transition-transform duration-500 ${currentMode === 'settings' ? 'rotate-90' : 'group-hover:rotate-90'}`} />
          <span>Pengaturan Admin</span>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full px-4 py-3 rounded-xl group border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Keluar System</span>
        </button>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isSubItem?: boolean;
  onClick: () => void;
  highlightColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isSubItem, onClick, highlightColor }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${
        active
          ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-white shadow-[inset_2px_0_0_0_#10b981]'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      } ${isSubItem ? 'ml-2 w-[calc(100%-0.5rem)]' : ''}`}
    >
      
      {/* Icon with Glow Effect on Active */}
      <span className={`relative mr-3 shrink-0 transition-colors duration-300 ${
        active 
          ? highlightColor || 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
          : 'text-slate-500 group-hover:text-slate-300'
      }`}>
        {icon}
      </span>

      <span className="flex-1 text-left truncate relative z-10">{label}</span>

      {/* Hover Light Effect */}
      { !active && (
         <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>
      )}
    </button>
  );
};

export default Sidebar;
