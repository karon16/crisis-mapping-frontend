'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CrisisEvent } from '@/types';
import axios from 'axios';
import { ActiveFilters } from '../app/page';

interface SearchOverlayProps {
  onClose: () => void;
  onSelectEvent: (coordinates: [number, number]) => void;
  activeFilters: ActiveFilters;
}

interface SearchResult {
  id: string | number;
  text: string;
  category: string;
  coordinates: [number, number];
}

export default function SearchOverlay({ onClose, onSelectEvent, activeFilters }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('search', query);

      const toSnakeCase = (str: string) => {
        if (str === 'Severe Damage') return 'severe_damage';
        return str.toLowerCase().replace(/ /g, '_');
      };

      activeFilters.types.forEach(t => params.append('type', toSnakeCase(t)));
      activeFilters.severities.forEach(s => params.append('severity', toSnakeCase(s)));
      activeFilters.humanitarian.forEach(h => params.append('category', toSnakeCase(h)));

      const apiResponse = await axios.get(`/api/events?${params.toString()}`);
      const allEvents = apiResponse.data.features as CrisisEvent[];

      const filteredResults = allEvents.map((event: any) => ({
        id: event.id,
        text: event.properties.tweet_text,
        category: event.properties.humanitarian_category,
        coordinates: event.geometry.coordinates,
      }));

      setSearchResults(filteredResults.slice(0, 10));
    } catch (error) {
      console.error('Search simulation failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);

  // Focus the input when the modal opens
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleResultClick = (result: SearchResult) => {
    onSelectEvent(result.coordinates);
    onClose();
  };

  const isResultsVisible = !loading && (searchTerm.length >= 3 || searchResults.length > 0);


  // search Input 
  const SearchInput = useMemo(
    () => (
      <div className="relative w-full max-w-2xl">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--t-text-muted)]" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search events by text or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-4 text-xl border-2 border-[var(--t-border)] rounded-xl shadow-2xl bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)] outline-none focus:border-[var(--t-accent)] transition-shadow placeholder:text-[var(--t-text-muted)]"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--t-accent-text)]">
            Loading...
          </div>
        )}
      </div>
    ),
    [searchTerm, loading]
  ); 

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center pt-24 px-4 backdrop-blur-md"
      style={{ backgroundColor: 'var(--t-overlay)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[var(--t-text-primary)] hover:text-[var(--t-accent-text)] transition-colors p-2 rounded-full z-30 dark:text-white text-white"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      {/* Central Search Input */}
      {SearchInput}

      {/* Search Results List */}
      <div className="mt-8 w-full max-w-2xl space-y-2 max-h-96 overflow-y-auto">
        {isResultsVisible && (
          <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl shadow-lg border border-[var(--t-border)]">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-[var(--t-border)]">
                {searchResults.map(result => (
                  <li
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 hover:bg-[var(--t-bg-hover)] cursor-pointer transition-colors rounded-lg text-[var(--t-text-primary)]"
                  >
                    <p className="font-medium text-sm truncate">{result.text}</p>
                    <p className="text-xs text-[var(--t-accent-text)]">{result.category}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-[var(--t-text-muted)]">No events found matching "{searchTerm}".</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
