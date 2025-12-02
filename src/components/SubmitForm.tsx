import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl, { Marker, Map, LngLat } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'; // Import the Geocoder control

// @ts-ignore: Allow importing geocoder CSS without type declarations
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'; // Import Geocoder styles
// @ts-ignore: Allow importing geocoder CSS without type declarations
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Define the shape for the coordinates selected by the user
interface Coordinates {
  lng: number;
  lat: number;
}

interface SubmitFormProps {
  onClose: () => void;
}

const SubmitForm = ({ onClose }: SubmitFormProps) => {
  // --- STATE ---
  const [reportText, setReportText] = useState('');
  const [locationString, setLocationString] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 10));
  const [pinCoordinates, setPinCoordinates] = useState<Coordinates | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REFS ---
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Marker | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null); // Ref for the Geocoder search bar
  const geocoderElementRef = useRef<HTMLElement | null>(null);

  const API_ENDPOINT = 'http://203.252.106.25:8000/events';

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCoordinates) {
      alert('Please select a location on the map.');
      return;
    }
    if (!imageFiles || imageFiles.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      // Append fields to match backend 'create_event' arguments
      formData.append('text', reportText);
      formData.append('location_name', locationString);
      formData.append('latitude', pinCoordinates.lat.toString());
      formData.append('longitude', pinCoordinates.lng.toString());

      // Backend expects a single file named 'file'
      formData.append('file', imageFiles[0]);

      console.log(formData);

      // Send POST request to your backend
      const response = await axios.post('http://127.0.0.1:8000/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Submission Successful:', response.data);
      alert('Report submitted successfully!');

      // Close modal and optionally refresh map data here
      onClose();
      // Ideally, trigger a re-fetch in the parent component here
      window.location.reload(); // Simple way to refresh map data
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (!mapContainerRef.current) return;

    const initialLngLat: LngLat = new mapboxgl.LngLat(129.3245, 36.0145); // Set to Pohang as a better initial guess

    const map = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: initialLngLat.toArray() as [number, number],
      zoom: 12,
    });

    const marker = new Marker({
      draggable: true,
      color: '#F00',
    })
      .setLngLat(initialLngLat)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any, // Cast is sometimes needed for MapboxGLGeocoder
      marker: false, // We use our own custom marker
      placeholder: 'Search for a location or address...',
      flyTo: false, // We handle the flyTo/zoom manually
    });

    geocoderRef.current = geocoder;

    // Attach the Geocoder component to the placeholder div
    const geocoderContainer = document.getElementById('geocoder-container');
    if (geocoderContainer) {
      geocoderContainer.innerHTML = ''; // Clear first
      geocoderElementRef.current = geocoder.onAdd(map);
      geocoderContainer.appendChild(geocoderElementRef.current);
    }

    // Function to update state and marker position
    const updateLocationState = (lngLat: LngLat, name: string) => {
      marker.setLngLat(lngLat);
      map.flyTo({ center: lngLat.toArray() as [number, number], zoom: 12 });
      setPinCoordinates({ lng: lngLat.lng, lat: lngLat.lat });
      setLocationString(name); // Set the display name from geocoder/reverse geocoder
    };

    const onCoordUpdate = async (lngLat: LngLat) => {
      // First update the marker position immediately for responsive UX
      marker.setLngLat(lngLat);
      map.flyTo({ center: lngLat.toArray() as [number, number], zoom: 12 });
      setPinCoordinates({ lng: lngLat.lng, lat: lngLat.lat });

      // Show loading state
      setLocationString('Getting location name...');

      try {
        // Call Mapbox Geocoding API for reverse geocoding
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          // Get the most relevant place name
          const placeName = data.features[0].place_name;
          setLocationString(placeName);
        } else {
          setLocationString(`${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setLocationString(`${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
      }
    };
    const onDragEnd = () => onCoordUpdate(marker.getLngLat());
    const onMapClick = (e: mapboxgl.MapMouseEvent) => onCoordUpdate(e.lngLat);

    // b) Geocoder Result Handler (User selects from dropdown)
    const onGeocodeResult = (e: any) => {
      const selectedLngLat = new mapboxgl.LngLat(e.result.center[0], e.result.center[1]);
      updateLocationState(selectedLngLat, e.result.place_name);

      // Also clear the search bar after selecting
      geocoder.clear();
    };

    // --- 5. Attaching Listeners ---
    marker.on('dragend', onDragEnd);
    map.on('click', onMapClick);
    geocoder.on('result', onGeocodeResult);

    // --- 6. Cleanup ---
    return () => {
      marker.off('dragend', onDragEnd);
      map.off('click', onMapClick);
      geocoder.off('result', onGeocodeResult);
      if (geocoderContainer && geocoderElementRef.current) {
        geocoderContainer.removeChild(geocoderElementRef.current);
      }
      map.remove();
    };
  }, []); // Empty dependency array means it runs once on mount

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
        <div className="flex-grow space-y-6 pr-2 overflow-y-auto">
          {/* Submission Error Alert */}
          {submissionError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-medium">
              {submissionError}
            </div>
          )}

          {/* Location Input Section (UPDATED) */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location Name (Search or Manual):
              </label>

              {/* Geocoder Search Bar Container */}
              <div id="geocoder-container" className="w-full h-10 mb-2" />

              {/* Display Coordinates/Location Name set by Geocoder or Pin */}
              <input
                id="location"
                type="text"
                readOnly // Make this read-only as the Geocoder controls the value
                placeholder={
                  pinCoordinates
                    ? `Pin set at: Lat ${pinCoordinates.lat.toFixed(4)}, Lng ${pinCoordinates.lng.toFixed(4)}`
                    : 'Search above or drop a pin...'
                }
                value={locationString}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="w-1/3">
              {/* Date Input */}
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Date of Event:
              </label>
              <input
                id="date"
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Map Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Location on Map:
            </label>
            <div className="h-70 rounded-lg relative">
              <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
              {/* Display live coordinates */}
              {pinCoordinates && (
                <div className="absolute top-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full font-mono">
                  LAT: {pinCoordinates.lat.toFixed(4)}, LNG: {pinCoordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* Report Text and Image Upload (Remain the same) */}
          <div>
            <label
              htmlFor="reportText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description / Report Text:
            </label>
            <textarea
              id="reportText"
              rows={4}
              placeholder="Describe the disaster and needs (e.g., 'Flooding in my street, need help evacuating.')"
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="imageFiles"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Image Upload (Visual Evidence - Multiple Allowed):
            </label>
            <input
              id="imageFiles"
              type="file"
              accept="image/*"
              multiple
              onChange={e => setImageFiles(e.target.files)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-fuchsia-600 text-white rounded-lg font-bold hover:bg-fuchsia-700 transition-colors shadow-md disabled:bg-gray-500"
          >
            {isSubmitting ? 'Processing...' : 'Submit Report for AI Classification'}
          </button>
        </div>
      </form>
    </>
  );
};

export default SubmitForm;
