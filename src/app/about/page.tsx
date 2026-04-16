'use client';

import Link from 'next/link';
import { ArrowLeft, Cpu, Globe, ShieldAlert } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--t-bg-primary)] text-[var(--t-text-primary)] font-sans selection:bg-[var(--t-accent)] selection:text-white theme-transition">
      <nav 
        className="p-6 fixed w-full z-50 backdrop-blur-md border-b border-[var(--t-border)] theme-transition"
        style={{ backgroundColor: 'color-mix(in srgb, var(--t-bg-primary) 80%, transparent)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--t-text-secondary)] hover:text-[var(--t-text-primary)] transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Map
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        <header className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--t-text-primary)] mb-6 tracking-tight">
            Visualizing Crisis in <span className="text-[var(--t-accent)]">Real-Time</span>
          </h1>
          <p className="text-xl text-[var(--t-text-secondary)] leading-relaxed max-w-2xl">
            Atreides Crisis Map leverages multimodal AI to filter social media noise and identify
            urgent needs during global disasters.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
          <Card
            icon={<Globe className="text-[var(--t-accent)]" />}
            title="Global Monitoring"
            desc="Tracking crisis events worldwide using real-time social media streams."
          />
          <Card
            icon={<Cpu className="text-[var(--t-status-ok)]" />}
            title="Multimodal AI"
            desc="Analyzing both text and images to classify damage severity accurately."
          />
          <Card
            icon={<ShieldAlert className="text-[var(--t-status-warn)]" />}
            title="Rapid Response"
            desc="Providing actionable insights for humanitarian aid and emergency services."
          />
        </div>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
          <Section title="The Problem">
            <p>
              Natural disasters create a chaotic stream of information. While platforms like Twitter
              (X) provide real-time updates, the data is often noisy, unstructured, and
              overwhelming. Effectively analyzing this multimodal information is critical to
              identifying affected areas and urgent needs.
            </p>
          </Section>

          <Section title="Our Solution">
            <p>
              This project integrates a <strong>multi-layer attention mechanism</strong> to improve
              crisis classification. By combining Vision-Language Models (CLIP) with real-time
              geolocation, we filter irrelevant posts and visualize confirmed crisis clusters on an
              interactive global map.
            </p>
          </Section>

          <Section title="Technology Stack">
            <div className="flex flex-wrap gap-3 mt-4">
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
                  className="px-3 py-1 bg-[var(--t-bg-secondary)] border border-[var(--t-border)] rounded-full text-sm text-[var(--t-text-secondary)] hover:border-[var(--t-accent)] transition-colors cursor-default"
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

const Card = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="p-6 bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-2xl hover:bg-[var(--t-bg-hover)] transition-colors">
    <div className="mb-4 p-3 bg-[var(--t-bg-secondary)] w-fit rounded-lg">{icon}</div>
    <h3 className="text-[var(--t-text-primary)] font-semibold text-lg mb-2">{title}</h3>
    <p className="text-[var(--t-text-secondary)] text-sm leading-relaxed">{desc}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-l-2 border-[var(--t-accent)] pl-6 py-2">
    <h2 className="text-2xl font-bold text-[var(--t-text-primary)] mb-4">{title}</h2>
    <div className="text-[var(--t-text-secondary)] leading-relaxed text-lg">{children}</div>
  </section>
);
