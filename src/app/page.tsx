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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mapCenterRef = useRef<mapboxgl.Map | null>(null);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const flyToCoordinates = (coords: [number, number]) => {
    if (mapCenterRef.current) {
      mapCenterRef.current.easeTo({
        center: coords,
        zoom: 8,
        duration: 1500,
      });
    }
    closeSearch();
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CrisisEventCollection>('/api/events');
        setEvents(response.data.features);
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
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 font-sans">
      <Sidebar
        onReportClick={openModal}
        onSearchClick={openSearch}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <Map
        events={events}
        onMarkerClick={setSelectedEvent}
        mapRef={mapCenterRef}
        isSideBarCollapsed={isCollapsed}
      />

      {isSearchOpen && <SearchOverlay onClose={closeSearch} onSelectEvent={flyToCoordinates} />}

      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 text-neutral-950 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium">
          Loading crisis data...
        </div>
      )}

      <Button
        icon={<PlusIcon />}
        text="Report a disaster"
        variant="primary"
        className="absolute top-4 right-10 z-10 shadow-lg"
        onClick={openModal}
      />
      {isModalOpen && <AddModal onClose={closeModal} />}
    </div>
  );
}
