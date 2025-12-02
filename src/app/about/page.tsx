// This tells Next.js to run this code in the browser (client-side), not the server.
'use client';

// Importing tools we need:
import Link from 'next/link';
import { ArrowLeft, Cpu, Globe, ShieldAlert } from 'lucide-react';

// This is the main function that builds the About Page.
export default function AboutPage() {
  return (
    // MAIN CONTAINER
    <div className="min-h-screen bg-[#0C0A16] text-gray-300 font-sans selection:bg-purple-500 selection:text-white">
      {/* NAVIGATION BAR (Fixed at the top) */}
      <nav className="p-6 fixed w-full z-50 bg-[#0C0A16]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {/* This is the 'Back' button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
          >
            {/* The arrow icon. group-hover makes it move slightly left when you hover the text. */}
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Map
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        {/* HERO SECTION (The Big Title) */}
        <header className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Visualizing Crisis in <span className="text-purple-500">Real-Time</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
            Atreides Crisis Map leverages multimodal AI to filter social media noise and identify
            urgent needs during global disasters.
          </p>
        </header>

        {/* GRID SECTION (The 3 Cards) */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
          <Card
            icon={<Globe className="text-purple-400" />}
            title="Global Monitoring"
            desc="Tracking crisis events worldwide using real-time social media streams."
          />
          <Card
            icon={<Cpu className="text-blue-400" />}
            title="Multimodal AI"
            desc="Analyzing both text and images to classify damage severity accurately."
          />
          <Card
            icon={<ShieldAlert className="text-red-400" />}
            title="Rapid Response"
            desc="providing actionable insights for humanitarian aid and emergency services."
          />
        </div>

        {/* DETAILED CONTENT (The Text Paragraphs) */}
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
          {/* Using the 'Section' helper component for "The Problem" */}
          <Section title="The Problem">
            <p>
              Natural disasters create a chaotic stream of information. While platforms like Twitter
              (X) provide real-time updates, the data is often noisy, unstructured, and
              overwhelming. Effectively analyzing this multimodal information is critical to
              identifying affected areas and urgent needs.
            </p>
          </Section>

          {/* Using the 'Section' helper component for "Our Solution" */}
          <Section title="Our Solution">
            <p>
              This project integrates a <strong>multi-layer attention mechanism</strong> to improve
              crisis classification. By combining Vision-Language Models (CLIP) with real-time
              geolocation, we filter irrelevant posts and visualize confirmed crisis clusters on an
              interactive global map.
            </p>
          </Section>

          {/* This section lists the technologies used */}
          <Section title="Technology Stack">
            <div className="flex flex-wrap gap-3 mt-4">
              {/* This is a list (array) of tech names.*/}
              {[
                'Next.js',
                'Tailwind CSS',
                'Mapbox GL',
                'Python',
                'PyTorch',
                'CLIP',
                'FastAPI',
                'PostgreSQL',
              ].map(tech => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:border-purple-500/50 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---
// 1. The Card Component (used for the 3 grid items)
const Card = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
    <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg">{icon}</div>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

// 2. The Section Component. It takes a title and 'children' (the paragraph text you put inside it).
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  // border-l-2: Adds the purple line on the left side.
  <section className="border-l-2 border-purple-500/30 pl-6 py-2">
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <div className="text-gray-400 leading-relaxed text-lg">{children}</div>
  </section>
);
