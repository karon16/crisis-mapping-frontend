import React from 'react';
import { CalendarIcon, MapPinIcon, ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PopupContentProps {
  props: any;
  coordinates: number[];
}

export const PopupContent: React.FC<PopupContentProps> = ({ props, coordinates }) => {
  const imageUrlsStr = props.image_urls || '';
  const images = imageUrlsStr ? imageUrlsStr.split(',').map((u: string) => u.trim()).filter(Boolean) : [];

  const formattedDate = props.timestamp 
    ? new Date(props.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : 'Date Unknown';

  const severityColor = () => {
    switch(props.damage_severity) {
      case 'Severe Damage': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Mild Damage': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Little or No Damage': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-[var(--t-bg-secondary)] text-[var(--t-text-secondary)] border-[var(--t-border)]';
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans w-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[var(--t-text-primary)] leading-tight m-0">
          {props.title || 'Crisis Event'}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-[var(--t-text-muted)] mt-1">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-[var(--t-text-muted)] mt-0.5">
          <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {props.informativeness && props.informativeness.toLowerCase() !== 'unknown' && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[var(--t-accent-subtle)] text-[var(--t-accent-text)] border border-[var(--t-accent-subtle)]">
            {props.informativeness}
          </span>
        )}
        {props.humanitarian_category && props.humanitarian_category.toLowerCase() !== 'unknown' && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[var(--t-bg-hover)] text-[var(--t-text-secondary)] border border-[var(--t-border)]">
            {props.humanitarian_category}
          </span>
        )}
        {props.damage_severity && props.damage_severity.toLowerCase() !== 'unknown' && (
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${severityColor()}`}>
            {props.damage_severity}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="text-sm text-[var(--t-text-secondary)] leading-relaxed bg-[var(--t-bg-secondary)] p-2.5 rounded-lg border border-[var(--t-border-subtle)]">
        {props.tweet_text || 'No description available for this event.'}
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className={`grid gap-1.5 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((url: string, idx: number) => (
            <div key={idx} className="relative aspect-video rounded-md overflow-hidden bg-[var(--t-bg-hover)] border border-[var(--t-border-subtle)] group">
              <img 
                src={url} 
                alt={`Evidence ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action / Link */}
      <div className="pt-2 border-t border-[var(--t-border-subtle)] flex items-center justify-between">
        <a 
          href={`https://google.com/search?q=${encodeURIComponent(props.tweet_text || "crisis")}`} 
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-[var(--t-accent-text)] hover:text-[var(--t-accent-hover)] transition-colors flex items-center gap-1"
        >
          <span>Search related info</span>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
