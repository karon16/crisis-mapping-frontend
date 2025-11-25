import React, { useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FilterSection from './FilterSection';
import { ArrowRightIcon } from '@heroicons/react/20/solid'; 

// Props for FilterPanel
interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: typeof initialFilters) => void;
}

// Constants for filter options
const DISASTER_TYPES = ['Earthquake', 'Flood', 'Wildfire', 'Hurricane'];
const SEVERITIES = ['Severe Damage', 'Mild Damage', 'Little or No Damage'];
const HUMANITARIAN_CATEGORIES = [
  'Affected Individuals',
  'Rescue/Volunteering',
  'Infrastructure Damage',
  'Vehicle Damage',
];

// Constants for year range
const CURRENT_YEAR = new Date().getFullYear();
const INITIAL_YEAR = 2018;

// Generate array of years from INITIAL_YEAR to CURRENT_YEAR
const AVAILABLE_YEARS: number[] = [];
for (let y = INITIAL_YEAR; y <= CURRENT_YEAR; y++) {
  AVAILABLE_YEARS.push(y);
}

// Initial filter state
const initialFilters = {
  types: [] as string[],
  severities: [] as string[],
  humanitarian: [] as string[],
  dateRange: [INITIAL_YEAR, CURRENT_YEAR] as [number, number],
};

// FilterPanel Component
const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleToggle = useCallback((key: keyof typeof initialFilters, option: string) => {
    setFilters(prev => {
      const currentList = prev[key] as string[];
      if (currentList.includes(option)) {
        return { ...prev, [key]: currentList.filter(item => item !== option) };
      }
      return { ...prev, [key]: [...currentList, option] };
    });
  }, []);

  // Handler for changing start or end year
  const handleYearChange = useCallback((value: number, isStart: boolean) => {
    setFilters(prev => {
      const newStart = isStart ? value : prev.dateRange[0];
      const newEnd = isStart ? prev.dateRange[1] : value;

      if (newStart > newEnd) {
        return prev; 
      }
      // Update dateRange with new values
      return { ...prev, dateRange: [newStart, newEnd] };
    });
  }, []);

  // Handler for resetting filters to initial state
  const handleReset = () => {
    setFilters(initialFilters);
    onApplyFilters(initialFilters);
    onClose();
  };

  const translateClass = isOpen ? 'translate-x-0' : 'translate-x-full'; // Slide in/out based on isOpen

  return (
    // Filter Panel Container
    <div
      className={`fixed top-0 right-0 h-full w-[24rem] bg-[#0C0A16] border-l border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${translateClass} z-20`}
    >
      <div className="p-5 pb-3 flex justify-between items-center">
        <h2 className="text-md font-bold text-neutral-200">Filter Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="p-4 bg-[#191724] rounded-lg border border-neutral-800 space-y-4">
          <h3 className="text-sm font-semibold text-white  tracking-wider">Date Range</h3>

          <div className="flex items-center justify-between space-x-3">
            {/* Start Year Select */}
            <select
              value={filters.dateRange[0]}
              onChange={e => handleYearChange(parseInt(e.target.value, 10), true)}
              className="w-full p-2 bg-[#191724] border border-neutral-700 rounded-lg text-white text-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
            >
              {AVAILABLE_YEARS.map(year => (
                <option key={`start-${year}`} value={year} disabled={year > filters.dateRange[1]}>
                  {year}
                </option>
              ))}
            </select>
            {}

            <ArrowRightIcon className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
            {/* End Year Select */}
            <select
              value={filters.dateRange[1]}
              onChange={e => handleYearChange(parseInt(e.target.value, 10), false)}
              className="w-full p-2 bg-[#191724] border border-neutral-700 rounded-lg text-white text-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
            >
              {AVAILABLE_YEARS.map(year => (
                <option key={`end-${year}`} value={year} disabled={year < filters.dateRange[0]}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Disaster Type Filter Section */}
        <FilterSection
          title="Disaster Type"
          options={DISASTER_TYPES}
          selected={filters.types}
          onToggle={option => handleToggle('types', option)}
        />

        {/* Damage Severity Filter Section */}
        <FilterSection
          title="Damage Severity"
          options={SEVERITIES}
          selected={filters.severities}
          onToggle={option => handleToggle('severities', option)}
        />
        {/* Humanitarian Category Filter Section */}
        <FilterSection
          title="Humanitarian Category"
          options={HUMANITARIAN_CATEGORIES}
          selected={filters.humanitarian}
          onToggle={option => handleToggle('humanitarian', option)}
        />
      </div>
    {/* Action Buttons */}
      <div  className="p-4 flex justify-between gap-4">
        <button
          onClick={handleReset}
          className=" py-2 border border-neutral-100 text-slate-400 rounded-lg  transition-colors"
        >
          Reset Filters
        </button>
        <button
          onClick={() => onApplyFilters(filters)}
          className=" py-2 px-3 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
