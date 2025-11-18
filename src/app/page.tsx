import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-san">
      <Sidebar />
      <Map />
    </div>
  );
}
