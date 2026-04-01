'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import AddModal from '@/components/AddModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CrisisEvent, CrisisEventCollection } from '@/types';
import SearchOverlay from '@/components/SearchOverlay';
import FilterPanel from '@/components/FilterPanel';
import SubmitForm from '@/components/SubmitForm';
import SettingsPanel from '@/components/SettingsPanel';
import StatusBar from '@/components/StatusBar';
import CommandPalette from '@/components/CommandPalette';
import TrendingEventsBar from '@/components/TrendingEventsBar';
import { SettingsProvider } from '@/context/SettingsContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface ActiveFilters {
  types: string[];
  severities: string[];
  humanitarian: string[];
  dateRange: number[];
}

function HomeContent() {
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
    // TODO: Logic here to filter the 'events' state based on 'filters'
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CrisisEventCollection>('/api/events');
        setEvents(response.data.features);
        console.log('Fetched Events:', response.data.features);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeSidebar = () => setSelectedEvent(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900" style={{ fontFamily: 'var(--app-font-family)', fontSize: 'var(--app-font-size)' }}>
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
        <StatusBar eventCount={events.length} isLoading={loading} />
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 text-neutral-950 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium">
          Loading crisis data...
        </div>
      )}

      <Button
        icon={<PlusIcon />}
        text="Report a disaster"
        variant="primary"
        className="absolute top-8 right-10 z-10 shadow-lg"
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

