
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
  Image,
  X,
  UserCheck,
  Images,
  Crown,
  Sun,
  AudioLines
} from 'lucide-react';
import { FeatureMode } from '../types';

interface SidebarProps {
  currentMode: FeatureMode;
  onNavigate: (mode: FeatureMode) => void;
  onLogout: () => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isLuxury?: boolean;
  currentTheme?: string;
  onToggleTheme?: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onNavigate, onLogout, className, isOpen, onClose, isLuxury = false, currentTheme, onToggleTheme }) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'edit_group': true,
    'studio_group': false,
    'design_group': false,
    'biz_group': true,
    'dl_group': false
  });

  // Load username/role for display
  const [userInfo, setUserInfo] = useState({ name: 'INDIGITAL STUDIO', role: 'Superadmin V3.0' });
  useEffect(() => {
     const storedProfile = localStorage.getItem('user_profile');
     if (storedProfile) {
        const p = JSON.parse(storedProfile);
        setUserInfo({ name: p.fullName || 'INDIGITAL STUDIO', role: p.role || 'Superadmin' });
     }
  }, [currentMode]); // Refresh on nav change in case profile updated

  // Definition of Menu Groups
  const MENU_GROUPS: MenuGroup[] = [
    {
      id: 'edit_group',
      label: 'EDITING & CREATIVE',
      icon: <Layers size={16} />,
      items: [
        { mode: 'imagine', label: 'Buat Gambar (Text)', icon: <Image size={18} /> }, 
        { mode: 'tts', label: 'Text to Speech', icon: <AudioLines size={18} /> },
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
        { mode: 'fotomodel', label: 'Foto Model AI', icon: <UserCheck size={18} /> },
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

  const logoColor = isLuxury ? 'from-amber-400 to-yellow-600' : 'from-emerald-500 to-cyan-600';
  const logoShadow = isLuxury ? 'shadow-amber-500/20' : 'shadow-emerald-500/20';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
           className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
           onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`w-72 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out shadow-xl ${
         isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${className}`}>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 p-2 rounded-full transition-colors">
           <X size={20} />
        </button>

        {/* Premium Brand Header */}
        <div className="p-6 shrink-0 relative overflow-hidden group cursor-pointer flex items-center gap-3" onClick={() => onNavigate('home')}>
          <div className={`w-10 h-10 bg-gradient-to-tr ${logoColor} rounded-2xl flex items-center justify-center shadow-lg ${logoShadow} text-white group-hover:scale-105 transition-transform duration-300`}>
            {isLuxury ? <Crown size={20} className="animate-pulse" /> : <Sparkles size={20} className="animate-pulse" />}
          </div>
          <div>
            <h1 className="text-slate-800 dark:text-white font-black text-lg tracking-tight leading-none mb-1">INDIGITAL</h1>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${isLuxury ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>STUDIO</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[80px]">{userInfo.role}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Core Features (Always Visible) */}
          <div className="space-y-1">
             <p className="px-3 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3 pl-4">Menu Utama</p>
             <NavItem 
                icon={<Home size={18} />} 
                label="Dashboard" 
                active={currentMode === 'home'} 
                onClick={() => onNavigate('home')}
                isLuxury={isLuxury}
              />
              <NavItem 
                icon={<Images size={18} />} 
                label="Galeri Saya" 
                active={currentMode === 'gallery'} 
                onClick={() => onNavigate('gallery')}
                isLuxury={isLuxury}
              />
              <NavItem 
                icon={<Zap size={18} />} 
                label="Banana AI (Fast)" 
                active={currentMode === 'banana'} 
                onClick={() => onNavigate('banana')}
                highlightColor={isLuxury ? "text-amber-400" : "text-yellow-600 dark:text-yellow-400"}
                isLuxury={isLuxury}
              />
              <NavItem 
                icon={<Video size={18} />} 
                label="Google Veo 3" 
                active={currentMode === 'veo'} 
                onClick={() => onNavigate('veo')}
                highlightColor={isLuxury ? "text-purple-300" : "text-purple-600 dark:text-purple-400"}
                isLuxury={isLuxury}
              />
          </div>

          {/* Separator */}
          <div className="h-px bg-slate-100 dark:bg-white/5 mx-4"></div>

          {/* Collapsible Groups */}
          <div className="space-y-4">
            {MENU_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all duration-200 group ${
                    expandedGroups[group.id] 
                      ? 'text-slate-800 dark:text-white' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      expandedGroups[group.id] 
                        ? (isLuxury ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400')
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:group-hover:bg-white/10'
                      }`}>
                      {group.icon}
                    </div>
                    <span>{group.label}</span>
                  </div>
                  <div className={`transition-transform duration-300 ${expandedGroups[group.id] ? 'rotate-180' : ''}`}>
                     <ChevronDown size={14} />
                  </div>
                </button>
                
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out relative pl-2 ${
                  expandedGroups[group.id] ? 'max-h-[800px] opacity-100 pt-2' : 'max-h-0 opacity-0'
                }`}>
                  {/* Visual Line for tree structure */}
                  <div className="absolute left-[1.35rem] top-0 bottom-4 w-px bg-slate-200 dark:bg-white/10"></div>
                  
                  {group.items.map((item) => (
                    <NavItem 
                      key={item.mode}
                      icon={item.icon} 
                      label={item.label} 
                      active={currentMode === item.mode} 
                      onClick={() => onNavigate(item.mode)}
                      isSubItem
                      isLuxury={isLuxury}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </nav>
      </aside>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isSubItem?: boolean;
  onClick: () => void;
  highlightColor?: string;
  isLuxury?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isSubItem, onClick, highlightColor, isLuxury }) => {
  const activeBg = isLuxury 
     ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-500/10 dark:to-transparent text-amber-700 dark:text-amber-400 border-l-2 border-amber-500'
     : 'bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-500/10 dark:to-transparent text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500';
  
  const activeIconColor = isLuxury
     ? 'text-amber-600 dark:text-amber-400'
     : 'text-emerald-600 dark:text-emerald-400';

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
        active
          ? activeBg
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border-l-2 border-transparent'
      } ${isSubItem ? 'ml-3 w-[calc(100%-0.75rem)]' : ''}`}
    >
      <span className={`mr-3 shrink-0 transition-colors duration-300 ${
        active 
          ? highlightColor || activeIconColor 
          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
      }`}>
        {icon}
      </span>

      <span className="flex-1 text-left truncate relative z-10">{label}</span>

      {active && (
        <span className={`absolute right-3 w-1.5 h-1.5 rounded-full ${isLuxury ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
      )}

      {/* Hover Light Effect */}
      { !active && (
         <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-white/5 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
      )}
    </button>
  );
};

export default Sidebar;
