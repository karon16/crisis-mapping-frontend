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
  onSuccess?: (event: any) => void;
}

const SubmitForm = ({ onClose, onSuccess }: SubmitFormProps) => {
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
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const geocoderElementRef = useRef<HTMLElement | null>(null);

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
      formData.append('text', reportText);
      formData.append('location_name', locationString);
      formData.append('latitude', pinCoordinates.lat.toString());
      formData.append('longitude', pinCoordinates.lng.toString());

      Array.from(imageFiles).forEach((file) => {
        formData.append('files', file);
      });

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axios.post('/api/events', formData);
      const data = response.data;
      
      if (onSuccess) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.252.106.25:8000';
        const newEvent = {
          type: 'Feature',
          id: data.id || Date.now(),
          geometry: {
            type: 'Point',
            coordinates: [data.longitude || pinCoordinates.lng, data.latitude || pinCoordinates.lat],
          },
          properties: {
            tweet_text: data.text || reportText,
            image_url: data.image_url ? data.image_url.split(',').map((p: string) => `${apiUrl}${p.trim()}`).join(',') : '',
            timestamp: data.created_at || new Date().toISOString(),
            informativeness: data.is_informative ? 'Informative' : 'Not Informative',
            humanitarian_category: data.category || 'Unknown',
            damage_severity: data.severity || 'Unknown',
            location_name: data.location_name || locationString,
            type: data.type || 'other',
            isStatic: true
          }
        };
        onSuccess(newEvent);
      }

      alert('Report submitted successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      const detailedError = error.response?.data?.details || error.response?.data?.error || error.message;
      alert(`Failed to submit report. Reason: ${detailedError}\nCheck console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (!mapContainerRef.current) return;

    const initialLngLat: LngLat = new mapboxgl.LngLat(129.3245, 36.0145);

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
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Search for a location or address...',
      flyTo: false,
    });

    geocoderRef.current = geocoder;

    const geocoderContainer = document.getElementById('geocoder-container');
    if (geocoderContainer) {
      geocoderContainer.innerHTML = '';
      geocoderElementRef.current = geocoder.onAdd(map);
      geocoderContainer.appendChild(geocoderElementRef.current);
    }

    const updateLocationState = (lngLat: LngLat, name: string) => {
      marker.setLngLat(lngLat);
      map.flyTo({ center: lngLat.toArray() as [number, number], zoom: 12 });
      setPinCoordinates({ lng: lngLat.lng, lat: lngLat.lat });
      setLocationString(name);
    };

    const onCoordUpdate = async (lngLat: LngLat) => {
      marker.setLngLat(lngLat);
      map.flyTo({ center: lngLat.toArray() as [number, number], zoom: 12 });
      setPinCoordinates({ lng: lngLat.lng, lat: lngLat.lat });

      setLocationString('Getting location name...');

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
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

    const onGeocodeResult = (e: any) => {
      const selectedLngLat = new mapboxgl.LngLat(e.result.center[0], e.result.center[1]);
      updateLocationState(selectedLngLat, e.result.place_name);
      geocoder.clear();
    };

    marker.on('dragend', onDragEnd);
    map.on('click', onMapClick);
    geocoder.on('result', onGeocodeResult);

    return () => {
      marker.off('dragend', onDragEnd);
      map.off('click', onMapClick);
      geocoder.off('result', onGeocodeResult);
      if (geocoderContainer && geocoderElementRef.current) {
        geocoderContainer.removeChild(geocoderElementRef.current);
      }
      map.remove();
    };
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-3">
        {/* Submission Error Alert */}
        {submissionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-medium">
            {submissionError}
          </div>
        )}

        <div className="">
          <div id="geocoder-container" className="w-full h-10 mb-2" />
        </div>
        {/* Location Input Section */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-[var(--t-text-secondary)] mb-1"
            >
              Location Name (Search or Manual):
            </label>

            <input
              id="location"
              type="text"
              readOnly
              placeholder={
                pinCoordinates
                  ? `Pin set at: Lat ${pinCoordinates.lat.toFixed(4)}, Lng ${pinCoordinates.lng.toFixed(4)}`
                  : 'Search above or drop a pin...'
              }
              value={locationString}
              required
              className="w-full p-3 border border-[var(--t-border)] rounded-lg bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)] placeholder-[var(--t-text-muted)]"
            />
          </div>
          <div className="w-1/3">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-[var(--t-text-secondary)] mb-1"
            >
              Date of Event:
            </label>
            <input
              id="date"
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              required
              className="w-full p-3 border border-[var(--t-border)] rounded-lg bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)]"
            />
          </div>
        </div>

        {/* Map Section */}
        <div>
          <label className="block text-sm font-medium text-[var(--t-text-secondary)] mb-1">
            Confirm Location on Map:
          </label>
          <div className="h-28 sm:h-40 rounded-lg relative">
            <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
            {pinCoordinates && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full font-mono">
                LAT: {pinCoordinates.lat.toFixed(4)}, LNG: {pinCoordinates.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Report Text */}
        <div>
          <label
            htmlFor="reportText"
            className="block text-sm font-medium text-[var(--t-text-secondary)] mb-1"
          >
            Description / Report Text:
          </label>
          <textarea
            id="reportText"
            rows={3}
            placeholder="Describe the disaster and needs (e.g., 'Flooding in my street, need help evacuating.')"
            value={reportText}
            onChange={e => setReportText(e.target.value)}
            required
            className="w-full p-3 border border-[var(--t-border)] rounded-lg bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)] placeholder-[var(--t-text-muted)] resize-none"
          />
        </div>
        {/* Image Upload */}
        <div>
          <label
            htmlFor="imageFiles"
            className="block text-sm font-medium text-[var(--t-text-secondary)] mb-1"
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
            className="w-full p-3 border border-[var(--t-border)] rounded-lg bg-[var(--t-bg-secondary)] text-[var(--t-text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--t-accent-subtle)] file:text-[var(--t-accent-text)]"
          />
        </div>
        <div className="sticky bottom-0 pt-3 pb-1 bg-[var(--t-bg-primary)]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[var(--t-accent)] text-white rounded-lg font-bold hover:bg-[var(--t-accent-hover)] transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Submit Report for AI Classification'}
          </button>
        </div>
      </form>
    </>
  );
};

export default SubmitForm;
