import { NextResponse } from 'next/server';

// Define the shape of the data coming from your Python backend
interface BackendEvent {
  id: number;
  text: string;
  location_name: string;
  latitude: number;
  longitude: number;
  image_url: string;
  severity: string;
  category: string;
  is_informative: boolean;
  created_at: string;
}

export async function GET() {
  try {
    // 1. Fetch data from your running Python backend
    // Ensure your backend is running on port 8000
    const res = await fetch('http://203.252.106.25:8000/events', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    const backendData: BackendEvent[] = await res.json();

    // 2. Transform into GeoJSON for Mapbox
    const geoJson = {
      type: 'FeatureCollection',
      features: backendData.map(event => ({
        type: 'Feature',
        id: event.id,
        geometry: {
          type: 'Point',
          coordinates: [event.longitude, event.latitude],
        },
        properties: {
          // Map backend fields to frontend expected properties
          tweet_text: event.text,
          // Ensure the image URL is absolute.
          // Note: You might need to adjust 'localhost' if deploying.
          image_url: `http://203.252.106.25:8000${event.image_url}`,
          // llava_text: `AI Classification: `,
          timestamp: event.created_at,
          informativeness: event.is_informative ? 'Informative' : 'Not Informative',
          humanitarian_category: event.category,
          damage_severity: event.severity,
          location_name: event.location_name,
        },
      })),
    };

    return NextResponse.json(geoJson);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch crisis data.' }, { status: 500 });
  }
}
