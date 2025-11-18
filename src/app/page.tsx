import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function Home() {
  return (
    // flex: puts Sidebar and Map side-by-side
    // h-screen: forces the app to be exactly the height of the window
    // overflow-hidden: prevents any accidental scrollbars
    // bg-neutral-900: matches your dark theme to prevent white flashes
    <div className="flex h-screen w-full overflow-hidden bg-neutral-900 font-sans">
      <Sidebar />
      <Map />
    </div>
  );
}
