'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, Search, SlidersHorizontal, Plus, Settings, Info } from 'lucide-react';
import Link from 'next/link';

import React from 'react';

interface GithubIconProps {
  size?: number;
  className?: string;
}

interface SidebarProps {
  onReportClick: () => void;
  onSearchClick: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onFilterClick: () => void;
}

const GithubIcon: React.FC<GithubIconProps> = ({ size = 24, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    strokeWidth={20}
    className={className}
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1A10.89 10.89 0 0 0 1 11.77 10.79 10.79 0 0 0 8.52 22c.55.1.75-.23.75-.52v-1.83c-3.06.65-3.71-1.44-3.71-1.44a2.86 2.86 0 0 0-1.22-1.58c-1-.66.08-.65.08-.65a2.31 2.31 0 0 1 1.68 1.11 2.37 2.37 0 0 0 3.2.89 2.33 2.33 0 0 1 .7-1.44c-2.44-.27-5-1.19-5-5.32a4.15 4.15 0 0 1 1.11-2.91 3.78 3.78 0 0 1 .11-2.84s.93-.29 3 1.1a10.68 10.68 0 0 1 5.5 0c2.1-1.39 3-1.1 3-1.1a3.78 3.78 0 0 1 .11 2.84A4.15 4.15 0 0 1 19 11.2c0 4.14-2.58 5.05-5 5.32a2.5 2.5 0 0 1 .75 2v2.95c0 .35.2.63.75.52A10.8 10.8 0 0 0 23 11.77 10.89 10.89 0 0 0 12 1"
        fill="currentColor"
      ></path>
    </g>
  </svg>
);

// Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({
  onReportClick,
  onSearchClick,
  isCollapsed,
  toggleSidebar,
  onFilterClick,
}) => {
  // const [isCollapsed, setIsCollapsed] = useState(false);

  // const toggleSidebar = () => {
  //   setIsCollapsed(!isCollapsed);
  // };
  // Menu Item Component
  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors mb-2"
    >
      <Icon size={24} className="text-white min-w-6" />
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
      <div className="p-5 flex items-center justify-between mb-6">
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
        <MenuItem icon={Search} label="Search" onClick={onSearchClick} />
        <MenuItem icon={SlidersHorizontal} label="Filter" onClick={onFilterClick} />
        <MenuItem icon={Plus} label="Report a disaster" onClick={onReportClick} />
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800">
        <MenuItem icon={Settings} label="Settings" />
        <Link href="/about">
          <MenuItem icon={Info} label="About" />
        </Link>
        <MenuItem icon={GithubIcon} label="Github" />
      </div>
    </div>
  );
};

export default Sidebar;
