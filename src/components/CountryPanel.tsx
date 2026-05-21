'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, UserGroupIcon, BuildingLibraryIcon, MapIcon, CurrencyDollarIcon, LanguageIcon, ClockIcon, ExclamationTriangleIcon, NewspaperIcon } from '@heroicons/react/24/solid';
import { CrisisEvent } from '@/types';
import wc from 'which-country';

interface CountryData {
  flags: { png: string; svg: string; alt?: string };
  name: { common: string; official: string };
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  area?: number;
  timezones?: string[];
  maps?: { googleMaps: string; openStreetMaps: string };
}

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface CountryPanelProps {
  isoCode: string | null;
  onClose: () => void;
  events: CrisisEvent[];
}

export default function CountryPanel({ isoCode, onClose, events }: CountryPanelProps) {
  const [country, setCountry] = useState<CountryData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  // Filter live crisis events that belong to this country
  const localEvents = useMemo(() => {
    if (!isoCode || !events) return [];
    return events.filter(e => {
      const coords = e.geometry.coordinates;
      return wc([coords[0], coords[1]]) === isoCode;
    });
  }, [isoCode, events]);

  const eventTypesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    localEvents.forEach(e => {
      const type = e.properties?.humanitarian_category || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [localEvents]);

  const hasHighSeverity = localEvents.some(e => e.properties?.damage_severity === 'Severe Damage');

  useEffect(() => {
    if (!isoCode) {
      setCountry(null);
      setNews([]);
      return;
    }

    const fetchCountryData = async () => {
      setLoading(true);
      setNewsLoading(true);
      try {
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}?fields=name,cca3,capital,population,region,subregion,flags,currencies,languages,area,timezones,maps`);
        if (!res.ok) {
          setCountry(null);
          setNews([]);
          return;
        }
        const data: CountryData = await res.json();
        setCountry(data);

        // Fetch Google News for this country
        fetchNews(data.name.common);

      } catch (err) {
        console.error('Error fetching country data', err);
        setCountry(null);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchNews = async (countryName: string) => {
      try {
        const newsRes = await fetch(`/api/news?country=${encodeURIComponent(countryName)}`);
        if (newsRes.ok) {
          const articles = await newsRes.json();
          setNews(articles);
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Error fetching news', err);
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchCountryData();
  }, [isoCode]);

  const translateClass = isoCode ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-[var(--t-bg-primary)] border-l border-[var(--t-border)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${translateClass} z-30 theme-transition`}
    >
      {/* Compact Top Header with Flag */}
      <div className="p-4 pt-6 flex justify-between items-center border-b border-[var(--t-border)] bg-[var(--t-bg-secondary)] shadow-sm relative">
        <div className="flex items-center gap-4">
          {country ? (
            <img
              src={country.flags.svg}
              alt={country.flags.alt || `Flag of ${country.name.common}`}
              className="w-12 h-8 rounded-sm shadow-sm border border-[var(--t-border)] object-cover"
            />
          ) : (
            <div className="w-12 h-8 rounded-sm bg-[var(--t-bg-elevated)] animate-pulse" />
          )}
          <div>
            <h2 className="text-xl font-black text-[var(--t-text-primary)] leading-tight">
              {country ? country.name.common : 'Loading...'}
            </h2>
            <p className="text-xs text-[var(--t-text-muted)] font-medium">
              {country ? country.name.official : 'Fetching Intelligence'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--t-text-muted)] hover:text-[var(--t-accent-text)] transition-colors p-2 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--t-accent)]"></div>
          </div>
        ) : country ? (
          <>
            {/* Active Local Crises */}
            {localEvents.length > 0 && (
              <div className={`p-4 rounded-xl border shadow-sm ${hasHighSeverity ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--t-accent-subtle)] border-[var(--t-accent)]/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <ExclamationTriangleIcon className={`w-6 h-6 ${hasHighSeverity ? 'text-red-500' : 'text-[var(--t-accent)]'}`} />
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${hasHighSeverity ? 'text-red-500' : 'text-[var(--t-accent)]'}`}>
                    Active Local Crises
                  </h4>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-black text-[var(--t-text-primary)]">
                    {localEvents.length}
                  </div>
                  <div className="text-right">
                    {Object.entries(eventTypesCount).map(([type, count]) => (
                      <div key={type} className="text-sm font-medium text-[var(--t-text-secondary)]">
                        {count} {type}(s)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Situation Reports (Google News) */}
            <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[var(--t-text-primary)]">
                  <NewspaperIcon className="w-5 h-5 text-[var(--t-accent)]" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Live Situation Reports</h4>
                </div>
                {newsLoading && <div className="w-4 h-4 border-2 border-t-[var(--t-accent)] border-gray-300 rounded-full animate-spin"></div>}
              </div>
              
              <div className="space-y-4">
                {newsLoading ? (
                  <div className="text-sm text-[var(--t-text-muted)] italic">Scraping latest news...</div>
                ) : news && news.length > 0 ? (
                  news.map((article, index) => (
                    <a 
                      key={index} 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h5 className="text-sm font-bold text-[var(--t-text-primary)] group-hover:text-[var(--t-accent)] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--t-text-muted)] font-medium">
                        <span>{new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-sm text-[var(--t-text-muted)] italic">No recent crisis reports found.</div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <UserGroupIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Population</span>
                </div>
                <span className="text-lg font-bold text-[var(--t-text-primary)]">
                  {country.population.toLocaleString()}
                </span>
              </div>
              
              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <BuildingLibraryIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Capital</span>
                </div>
                <span className="text-lg font-bold text-[var(--t-text-primary)]">
                  {country.capital ? country.capital.join(', ') : 'None'}
                </span>
              </div>

              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Currency</span>
                </div>
                <span className="text-sm font-bold text-[var(--t-text-primary)] leading-tight">
                  {country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A'}
                </span>
              </div>

              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <LanguageIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Languages</span>
                </div>
                <span className="text-sm font-bold text-[var(--t-text-primary)] leading-tight line-clamp-2">
                  {country.languages ? Object.values(country.languages).join(', ') : 'N/A'}
                </span>
              </div>

              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <MapIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Area</span>
                </div>
                <span className="text-lg font-bold text-[var(--t-text-primary)]">
                  {country.area ? `${country.area.toLocaleString()} km²` : 'N/A'}
                </span>
              </div>

              <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[var(--t-accent-text)]">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--t-text-muted)]">Timezones</span>
                </div>
                <span className="text-sm font-bold text-[var(--t-text-primary)] line-clamp-2">
                  {country.timezones ? country.timezones.join(', ') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Geography & Map Links */}
            <div className="bg-[var(--t-bg-secondary)] p-4 rounded-xl border border-[var(--t-border)] shadow-sm space-y-4">
              <div>
                <h4 className="text-xs text-[var(--t-text-muted)] uppercase tracking-wider font-semibold mb-1">
                  Region & Subregion
                </h4>
                <p className="text-sm font-bold text-[var(--t-text-primary)]">
                  {country.region} {country.subregion ? `> ${country.subregion}` : ''}
                </p>
              </div>
              
              {country.maps && (
                <div className="pt-2 border-t border-[var(--t-border)]">
                  <a 
                    href={country.maps.googleMaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 bg-[var(--t-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--t-accent-hover)] transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-[var(--t-text-muted)] pt-10">
            No country data found for {isoCode}.
          </div>
        )}
      </div>
    </div>
  );
}
