import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://203.252.106.25:8000';
    const res = await fetch(`${apiUrl}/simulation/stream`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Simulation Stream Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch simulation data.' }, { status: 500 });
  }
}
