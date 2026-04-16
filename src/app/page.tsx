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

interface ActiveFilters {
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

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (activeFilters.dateRange && activeFilters.dateRange.length === 2) {
          const startDate = new Date(activeFilters.dateRange[0], 0, 1).toISOString();
          const endDate = new Date(activeFilters.dateRange[1], 11, 31, 23, 59, 59).toISOString();
          params.append('start_date', startDate);
          params.append('end_date', endDate);
        }

        const response = await axios.get<CrisisEventCollection>(`/api/events?${params.toString()}`);
        let fetchedFeatures = response.data.features || [];

        // Apply multiple categorical filtering client-side
        if (activeFilters.types.length > 0) {
          fetchedFeatures = fetchedFeatures.filter(f => activeFilters.types.includes((f.properties as any).type));
        }
        if (activeFilters.severities.length > 0) {
          fetchedFeatures = fetchedFeatures.filter(f => activeFilters.severities.includes(f.properties.damage_severity as string));
        }
        if (activeFilters.humanitarian.length > 0) {
          fetchedFeatures = fetchedFeatures.filter(f => activeFilters.humanitarian.includes(f.properties.humanitarian_category as string));
        }

        setEvents(fetchedFeatures);
        console.log('Fetched Events:', fetchedFeatures);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeFilters]);

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
      {isSearchOpen && <SearchOverlay onClose={closeSearch} onSelectEvent={flyToCoordinates} />}

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

