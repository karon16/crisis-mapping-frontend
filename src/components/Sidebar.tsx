'use client'; // Required for interactivity (onClick)

import { useState } from 'react';
import Image from 'next/image'; // logo
import { Menu, Search, SlidersHorizontal, Plus, Settings, Info} from 'lucide-react';

// A custom GitHub icon component
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 3C6.72 2 5 2 3.5 3 1.5 3 1 4 1 7.5c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Sidebar() {
  // State to track if sidebar is open or closed
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // A small helper component to avoid repeating code for every icon
  const MenuItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors mb-2">
      <Icon size={24} className="text-white min-w-[24px]" />
      <span
        className={`text-gray-300 whitespace-nowrap transition-all duration-300 ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={`h-dvh bg-[#0C0A16] border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Section: Logo & Toggle */}
      <div className="p-5 flex items-center justify-between mb-6">
        {/* LOGO GROUP - ONLY VISIBLE WHEN OPEN */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <Image
              src="/atreides_logo_dark.png"
              alt="Logo"
              width={35}
              height={35}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-none">Atreides</span>
              <span className="text-gray-400 text-xs mt-1">Crisis Map</span>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="text-white p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
        <MenuItem icon={Search} label="Search" />
        <MenuItem icon={SlidersHorizontal} label="Filter" />
        <MenuItem icon={Plus} label="Report a disaster" />
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800">
        <MenuItem icon={Settings} label="Settings" />
        <MenuItem icon={Info} label="About" />
        <MenuItem icon={GithubIcon} label="Github" />
      </div>
    </div>
  );
}
