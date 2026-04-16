'use client';

import React, { useState, useEffect } from 'react';
import ContinentSelector from '@/components/ContinentSelector';
import { useSettings } from '@/context/SettingsContext';
import { SunIcon, MoonIcon, GlobeAltIcon, MapIcon } from '@heroicons/react/24/outline';

interface StatusBarProps {
  eventCount: number;
  isLoading: boolean;
  onContinentSelect: (center: [number, number], zoom: number) => void;
}

// ─── API Stub ─────────────────────────────────────────────────────
export interface SystemStatus {
  eventCount: number;
  alertLevel: 'normal' | 'elevated' | 'critical';
  lastSync: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  return null;
}

// ─── UTC Clock Hook ───────────────────────────────────────────────
function useUTCClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () => {
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      ];
      const day = days[now.getUTCDay()];
      const date = now.getUTCDate().toString().padStart(2, '0');
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');

      return `${day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds} UTC`;
    };

    setTime(format());
    const interval = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

// ─── Status Bar Component ─────────────────────────────────────────
const StatusBar: React.FC<StatusBarProps> = ({ eventCount, isLoading, onContinentSelect }) => {
  const utcTime = useUTCClock();
  const { settings, updateSetting } = useSettings();
  const isDark = settings.theme === 'dark';
  const isGlobe = settings.mapProjection === 'globe';

  const toggleTheme = () => {
    updateSetting('theme', isDark ? 'light' : 'dark');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-1.5 bg-[var(--t-bg-primary)]/80 backdrop-blur-sm border-b border-[var(--t-border-subtle)] text-xs select-none theme-transition">
      {/* Left — Event Count */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLoading ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLoading ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </span>
        <span className="text-[var(--t-text-secondary)] font-mono tracking-wide">
          {isLoading ? (
            'SYNCING...'
          ) : (
            <>
              <span className="text-[var(--t-text-primary)] font-semibold">{eventCount}</span>{' '}
              ACTIVE EVENTS
            </>
          )}
        </span>
      </div>

      {/* Center — Continent Selector + UTC Clock */}
      <div className="flex items-center gap-4">
        <ContinentSelector onSelect={onContinentSelect} />
        <div className="text-[var(--t-text-secondary)] font-mono tracking-wider">
          {utcTime}
        </div>
      </div>

      {/* Right — Project/Theme Toggles + App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {/* Projection Segmented Control */}
          <div className="flex bg-[var(--t-bg-secondary)] border border-[var(--t-border)] rounded-md overflow-hidden">
            <button
              onClick={() => updateSetting('mapProjection', 'mercator')}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all duration-200 ${
                !isGlobe
                  ? 'bg-[var(--t-accent-subtle)] text-[var(--t-accent-text)]'
                  : 'text-[var(--t-text-secondary)] hover:text-[var(--t-text-primary)] hover:bg-[var(--t-bg-hover)]'
              }`}
              title="Switch to Flat (2D) projection"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="font-mono tracking-wide hidden sm:inline">2D</span>
            </button>
            <button
              onClick={() => updateSetting('mapProjection', 'globe')}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all duration-200 border-l border-[var(--t-border)] ${
                isGlobe
                  ? 'bg-[var(--t-accent-subtle)] text-[var(--t-accent-text)]'
                  : 'text-[var(--t-text-secondary)] hover:text-[var(--t-text-primary)] hover:bg-[var(--t-bg-hover)]'
              }`}
              title="Switch to Globe (3D) projection"
            >
              <GlobeAltIcon className="h-3.5 w-3.5" />
              <span className="font-mono tracking-wide hidden sm:inline">3D</span>
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border bg-[var(--t-bg-secondary)] border-[var(--t-border)] text-[var(--t-text-secondary)] hover:text-[var(--t-text-primary)] hover:border-[var(--t-accent)]"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <SunIcon className="h-3.5 w-3.5" />
            ) : (
              <MoonIcon className="h-3.5 w-3.5" />
            )}
            <span className="font-mono tracking-wide hidden sm:inline">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
        <div className="text-[var(--t-text-muted)] font-mono tracking-widest text-[10px] uppercase">
          Atreides Crisis Map <span className="opacity-50">v0.1.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
