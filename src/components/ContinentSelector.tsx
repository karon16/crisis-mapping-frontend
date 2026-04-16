'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export interface ContinentOption {
  label: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
}

const CONTINENTS: ContinentOption[] = [
  { label: 'Global',        center: [30, 0],      zoom: 2 },
  { label: 'Africa',        center: [20, 0],      zoom: 3 },
  { label: 'Asia',          center: [100, 35],    zoom: 3 },
  { label: 'Europe',        center: [15, 50],     zoom: 4 },
  { label: 'North America', center: [-100, 45],   zoom: 3 },
  { label: 'South America', center: [-60, -15],   zoom: 3 },
  { label: 'Oceania',       center: [140, -25],   zoom: 4 },
  { label: 'MENA',          center: [45, 28],     zoom: 4 },
];

interface ContinentSelectorProps {
  onSelect: (center: [number, number], zoom: number) => void;
}

const ContinentSelector: React.FC<ContinentSelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('Global');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (continent: ContinentOption) => {
    setSelected(continent.label);
    setIsOpen(false);
    onSelect(continent.center, continent.zoom);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
          isOpen
            ? 'bg-[var(--t-accent-subtle)] border-[var(--t-accent)] text-[var(--t-accent-text)]'
            : 'bg-[var(--t-bg-secondary)] border-[var(--t-border)] text-[var(--t-text-secondary)] hover:bg-[var(--t-bg-hover)] hover:text-[var(--t-text-primary)]'
        }`}
      >
        <GlobeAltIcon className="h-3.5 w-3.5" />
        <span className="font-mono tracking-wide">{selected}</span>
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-[var(--t-bg-elevated)] backdrop-blur-xl border border-[var(--t-border)] rounded-lg shadow-2xl overflow-hidden z-50">
          {CONTINENTS.map((continent) => (
            <button
              key={continent.label}
              onClick={() => handleSelect(continent)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors duration-100 flex items-center gap-2 ${
                selected === continent.label
                  ? 'bg-[var(--t-accent-subtle)] text-[var(--t-accent-text)]'
                  : 'text-[var(--t-text-secondary)] hover:bg-[var(--t-bg-hover)] hover:text-[var(--t-text-primary)]'
              }`}
            >
              {selected === continent.label && (
                <span className="w-1 h-1 rounded-full bg-[var(--t-accent)] flex-shrink-0" />
              )}
              <span className={selected === continent.label ? '' : 'ml-3'}>
                {continent.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContinentSelector;
