
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
  Moon,
  UserSquare,
  User,
  Home as HomeIcon,
  PenTool,
  Palette,
  Scissors,
  LogOut,
  Zap,
  Video,
  ChevronDown,
  ChevronRight,
  Camera,
  Briefcase,
  Brush,
  Settings,
  Film
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
  isPremium?: boolean;
};

type MenuGroup = {
  id: string;
  label: string;
  icon?: React.ReactNode; // Icon for the group header
  items: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onNavigate, onLogout, className }) => {
  // State to track which groups are expanded
  // Initialize with 'edit_group' open by default, or dynamic based on currentMode
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'edit_group': true,
    'studio_group': false,
    'design_group': false,
    'biz_group': false
  });

  // Definition of Menu Groups
  const MENU_GROUPS: MenuGroup[] = [
    {
      id: 'edit_group',
      label: 'Edit & Manipulasi',
      icon: <Layers size={18} />,
      items: [
        { mode: 'merge', label: 'Gabung Foto', icon: <Layers size={18} /> },
        { mode: 'thumbnail', label: 'Foto Miniatur', icon: <Edit3 size={18} />, isPremium: true },
        { mode: 'expand', label: 'Perluas Foto', icon: <Maximize2 size={18} />, isPremium: true },
        { mode: 'edit', label: 'Edit Foto Magic', icon: <Edit3 size={18} /> },
        { mode: 'faceswap', label: 'Face Swap (Foto)', icon: <Users size={18} />, isPremium: true },
        { mode: 'videofaceswap', label: 'Video Face Swap', icon: <Film size={18} />, isPremium: true }, // New Feature
        { mode: 'fitting', label: 'Kamar Pas', icon: <Scissors size={18} />, isPremium: true },
      ]
    },
    {
      id: 'studio_group',
      label: 'Studio Foto AI',
      icon: <Camera size={18} />,
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
      icon: <Brush size={18} />,
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
      icon: <Briefcase size={18} />,
      items: [
        { mode: 'product', label: 'Foto Produk', icon: <ShoppingBag size={18} /> },
        { mode: 'fashion', label: 'Foto Fashion', icon: <Shirt size={18} /> },
        { mode: 'mockup', label: 'Buat Mockup', icon: <LayoutTemplate size={18} />, isPremium: true },
        { mode: 'banner', label: 'Buat Banner', icon: <Type size={18} /> },
        { mode: 'carousel', label: 'Buat Carousel', icon: <Columns size={18} /> },
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
    <div className="w-64 bg-[#0B1E26] text-gray-400 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-all duration-300 custom-scrollbar">
      {/* Brand */}
      <div className="p-6 flex items-center space-x-3 mb-2 shrink-0 border-b border-white/5 bg-[#09181F]">
        <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Andri AI Pro</h1>
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Superadmin V3.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        
        {/* Core Features (Always Visible) */}
        <div className="mb-4">
           <NavItem 
              icon={<Home size={20} />} 
              label="Beranda" 
              active={currentMode === 'home'} 
              onClick={() => onNavigate('home')}
            />
            <NavItem 
              icon={<Zap size={20} />} 
              label="Banana AI (Cepat)" 
              active={currentMode === 'banana'} 
              onClick={() => onNavigate('banana')}
            />
            <NavItem 
              icon={<Video size={20} />} 
              label="Google Veo 3 (Video)" 
              active={currentMode === 'veo'} 
              onClick={() => onNavigate('veo')}
              isPremium
            />
        </div>

        <div className="border-t border-white/5 my-2"></div>

        {/* Collapsible Groups */}
        {MENU_GROUPS.map((group) => (
          <div key={group.id} className="mb-1">
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                expandedGroups[group.id] ? 'text-emerald-400 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {group.icon}
                <span>{group.label}</span>
              </div>
              {expandedGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ease-in-out ${
              expandedGroups[group.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {group.items.map((item) => (
                <NavItem 
                  key={item.mode}
                  icon={item.icon} 
                  label={item.label} 
                  active={currentMode === item.mode} 
                  onClick={() => onNavigate(item.mode)}
                  isPremium={item.isPremium}
                  isSubItem
                />
              ))}
            </div>
          </div>
        ))}

      </nav>

      {/* Logout & Settings */}
      <div className="p-4 border-t border-white/10 mt-auto bg-[#09181F] space-y-2">
        <button 
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            currentMode === 'settings' 
              ? 'bg-[#132E35] text-emerald-400' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={18} />
          <span>Pengaturan Admin</span>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full px-4 py-2.5 rounded-lg group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Keluar Superadmin</span>
        </button>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isPremium?: boolean;
  isSubItem?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isPremium, isSubItem, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative ${
        active
          ? 'bg-[#132E35] text-emerald-400'
          : 'hover:bg-[#132E35] hover:text-white text-gray-400'
      } ${isSubItem ? 'pl-9' : ''}`}
    >
      {/* Active Indicator Line */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"></div>
      )}

      <span className={`${active ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'} mr-3 shrink-0`}>
        {icon}
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
      {isPremium && (
        <span className="ml-auto text-amber-500" title="Fitur Premium">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
        </span>
      )}
    </button>
  );
};

export default Sidebar;
