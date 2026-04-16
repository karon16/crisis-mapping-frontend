'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  CogIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CrisisEvent } from '@/types';

// ─── Types ────────────────────────────────────────────────────────
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: CrisisEvent[];
  onFlyTo: (coords: [number, number]) => void;
  onOpenFilter: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

interface CommandItem {
  id: string;
  type: 'action' | 'event' | 'navigate';
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action: () => void;
}

// ─── API Stub ─────────────────────────────────────────────────────
export interface CommandSuggestion {
  id: string;
  type: 'event' | 'location' | 'action';
  title: string;
  subtitle?: string;
  coordinates?: [number, number];
}

export async function fetchCommandSuggestions(
  _query: string
): Promise<CommandSuggestion[]> {
  return [];
}

// ─── Component ────────────────────────────────────────────────────
const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  events,
  onFlyTo,
  onOpenFilter,
  onOpenSettings,
  onOpenReport,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static commands
  const staticCommands: CommandItem[] = useMemo(
    () => [
      {
        id: 'cmd-filter',
        type: 'action',
        icon: <FunnelIcon className="h-4 w-4" />,
        title: 'Toggle Filters',
        subtitle: 'Open or close the filter panel',
        action: () => {
          onOpenFilter();
          onClose();
        },
      },
      {
        id: 'cmd-settings',
        type: 'action',
        icon: <CogIcon className="h-4 w-4" />,
        title: 'Open Settings',
        subtitle: 'Font, theme, and display preferences',
        action: () => {
          onOpenSettings();
          onClose();
        },
      },
      {
        id: 'cmd-report',
        type: 'action',
        icon: <PlusIcon className="h-4 w-4" />,
        title: 'Report a Disaster',
        subtitle: 'Submit a new crisis event',
        action: () => {
          onOpenReport();
          onClose();
        },
      },
    ],
    [onOpenFilter, onOpenSettings, onOpenReport, onClose]
  );

  // Event-based commands (filtered by search query)
  const eventCommands: CommandItem[] = useMemo(() => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    return events
      .filter(
        event =>
          event.properties.tweet_text?.toLowerCase().includes(lowerQuery) ||
          event.properties.humanitarian_category?.toLowerCase().includes(lowerQuery) ||
          event.properties.damage_severity?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8)
      .map(event => ({
        id: `event-${event.id}`,
        type: 'event' as const,
        icon: <MapPinIcon className="h-4 w-4" />,
        title: event.properties.tweet_text?.slice(0, 80) + (event.properties.tweet_text?.length > 80 ? '...' : '') || 'Crisis Event',
        subtitle: `${event.properties.humanitarian_category} · ${event.properties.damage_severity}`,
        action: () => {
          onFlyTo(event.geometry.coordinates);
          onClose();
        },
      }));
  }, [query, events, onFlyTo, onClose]);

  // Combine and filter commands
  const allCommands = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const filteredStatic =
      query.length > 0
        ? staticCommands.filter(
            cmd =>
              cmd.title.toLowerCase().includes(lowerQuery) ||
              cmd.subtitle?.toLowerCase().includes(lowerQuery)
          )
        : staticCommands;

    return [...filteredStatic, ...eventCommands];
  }, [query, staticCommands, eventCommands]);

  // Keep selectedIndex in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [allCommands.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, allCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            allCommands[selectedIndex].action();
          }
          break;
      }
    },
    [allCommands, selectedIndex]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const typeLabel = (type: string) => {
    switch (type) {
      case 'action':
        return 'ACTION';
      case 'event':
        return 'EVENT';
      case 'navigate':
        return 'NAVIGATE';
      default:
        return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'var(--t-overlay)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--t-bg-primary)] border border-[var(--t-border)] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-[var(--t-border)]">
          <MagnifyingGlassIcon className="h-5 w-5 text-[var(--t-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search events..."
            className="flex-1 px-3 py-4 bg-transparent text-[var(--t-text-primary)] text-sm outline-none placeholder:text-[var(--t-text-muted)]"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] text-[var(--t-text-muted)] border border-[var(--t-kbd-border)] rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
          {allCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--t-text-muted)] text-sm">
              {query.length > 0
                ? `No results for "${query}"`
                : 'Start typing to search...'}
            </div>
          ) : (
            allCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-[var(--t-accent-subtle)] text-[var(--t-text-primary)]'
                    : 'text-[var(--t-text-secondary)] hover:text-[var(--t-text-primary)]'
                }`}
              >
                <span
                  className={`shrink-0 ${
                    index === selectedIndex ? 'text-[var(--t-accent-text)]' : 'text-[var(--t-text-muted)]'
                  }`}
                >
                  {cmd.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{cmd.title}</p>
                  {cmd.subtitle && (
                    <p className="text-xs text-[var(--t-text-muted)] truncate">{cmd.subtitle}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded ${
                    index === selectedIndex
                      ? 'text-[var(--t-accent-text)] bg-[var(--t-accent-subtle)]'
                      : 'text-[var(--t-text-muted)]'
                  }`}
                >
                  {typeLabel(cmd.type)}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--t-border)] text-[10px] text-[var(--t-text-muted)] font-mono">
          <span>
            <kbd className="px-1 py-0.5 border border-[var(--t-kbd-border)] rounded mr-1">↑↓</kbd>
            navigate
          </span>
          <span>
            <kbd className="px-1 py-0.5 border border-[var(--t-kbd-border)] rounded mr-1">↵</kbd>
            select
          </span>
          <span>
            <kbd className="px-1 py-0.5 border border-[var(--t-kbd-border)] rounded mr-1">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
