'use client';
import { useRef, useEffect, useState, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { CrisisEvent } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { createRoot } from 'react-dom/client';
import { PopupContent } from './PopupContent';
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
  const { settings } = useSettings();

  // multiple images




  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      // make the style dynamic as well
      style: 'mapbox://styles/karon16/cmmlpp59k00ik01sj5jp0cvgv',
      // style: 'mapbox://styles/mapbox/standard',
      center: [30, 0],
      
      zoom: 2,
      projection: settings.mapProjection as any, // Set initial projection dynamically
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: 'night',
        },
      },
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right'
    );

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

  const prevThemeRef = useRef(settings.theme);

  const DARK_STYLE = 'mapbox://styles/karon16/cmmlpp59k00ik01sj5jp0cvgv';
  const LIGHT_STYLE = 'mapbox://styles/mapbox/standard';

  // Apply projection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;
    map.setProjection(settings.mapProjection);
  }, [settings.mapProjection, isMapLoaded]);

  // Switch map style when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Skip the initial run — map was already initialized with the correct style
    if (prevThemeRef.current === settings.theme) return;
    prevThemeRef.current = settings.theme;

    const isDark = settings.theme === 'dark';

    // Must swap the entire style because the custom style doesn't support basemap config
    setIsMapLoaded(false);
    map.setStyle(isDark ? DARK_STYLE : LIGHT_STYLE);

    map.once('style.load', () => {
      // Apply config properties for the Standard style (light mode)
      if (!isDark) {
        try {
          map.setConfigProperty('basemap', 'lightPreset', 'dawn');
          map.setConfigProperty('basemap', 'theme', 'monochrome');
        } catch (e) {
          console.warn('[Map] Could not set config:', e);
        }
      }
      // Re-apply projection
      map.setProjection(settings.mapProjection);
      // This triggers the events useEffect to re-add source/layers
      setIsMapLoaded(true);
    });
  }, [settings.theme, isMapLoaded]);


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

    // Remove previous interactions if they exist (they survive setStyle)
    const interactionIds = [
      'click-clusters',
      'mouseenter-unclustered',
      'mouseleave-unclustered',
      'mouseenter-clusters',
      'mouseleave-clusters',
    ];
    for (const id of interactionIds) {
      try { map.removeInteraction(id); } catch (_) { /* may not exist yet */ }
    }

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
      if (!e.features || e.features.length === 0) return;
      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const props = e.features[0].properties;

      if (!props) return;

      const popupNode = document.createElement('div');
      popupNode.style.width = '200px';
      
      const root = createRoot(popupNode);
      root.render(
        <PopupContent 
          props={props} 
          coordinates={coordinates as [number, number]} 
        />
      );

      new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        className: 'custom-mapbox-popup',
      })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(popupNode)
        .addTo(map);

      // Center map on the selected marker to keep the popup visible
      map.easeTo({
        center: coordinates as [number, number],
        offset: [0, 100], // Slight offset to account for popup height visually
      });
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
    <div className={`flex-1 w-full h-dvh bg-[var(--t-bg-primary)] transition-all duration-300 ease-in-out`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
