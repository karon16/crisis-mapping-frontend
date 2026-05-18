'use client';
import { useRef, useEffect, useState, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { CrisisEvent } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { PopupContent } from './PopupContent';
import wc from 'which-country';
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




  const DARK_STYLE = 'mapbox://styles/karon16/cmmlpp59k00ik01sj5jp0cvgv';
  const LIGHT_STYLE = 'mapbox://styles/mapbox/standard';

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    const isDark = settings.theme === 'dark';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: isDark ? DARK_STYLE : LIGHT_STYLE,
      center: [30, 0],
      zoom: 2,
      projection: settings.mapProjection as any, // Set initial projection dynamically
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: isDark ? 'night' : 'dawn',
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
    if (!map || !isMapLoaded) return;

    const sourceId = 'crisis-events';

    if (!map.hasImage('pulsing-dot')) {
      const size = 100;
      const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        context: null as CanvasRenderingContext2D | null,

        onAdd: function () {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d', { willReadFrequently: true });
        },

        render: function () {
          const duration = 1500;
          const t = (performance.now() % duration) / duration;

          const radius = (size / 2) * 0.2;
          const outerRadius = (size / 2) * 0.6 * t + radius;
          const context = this.context;

          if (!context) return false;

          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
          context.fillStyle = `rgba(157, 0, 185, ${0.8 - t * 0.8})`;
          context.fill();

          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = 'rgba(157, 0, 185, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 1 + 2 * (1 - t);
          context.fill();
          context.stroke();

          this.data = new Uint8Array(context.getImageData(0, 0, this.width, this.height).data.buffer);

          map.triggerRepaint();

          return true;
        }
      };
      
      map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    }

    if (!map.getSource('countries')) {
      map.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });
      
      const WORLDVIEW = 'US';
      const worldview_filter = [
        'all',
        ['==', ['get', 'disputed'], 'false'],
        [
          'any',
          ['==', 'all', ['get', 'worldview']],
          ['in', WORLDVIEW, ['get', 'worldview']]
        ]
      ];

      map.addLayer({
        id: 'countries-join',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': 'rgba(0, 0, 0, 0)',
          'fill-opacity': 1 // Setting opacity here to ensure proper blending
        },
        filter: worldview_filter as mapboxgl.FilterSpecification
      });
    }

    const activeCountries = new Set<string>();
    for (const e of events) {
      const coords = e.geometry.coordinates;
      const code = wc([coords[0], coords[1]]);
      if (code) activeCountries.add(code);
    }

    if (activeCountries.size === 0) {
      map.setPaintProperty('countries-join', 'fill-color', 'rgba(0, 0, 0, 0)');
    } else {
      const matchExpression: any[] = ['match', ['get', 'iso_3166_1_alpha_3']];
      activeCountries.forEach(code => {
        matchExpression.push(code, 'rgba(157, 0, 185, 0.3)');
      });
      matchExpression.push('rgba(0, 0, 0, 0)'); // Default transparent fallback
      map.setPaintProperty('countries-join', 'fill-color', matchExpression as any);
    }

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
      type: 'symbol',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'pulsing-dot',
        'icon-allow-overlap': true,
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
      
      const root = createRoot(popupNode);
      flushSync(() => {
        root.render(
          <PopupContent 
            props={props} 
            coordinates={coordinates as [number, number]} 
          />
        );
      });

      new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        className: 'custom-mapbox-popup',
        maxWidth: '320px',
      })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(popupNode)
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
    <div className={`flex-1 w-full h-dvh bg-[var(--t-bg-primary)] transition-all duration-300 ease-in-out`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
