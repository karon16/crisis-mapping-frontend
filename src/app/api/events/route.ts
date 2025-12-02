// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import crisisData from '@/utils/crisis_events.json'; // Import the JSON directly

export async function GET() {
  // Simulate a network delay (optional, makes it feel real)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return the data as JSON
  return NextResponse.json(crisisData);
}
