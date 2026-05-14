'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings } from '@/context/SettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Reusable Option Button ───────────────────────────────────────
function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        selected
          ? 'bg-[var(--t-accent)] text-white shadow-md'
          : 'bg-[var(--t-bg-primary)] text-[var(--t-text-secondary)] border border-[var(--t-border)] hover:border-[var(--t-text-muted)] hover:text-[var(--t-text-primary)]'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-[var(--t-accent)]' : 'bg-[var(--t-bg-hover)]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────
const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const translateClass = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[24rem] bg-[var(--t-bg-primary)] border-l border-[var(--t-border)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${translateClass} z-20 theme-transition`}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex justify-between items-center">
        <h2 className="text-md font-bold text-[var(--t-text-primary)]">Settings</h2>
        <button
          onClick={onClose}
          className="text-[var(--t-text-muted)] hover:text-[var(--t-text-primary)] transition-colors p-2 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Font Family */}
        <div className="p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">Font Family</h3>
          <p className="text-xs text-[var(--t-text-muted)]">Choose the typeface for the interface</p>
          <div className="flex gap-2">
            <OptionButton
              label="Sans-serif"
              selected={settings.fontFamily === 'sans'}
              onClick={() => updateSetting('fontFamily', 'sans')}
            />
            <OptionButton
              label="Monospace"
              selected={settings.fontFamily === 'mono'}
              onClick={() => updateSetting('fontFamily', 'mono')}
            />
          </div>
          <p
            className="text-xs text-[var(--t-text-muted)] mt-2 p-2 bg-[var(--t-bg-primary)] rounded border border-[var(--t-border)]"
            style={{
              fontFamily:
                settings.fontFamily === 'mono'
                  ? 'var(--font-geist-mono), monospace'
                  : 'var(--font-geist-sans), sans-serif',
            }}
          >
            Preview: The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* Font Size */}
        <div className="p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">Font Size</h3>
          <p className="text-xs text-[var(--t-text-muted)]">Adjust the base text size across the app</p>
          <div className="flex gap-2">
            <OptionButton
              label="Small"
              selected={settings.fontSize === 'small'}
              onClick={() => updateSetting('fontSize', 'small')}
            />
            <OptionButton
              label="Medium"
              selected={settings.fontSize === 'medium'}
              onClick={() => updateSetting('fontSize', 'medium')}
            />
            <OptionButton
              label="Large"
              selected={settings.fontSize === 'large'}
              onClick={() => updateSetting('fontSize', 'large')}
            />
          </div>
        </div>

        {/* Map Labels */}
        <div className="p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">Map Labels</h3>
              <p className="text-xs text-[var(--t-text-muted)] mt-1">
                Show country and city names on the map
              </p>
            </div>
            <ToggleSwitch
              checked={settings.showMapLabels}
              onChange={val => updateSetting('showMapLabels', val)}
            />
          </div>
        </div>

        {/* Map Projection */}
        <div className="p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">Map Projection</h3>
          <p className="text-xs text-[var(--t-text-muted)]">Switch between globe and flat map views</p>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              label="Globe"
              selected={settings.mapProjection === 'globe'}
              onClick={() => updateSetting('mapProjection', 'globe')}
            />
            <OptionButton
              label="Mercator"
              selected={settings.mapProjection === 'mercator'}
              onClick={() => updateSetting('mapProjection', 'mercator')}
            />
            <OptionButton
              label="Equal Earth"
              selected={settings.mapProjection === 'equalEarth'}
              onClick={() => updateSetting('mapProjection', 'equalEarth')}
            />
            <OptionButton
              label="Equirectangular"
              selected={settings.mapProjection === 'equirectangular'}
              onClick={() => updateSetting('mapProjection', 'equirectangular')}
            />
          </div>
        </div>

        {/* Theme */}
        <div className="p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">Theme</h3>
          <p className="text-xs text-[var(--t-text-muted)]">Choose your preferred appearance</p>
          <div className="flex gap-2">
            <OptionButton
              label="Dark"
              selected={settings.theme === 'dark'}
              onClick={() => updateSetting('theme', 'dark')}
            />
            <OptionButton
              label="Light"
              selected={settings.theme === 'light'}
              onClick={() => updateSetting('theme', 'light')}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 flex justify-between gap-4">
        <button
          onClick={() => {
            resetSettings();
            onClose();
          }}
          className="py-2 px-4 border border-[var(--t-border)] text-[var(--t-text-secondary)] rounded-lg transition-colors hover:text-[var(--t-text-primary)]"
        >
          Reset to Defaults
        </button>
        <button
          onClick={onClose}
          className="py-2 px-4 bg-[var(--t-accent)] text-white rounded-lg hover:bg-[var(--t-accent-hover)] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
