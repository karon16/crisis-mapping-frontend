'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CrisisEvent } from '@/types';
import axios from 'axios';

interface SearchOverlayProps {
  onClose: () => void;
  onSelectEvent: (coordinates: [number, number]) => void;
}

interface SearchResult {
  id: string | number;
  text: string;
  category: string;
  coordinates: [number, number];
}

export default function SearchOverlay({ onClose, onSelectEvent }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    //TODO: Replace with actual search API call
    try {
      const apiResponse = await axios.get('/api/events');
      const allEvents = apiResponse.data.features as CrisisEvent[];

      const filteredResults = allEvents
        .filter(
          event =>
            event.properties.tweet_text.toLowerCase().includes(query.toLowerCase()) ||
            event.properties.humanitarian_category.toLowerCase().includes(query.toLowerCase())
        )
        .map(event => ({
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
  }, []);

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
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search events by text or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-4 text-xl border-2 border-neutral-700 rounded-xl shadow-2xl focus:ring-neutral-500 focus:border-neutral-500 dark:bg-neutral-800 outline-none dark:text-white transition-shadow"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-fuchsia-600">
            Loading...
          </div>
        )}
      </div>
    ),
    [searchTerm, loading]
  ); 

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center pt-24 bg-black/90 backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-fuchsia-400 transition-colors p-2 rounded-full z-30"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      {/* Central Search Input (Use the memoized component) */}
      {SearchInput}

      {/* Search Results List */}
      <div className="mt-8 w-full max-w-2xl space-y-2 max-h-96 overflow-y-auto">
        {isResultsVisible && (
          <div className="bg-neutral-800 p-4 rounded-xl shadow-lg border border-neutral-700">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-neutral-700">
                {searchResults.map(result => (
                  <li
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 hover:bg-neutral-700 cursor-pointer transition-colors rounded-lg text-white"
                  >
                    <p className="font-medium text-sm truncate">{result.text}</p>
                    <p className="text-xs text-fuchsia-400">{result.category}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400">No events found matching "{searchTerm}".</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
