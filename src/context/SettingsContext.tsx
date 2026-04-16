'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Settings Types ───────────────────────────────────────────────
export interface AppSettings {
  fontFamily: 'sans' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
  showMapLabels: boolean;
  mapProjection: 'globe' | 'mercator' | 'equalEarth' | 'equirectangular' | '' ;
  theme: 'dark' | 'light' | ''  ;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontFamily: 'sans',
  fontSize: 'medium',
  showMapLabels: true,
  mapProjection: (typeof window !== 'undefined' ? localStorage.getItem('mapProjection') as AppSettings['mapProjection'] : 'globe') || 'globe',
  theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') as AppSettings['theme'] : 'dark') || 'dark',
};

const STORAGE_KEY = 'atreides-settings';

// ─── CSS Variable Mapping ─────────────────────────────────────────
const FONT_SIZE_MAP: Record<AppSettings['fontSize'], string> = {
  small: '13px',
  medium: '15px',
  large: '17px',
};

const FONT_FAMILY_MAP: Record<AppSettings['fontFamily'], string> = {
  sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  mono: 'var(--font-geist-mono), ui-monospace, monospace',
};

// ─── API Stub ─────────────────────────────────────────────────────
// TODO: Backend team — implement this endpoint to persist user settings
export async function syncSettingsToAPI(_settings: AppSettings): Promise<void> {
  // Example future implementation:
  // await axios.post('/api/user/settings', settings);
  console.log('[Settings] API sync stub called — ready for backend integration');
}

// TODO: Backend team — implement this endpoint to fetch user settings
export async function fetchSettingsFromAPI(): Promise<AppSettings | null> {
  // Example future implementation:
  // const response = await axios.get('/api/user/settings');
  // return response.data;
  return null;
}

// ─── Context ──────────────────────────────────────────────────────
interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  isHydrated: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('[Settings] Failed to load from localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage + apply CSS variables whenever settings change
  useEffect(() => {
    if (!isHydrated) return;

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[Settings] Failed to save to localStorage:', e);
    }

    // Apply CSS variables to body (must be body, not html, because
    // Next.js font variables --font-geist-sans/mono are defined on <body>)
    const body = document.body;
    body.style.setProperty('--app-font-family', FONT_FAMILY_MAP[settings.fontFamily]);
    body.style.setProperty('--app-font-size', FONT_SIZE_MAP[settings.fontSize]);

    // Apply theme via data-theme attribute on <html>
    document.documentElement.setAttribute('data-theme', settings.theme);

    // Fire API stub (non-blocking)
    syncSettingsToAPI(settings);
  }, [settings, isHydrated]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, isHydrated }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
