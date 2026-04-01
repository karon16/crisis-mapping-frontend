'use client';

import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  eventCount: number;
  isLoading: boolean;
}

// ─── API Stub ─────────────────────────────────────────────────────
// TODO: Backend team — implement this endpoint for system status
export interface SystemStatus {
  eventCount: number;
  alertLevel: 'normal' | 'elevated' | 'critical';
  lastSync: string; // ISO timestamp
}

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  // Example future implementation:
  // const response = await axios.get('/api/system/status');
  // return response.data;
  return null;
}

// ─── UTC Clock Hook ───────────────────────────────────────────────
function useUTCClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () => {
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      ];
      const day = days[now.getUTCDay()];
      const date = now.getUTCDate().toString().padStart(2, '0');
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');

      return `${day}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds} UTC`;
    };

    setTime(format());
    const interval = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

// ─── Status Bar Component ─────────────────────────────────────────
const StatusBar: React.FC<StatusBarProps> = ({ eventCount, isLoading }) => {
  const utcTime = useUTCClock();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-1.5 bg-[#0C0A16]/80 backdrop-blur-sm border-b border-gray-800/50 text-xs select-none">
      {/* Left — Event Count */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLoading ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLoading ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </span>
        <span className="text-neutral-400 font-mono tracking-wide">
          {isLoading ? (
            'SYNCING...'
          ) : (
            <>
              <span className="text-white font-semibold">{eventCount}</span>{' '}
              ACTIVE EVENTS
            </>
          )}
        </span>
      </div>

      {/* Center — UTC Clock */}
      <div className="text-neutral-400 font-mono tracking-wider">
        {utcTime}
      </div>

      {/* Right — App Name */}
      <div className="text-neutral-500 font-mono tracking-widest text-[10px] uppercase">
        Atreides Crisis Map <span className="text-neutral-700">v0.1.0</span>
      </div>
    </div>
  );
};

export default StatusBar;
