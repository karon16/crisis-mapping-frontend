import React from 'react';

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selected, onToggle }) => (
  <div className="space-y-3 p-4 bg-[var(--t-bg-secondary)] rounded-lg border border-[var(--t-border)]">
    <h3 className="text-sm font-semibold text-[var(--t-text-primary)] tracking-wider">{title}</h3>

    <div className="flex flex-col space-y-1">
      {options.map(option => (
        <label key={option} className="flex items-center text-[var(--t-text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className="text-[var(--t-accent)] bg-[var(--t-bg-hover)] border-[var(--t-border)] rounded-full focus:ring-[var(--t-accent)]"
          />
          <span className="ml-3 text-sm">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default FilterSection;
