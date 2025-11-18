'use client';
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const Map = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: [-77.03915, 38.90025], // Washington DC
      zoom: 3,
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: 'night',
        },
      },
    });

    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    //Changed 'w-4/5' to 'flex-1' (Grow to fill remaining space)
    <div className="flex-1 h-dvh bg-[#0C0A16]">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
