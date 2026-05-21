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
  humanitarian: string;
  type?: string;
  is_informative: boolean;
  created_at: string;
  llava_text: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`File received: ${value.name}, type: ${value.type}, size: ${value.size}`);
      } else {
        console.log(`Field ${key}: ${value}`);
      }
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://203.252.106.25:8000').trim();
    const res = await fetch(`${apiUrl}/events`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Backend responded with status ${res.status}: ${errText}`);
      throw new Error(`Backend responded with status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route POST Error:', error);
    return NextResponse.json({ error: 'Failed to submit event.', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Fix backend default limit validation bug:
    // The backend limits to <= 100 but defaults to 500 if omitted.
    if (!searchParams.has('limit')) {
      searchParams.set('limit', '500');
    }

    const queryString = searchParams.toString();
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://203.252.106.25:8000').trim();
    const backendUrl = `${apiUrl}/events${queryString ? `?${queryString}` : ''}`;

    console.log('backendUrl:', backendUrl)

    // 1. Fetch data from your running Python backend
    const res = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
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
          llava_text: event.llava_text,
          // Handle multiple comma-separated image paths from backend.
          // Split, prepend base URL to each, and rejoin.
          image_url: event.image_url
            ? event.image_url
                .split(',')
                .map((path: string) => `${apiUrl}${path.trim()}`)
                .join(',')
            : '',
          // llava_text: `AI Classification: `,
          timestamp: event.created_at,
          informativeness: event.is_informative ? 'Informative' : 'Not Informative',
          humanitarian_category: event.humanitarian,
          damage_severity: event.severity,
          location_name: event.location_name,
          type: event.type,
        },
      })),
    };

    return NextResponse.json(geoJson);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch crisis data.' }, { status: 500 });
  }
}
