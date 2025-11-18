'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import AddModal from '@/components/AddModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CrisisEvent, CrisisEventCollection } from '@/types';

export default function Home() {
  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
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

  // --- Handlers ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeSidebar = () => setSelectedEvent(null);

  return (
    // flex: puts Sidebar and Map side-by-side
    // h-screen: forces the app to be exactly the height of the window
    // overflow-hidden: prevents any accidental scrollbars
    // bg-neutral-900: matches your dark theme to prevent white flashes
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 font-sans">
      <Sidebar />
      <Map events={events} onMarkerClick={setSelectedEvent} />

      {loading && (
        <div className="absolute top-1/2 left-3/5 -translate-x-1/2 z-50 text-neutral-950 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium">
          Loading crisis data...
        </div>
      )}

      {/* 4. Report Button: Opens the modal */}
      <Button
        icon={<PlusIcon />}
        text="Report a disaster"
        variant="primary"
        className="absolute top-4 right-10 z-10 shadow-lg"
        onClick={openModal}
      />

      {/* 5. Modal: The form to add a new event */}
      {isModalOpen && <AddModal onClose={closeModal} />}
    </div>
  );
}
