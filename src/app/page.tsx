'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import AddModal from '@/components/AddModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { CrisisEvent, CrisisEventCollection } from '@/types';
import SearchOverlay from '@/components/SearchOverlay';
import FilterPanel from '@/components/FilterPanel';
import SubmitForm from '@/components/SubmitForm';
import SettingsPanel from '@/components/SettingsPanel';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';
import TrendingEventsBar from '@/components/TrendingEventsBar';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export interface ActiveFilters {
  types: string[];
  severities: string[];
  humanitarian: string[];
  dateRange: number[];
}

function HomeContent() {
  const { isHydrated } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    types: [],
    severities: [],
    humanitarian: [],
    dateRange: [2018, new Date().getFullYear()],
  });

  // Command Palette
  const commandPalette = useCommandPalette();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mapCenterRef = useRef<mapboxgl.Map | null>(null);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Fly to selected event from search
  const flyToCoordinates = (coords: [number, number]) => {
    if (mapCenterRef.current) {
      mapCenterRef.current.easeTo({
        center: coords,
        zoom: 12,
        duration: 1500,
      });
    }
    closeSearch();
  };

  const openFilter = () => setIsFilterOpen(!isFilterOpen);
  const closeFilter = () => setIsFilterOpen(false);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const applyFilters = (filters: ActiveFilters) => {
    setActiveFilters(filters);
    setIsFilterOpen(false);


    console.log('Filters Applied:', filters);
  };

  // 0. Fetch original hard data on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CrisisEventCollection>('/api/events');
        
        if (!response.data || !Array.isArray(response.data.features)) {
          console.error("Backend error or invalid data format:", response.data);
          return;
        }

        const originalFeatures = response.data.features.map((f: any) => ({
          ...f,
          properties: {
            ...f.properties,
            isStatic: true
          }
        }));

        setEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const filteredNew = originalFeatures.filter((e: any) => !existingIds.has(e.id));
          return [...prev, ...filteredNew];
        });
        console.log('Fetched Events:', originalFeatures);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // 1. Fetch 75 random points every 30 seconds
  useEffect(() => {
    const fetchSimulationData = async () => {
      try {
        const response = await fetch('/api/simulation/stream');
        const data = await response.json();
        
        if (!response.ok || !Array.isArray(data)) {
          console.error("Backend error or invalid data format:", data);
          return;
        }

        const now = Date.now();

        // Convert backend flat JSON to GeoJSON and stamp the spawnTime
        const newFeatures: CrisisEvent[] = data.map((item: any) => ({
          type: 'Feature',
          id: item.id,
          geometry: {
            type: 'Point',
            // Ensure Mapbox gets [longitude, latitude]
            coordinates: [item.longitude, item.latitude] 
          },
          properties: {
            tweet_text: item.text,
            image_url: item.image_url
              ? item.image_url.split(',').map((p: string) => `http://203.252.106.25:8000${p.trim()}`).join(',')
              : '',
            timestamp: item.created_at,
            informativeness: item.is_informative ? 'Informative' : 'Not Informative',
            humanitarian_category: item.humanitarian || item.category, // handle both cases
            damage_severity: item.severity,
            duration: item.duration || 60, // Default to 60s if missing
            spawnTime: now
          }
        }));

        // Append new points to existing ones
        setEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const filteredNew = newFeatures.filter(e => !existingIds.has(e.id));
          return [...prev, ...filteredNew];
        });
        setLoading(false);
      } catch (error) {
        console.error("Simulation fetch failed:", error);
        setLoading(false);
      }
    };

    fetchSimulationData(); // Fetch immediately
    const fetchInterval = setInterval(fetchSimulationData, 30000); 

    return () => clearInterval(fetchInterval);
  }, []);

  // 2. Garbage Collector: Remove points that expire
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      
      setEvents(prevEvents => 
        prevEvents.filter(event => {
          if (event.properties.isStatic) return true;
          const durationMs = (event.properties.duration || 60) * 1000;
          const spawnTime = event.properties.spawnTime || now;
          
          return now < spawnTime + durationMs;
        })
      );
    }, 1000); // Check every second

    return () => clearInterval(cleanupInterval);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeSidebar = () => setSelectedEvent(null);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[var(--t-bg-primary)]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[var(--t-brand-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--t-text-secondary)] font-medium text-sm tracking-wide">Initializing environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--t-bg-primary)] theme-transition" style={{ fontFamily: 'var(--app-font-family)', fontSize: 'var(--app-font-size)' }}>
      <Sidebar
        onReportClick={openModal}
        onSearchClick={openSearch}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        onFilterClick={openFilter}
        onSettingsClick={openSettings}
      />
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={closeFilter}
        onApplyFilters={applyFilters}
      />
      <SettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />

      {/* Map Area with Status Bar */}
      <div className="relative flex-1">
        <StatusBar
          eventCount={events.length}
          isLoading={loading}
          onContinentSelect={(center, zoom) => {
            if (mapCenterRef.current) {
              mapCenterRef.current.easeTo({ center, zoom, duration: 1500 });
            }
          }}
        />
        <Map
          events={events}
          onMarkerClick={setSelectedEvent}
          mapRef={mapCenterRef}
          isSideBarCollapsed={isCollapsed}
        />
        <TrendingEventsBar
          events={events}
          onEventClick={(event) => {
            setSelectedEvent(event);
            flyToCoordinates(event.geometry.coordinates);
          }}
        />
      </div>

      {/* Search Overlay */}
      {isSearchOpen && <SearchOverlay onClose={closeSearch} onSelectEvent={flyToCoordinates} activeFilters={activeFilters} />}

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        events={events}
        onFlyTo={flyToCoordinates}
        onOpenFilter={openFilter}
        onOpenSettings={openSettings}
        onOpenReport={openModal}
      />

      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 text-[var(--t-text-primary)] bg-[var(--t-bg-elevated)] backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium border border-[var(--t-border)]">
          Loading crisis data...
        </div>
      )}

      <Button
        icon={<PlusCircleIcon />}
        text="Report a disaster"
        variant="primary"
        className="absolute top-12 right-10 z-10 shadow-lg"
        onClick={openModal}
      />
      {isModalOpen && (
        <AddModal onClose={closeModal}>
          <SubmitForm onClose={closeModal} />
        </AddModal>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <HomeContent />
    </SettingsProvider>
  );
}

