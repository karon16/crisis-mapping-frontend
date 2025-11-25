import React from 'react';

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selected, onToggle }) => (
  <div className="space-y-3 p-4 bg-[#191724] rounded-lg border border-neutral-800">
    <h3 className="text-sm font-semibold text-white  tracking-wider">{title}</h3>

    <div className="flex flex-col space-y-1">
      {options.map(option => (
        <label key={option} className="flex items-center text-gray-300 cursor-pointer ">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
            className=" text-fuchsia-600 bg-[#2f2d3b] border-neutral-700 rounded-full focus:ring-fuchsia-500"
          />
          <span className="ml-3 text-sm">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default FilterSection;
