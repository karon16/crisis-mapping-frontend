import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Marker, Map, LngLat } from 'mapbox-gl';
// @ts-ignore: CSS module without type declarations
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const [reportText, setReportText] = useState('');
  const [locationString, setLocationString] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 10));
  const [pinCoordinates, setPinCoordinates] = useState<Coordinates | null>(null);

  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Marker | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('--- FINAL SUBMISSION DATA ---');
    console.log('Report Text:', reportText);
    console.log('Location String:', locationString);
    console.log('Image Count:', imageFiles ? imageFiles.length : 0);
    console.log('Pin Coordinates:', pinCoordinates?.lat, pinCoordinates?.lng);

    onClose();
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    // Check if the map container is ready
    if (!mapContainerRef.current) return;

    // Initial Coordinates (Washington DC)
    const initialLngLat: LngLat = new mapboxgl.LngLat(-77.03915, 38.90025);

    // Initialize the Map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Use the ref directly
      style: 'mapbox://styles/mapbox/light-v11', // Changed to light for better visibility
      center: initialLngLat.toArray() as [number, number],
      zoom: 9,
    });

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: '#ca05f1c0',
    })
      .setLngLat(initialLngLat)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    setPinCoordinates({ lng: initialLngLat.lng, lat: initialLngLat.lat });

    const onDragEnd = () => {
      const lngLat = marker.getLngLat();
      setPinCoordinates({ lng: lngLat.lng, lat: lngLat.lat });
    };

    const onMapClick = (e: mapboxgl.MapMouseEvent) => {
      marker.setLngLat(e.lngLat);
      setPinCoordinates({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    marker.on('dragend', onDragEnd);
    map.on('click', onMapClick);

    return () => {
      marker.off('dragend', onDragEnd);
      map.off('click', onMapClick);
      map.remove();
    };
  }, []);
  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
        <div className="grow space-y-6 pr-2 overflow-y-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location (Address/City):
              </label>
              <input
                id="location"
                type="text"
                placeholder="Input location"
                value={locationString}
                onChange={e => {
                  setLocationString(e.target.value);
                  // setPinCoordinates(null);
                }}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="w-1/3">
              {/* Date Input*/}
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
              Confirm Location on Map (Drag or Click):
            </label>
            <div className="h-70 rounded-lg">
              <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
            </div>
          </div>

          {/* Report Text and Image Upload*/}
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
            className="w-full px-4 py-3 bg-fuchsia-600 text-white rounded-lg font-bold hover:bg-fuchsia-700 transition-colors shadow-md"
          >
            Submit Report for AI Classification
          </button>
        </div>
      </form>
    </>
  );
};

export default SubmitForm;
