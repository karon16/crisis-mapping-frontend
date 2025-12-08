'use client';
import { useRef, useEffect, useState, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { CrisisEvent } from '@/types';
// @ts-ignore: CSS module without type declarations
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  events: CrisisEvent[];
  onMarkerClick: (event: CrisisEvent) => void;
  mapRef: RefObject<mapboxgl.Map | null>;
  isSideBarCollapsed: boolean;
}

const Map: React.FC<MapProps> = ({
  events,
  onMarkerClick,
  mapRef,
  isSideBarCollapsed,
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/standard',
      center: [30, 0],
      zoom: 2,
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: 'night',
        },
      },
    });

    // Assign the map instance to the external ref
    mapRef.current = map;

    // Set map load state
    map.on('load', () => {
      setIsMapLoaded(true);
    });

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Wait for the sidebar's CSS transition (300ms) to finish
    const handler = setTimeout(() => {
      map.resize();
      // After resizing, map.resize() often resets the center. You might need
      // to call map.getCenter() before resize and map.setCenter() after resize
      // if the map jumps unexpectedly, but resize() alone is the fix.
    }, 200);

    return () => clearTimeout(handler);
  }, [isSideBarCollapsed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const sourceId = 'crisis-events';

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: events,
      });
      return;
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: events,
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    //Add layers and event handlers for clusters and markers here
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#9D00B9',
        'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
        'circle-opacity': 1,
        'circle-emissive-strength': 1,
      },
    });

    // Cluster count labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Unclustered points
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#9D00B9',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-emissive-strength': 1,
      },
    });

    // Click event cluster points
    mapRef.current?.addInteraction('click-clusters', {
      type: 'click',
      target: { layerId: 'clusters' },
      handler: e => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties?.cluster_id;
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom || 14,
            });
          }
        );
      },
    });

    // Click event for unclustered points
    map.on('click', 'unclustered-point', e => {
      const coordinates = (e.features?.[0].geometry as any).coordinates.slice();
      const props = e.features?.[0].properties;

      if (!props) return;

      const popupContent = `
        <div class=" font-sans text-neutral-900 p-1 max-w-xs">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold m-0">${props.title || 'Crisis Event'}</h3>
            <!-- Close button is handled by Mapbox default UI, but you can custom style it via CSS -->
          </div>
          
          <p class="text-xs text-neutral-700 mb-3">
            ${props.timestamp ? new Date(props.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Date Unknown'}
            <br>
            Long: ${coordinates[0].toFixed(3)} Lat: ${coordinates[1].toFixed(3)}
          </p>

          <div class="flex flex-wrap gap-1 mb-3">
            <span class="bg-zinc-200 border border-zinc-700 text-neutral-900 text-xs px-2 py-1 rounded">${props.informativeness || 'Informative'}</span>
            <span class="bg-zinc-200 border border-zinc-700 text-neutral-900 text-xs px-2 py-1 rounded">${props.humanitarian_category || 'Damage'}</span>
            <span class="bg-zinc-200 border border-zinc-700 text-neutral-900 text-xs px-2 py-1 rounded">${props.damage_severity || 'Severity'}</span>
          </div>

          <p class="text-sm text-neutral-700 mb-4 leading-relaxed">
            ${props.tweet_text || 'No description available.'}
          </p>

          <div class="grid grid-cols-4 gap-2 mb-3">
             <!-- Example images - replace src with props.image_url -->
             <img src="${props.image_url}" class="w-full h-12 object-cover rounded border border-zinc-700" />
             <!-- Placeholders for gallery look -->
             <img src="${props.image_url}" class="w-full h-12 object-cover rounded border border-zinc-700 opacity-50" />
             <img src="${props.image_url}" class="w-full h-12 object-cover rounded border border-zinc-700 opacity-50" />
             <img src="${props.image_url}" class="w-full h-12 object-cover rounded border border-zinc-700 opacity-50" />
          </div>

          <a href="#" class="text-purple-500 text-xs hover:underline">Search on the web ></a>
        </div>
      `;

      new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        className: 'custom-mapbox-popup',
      })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    });

    mapRef.current?.addInteraction('mouseenter-unclustered', {
      type: 'mouseenter',
      target: { layerId: 'unclustered-point' },
      handler: () => {
        map.getCanvas().style.cursor = 'pointer';
      },
    });

    // change mouse cursor back to default when not hovering
    mapRef.current?.addInteraction('mouseleave-unclustered', {
      type: 'mouseleave',
      target: { layerId: 'unclustered-point' },
      handler: () => {
        map.getCanvas().style.cursor = '';
      },
    });

    // change mouse cursor to pointer when hovering over clusters
    mapRef.current?.addInteraction('mouseenter-clusters', {
      type: 'mouseenter',
      target: { layerId: 'clusters' },
      handler: () => {
        map.getCanvas().style.cursor = 'pointer';
      },
    });

    // change mouse cursor back to default when not hovering over clusters
    mapRef.current?.addInteraction('mouseleave-clusters', {
      type: 'mouseleave',
      target: { layerId: 'clusters' },
      handler: () => {
        map.getCanvas().style.cursor = '';
      },
    });

    // return () => mapRef.current?.remove();
  }, [events, isMapLoaded, onMarkerClick]);

  return (
    <div className={`flex-1 w-full h-dvh bg-[#0C0A16] transition-all duration-300 ease-in-out `}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
