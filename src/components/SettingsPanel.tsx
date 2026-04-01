'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings, AppSettings } from '@/context/SettingsContext';

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
          ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-900/30'
          : 'bg-[#191724] text-neutral-400 border border-neutral-700 hover:border-neutral-500 hover:text-neutral-200'
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
        checked ? 'bg-fuchsia-600' : 'bg-neutral-700'
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
      className={`fixed top-0 right-0 h-full w-[24rem] bg-[#0C0A16] border-l border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${translateClass} z-20`}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex justify-between items-center">
        <h2 className="text-md font-bold text-neutral-200">Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Font Family */}
        <div className="p-4 bg-[#191724] rounded-lg border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-wider">Font Family</h3>
          <p className="text-xs text-neutral-500">Choose the typeface for the interface</p>
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
            className="text-xs text-neutral-500 mt-2 p-2 bg-[#0C0A16] rounded border border-neutral-800"
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
        <div className="p-4 bg-[#191724] rounded-lg border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-wider">Font Size</h3>
          <p className="text-xs text-neutral-500">Adjust the base text size across the app</p>
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
        <div className="p-4 bg-[#191724] rounded-lg border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider">Map Labels</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Show country and city names on the map
              </p>
            </div>
            <ToggleSwitch
              checked={settings.showMapLabels}
              onChange={val => updateSetting('showMapLabels', val)}
            />
          </div>
        </div>

        {/* Theme (locked to dark for now) */}
        <div className="p-4 bg-[#191724] rounded-lg border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-wider">Theme</h3>
          <p className="text-xs text-neutral-500">More themes coming soon</p>
          <div className="flex gap-2">
            <OptionButton label="Dark" selected={true} onClick={() => {}} />
            <button
              disabled
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[#191724] text-neutral-600 border border-neutral-800 cursor-not-allowed"
            >
              Light
            </button>
            <button
              disabled
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[#191724] text-neutral-600 border border-neutral-800 cursor-not-allowed"
            >
              System
            </button>
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
          className="py-2 px-4 border border-neutral-100 text-slate-400 rounded-lg transition-colors hover:text-white"
        >
          Reset to Defaults
        </button>
        <button
          onClick={onClose}
          className="py-2 px-4 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
