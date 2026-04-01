'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Flame, Clock } from 'lucide-react';
import { CrisisEvent } from '@/types';

interface TrendingEventsBarProps {
  events: CrisisEvent[];
  onEventClick?: (event: CrisisEvent) => void;
}

// ─── Severity badge colors ───────────────────────────────────────
function severityColor(severity: string) {
  switch (severity) {
    case 'Severe Damage':
      return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171' };
    case 'Mild Damage':
      return { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' };
    case 'Little or No Damage':
      return { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', text: '#34d399' };
    default:
      return { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' };
  }
}

// ─── Category color dot ──────────────────────────────────────────
function categoryDot(category: string) {
  const map: Record<string, string> = {
    'Infrastructure Damage': '#f97316',
    'Rescue': '#3b82f6',
    'Affected Individuals': '#ec4899',
    'Missing or Found People': '#a855f7',
    'Vehicle Damage': '#eab308',
    'Caution and Advice': '#14b8a6',
    'Sympathy and Support': '#6366f1',
    'Other Relevant Information': '#64748b',
    'Not Humanitarian': '#475569',
  };
  return map[category] ?? '#64748b';
}

// ─── Trending Events Bar ─────────────────────────────────────────
const TrendingEventsBar: React.FC<TrendingEventsBarProps> = ({ events, onEventClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort by most recent (timestamp descending), take top 20
  const trendingEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.properties.informativeness === 'Informative')
      .sort((a, b) => new Date(b.properties.timestamp).getTime() - new Date(a.properties.timestamp).getTime())
      .slice(0, 10);
  }, [events]);

  // ── Scroll state detection ────────────────────────────────────
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      const ro = new ResizeObserver(updateScrollState);
      ro.observe(el);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        ro.disconnect();
      };
    }
  }, [isExpanded, trendingEvents]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // ── Time ago helper ───────────────────────────────────────────
  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (trendingEvents.length === 0) return null;

  return (
    <div
      id="trending-events-bar"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 40px))',
      }}
    >
      {/* ── Toggle Button ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <button
          id="trending-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 20px',
            background: 'linear-gradient(135deg, rgba(12,10,22,0.95), rgba(30,25,50,0.95))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            color: '#c4b5fd',
            fontSize: '11px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e9d5ff';
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#c4b5fd';
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
          }}
        >
          <Flame size={12} style={{ color: '#f97316' }} />
          Trending
          <span style={{ color: '#8b5cf6', margin: '0 2px' }}>·</span>
          <span style={{ color: '#a78bfa', fontWeight: 400 }}>{trendingEvents.length}</span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* ── Panel Content ─────────────────────────────────────── */}
      <div
        style={{
          height: '25vh',
          minHeight: '180px',
          maxHeight: '280px',
          background: 'linear-gradient(180deg, rgba(12,10,22,0.97) 0%, rgba(8,6,16,0.99) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(139,92,246,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient glow at the top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)',
          }}
        />

        {/* ── Scroll Arrows ─────────────────────────────────── */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(30,25,50,0.9)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.25)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30,25,50,0.9)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(30,25,50,0.9)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.25)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30,25,50,0.9)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Left fade */}
        {canScrollLeft && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '48px',
              background: 'linear-gradient(90deg, rgba(8,6,16,0.95), transparent)',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Right fade */}
        {canScrollRight && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '48px',
              background: 'linear-gradient(270deg, rgba(8,6,16,0.95), transparent)',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ── Cards Scrollable Area ─────────────────────────── */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '14px',
            padding: '16px 20px',
            overflowX: 'auto',
            overflowY: 'hidden',
            height: '100%',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="trending-scroll-hide"
        >
          {trendingEvents.map((event) => {
            const sev = severityColor(event.properties.damage_severity);
            const catColor = categoryDot(event.properties.humanitarian_category);
            const truncatedText =
              event.properties.tweet_text.length > 90
                ? event.properties.tweet_text.slice(0, 90) + '…'
                : event.properties.tweet_text;

            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                style={{
                  flex: '0 0 260px',
                  height: '100%',
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(30,25,50,0.6), rgba(20,18,35,0.8))',
                  border: '1px solid rgba(139,92,246,0.12)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Card Image */}
                {event.properties.image_url && (
                  <div
                    style={{
                      height: '45%',
                      minHeight: '70px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={event.properties.image_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(transparent, rgba(20,18,35,0.9))',
                      }}
                    />
                    {/* Severity badge on image */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: sev.bg,
                        border: `1px solid ${sev.border}`,
                        color: sev.text,
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {event.properties.damage_severity.replace(' Damage', '')}
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Category */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: catColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#a1a1aa',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.06em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {event.properties.humanitarian_category}
                    </span>
                  </div>

                  {/* Title / tweet text */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.4',
                      color: '#e4e4e7',
                      flex: 1,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    {truncatedText}
                  </p>

                  {/* Timestamp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: 'auto',
                    }}
                  >
                    <Clock size={10} style={{ color: '#71717a' }} />
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#71717a',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      {timeAgo(event.properties.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendingEventsBar;
