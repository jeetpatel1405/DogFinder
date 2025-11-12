
import React, { useState } from "react";

// Example options; in production, fetch from API or context
const ALL_NATURES = [
  "Friendly",
  "Energetic",
  "Loyal",
  "Playful",
  "Protective",
  "Calm",
  "Intelligent",
  "Gentle",
  "Alert",
  "Affectionate",
  "Independent",
  "Outgoing",
  "Brave",
  "Adaptable",
  "Social",
  "Curious",
  "Devoted",
  "Patient",
  "Confident",
  "Sensitive",
  "Active",
  "Stubborn",
  "Obedient",
  "Docile",
  "Bold",
];
const ALL_LIFESPANS = ["6-8 yrs", "8-10 yrs", "10-12 yrs", "12-14 yrs", "14+ yrs"];
const ALL_HEIGHTS = ["< 10 in", "10-15 in", "15-20 in", "20-25 in", "> 25 in"];
const ALL_WEIGHTS = ["< 20 lbs", "20-40 lbs", "40-60 lbs", "60-80 lbs", "> 80 lbs"];



interface AdvancedFilterBarProps {
  onApply: (query: string) => void;
}

const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({ onApply }) => {
  const [selectedNatures, setSelectedNatures] = useState<string[]>([]);
  const [selectedLifespan, setSelectedLifespan] = useState<string>("");
  const [selectedHeight, setSelectedHeight] = useState<string>("");
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  
  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggle = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  // Build canonical query string with strict range formatting
  const buildQuery = () => {
    const parts: string[] = [];
    
    // Add nature/temperament filters
    if (selectedNatures.length > 0) {
      parts.push(selectedNatures.join(" "));
    }
    
    // Add lifespan filter with range format
    if (selectedLifespan) {
      // Parse lifespan range (e.g., "10-12 yrs" -> "lifespan 10-12")
      const lifespanMatch = selectedLifespan.match(/(\d+)\s*-\s*(\d+)/);
      if (lifespanMatch) {
        parts.push(`lifespan ${lifespanMatch[1]}-${lifespanMatch[2]}`);
      } else if (selectedLifespan === "14+ yrs") {
        parts.push("lifespan 14-20");
      }
    }
    
    // Add height filter - but only if weight is NOT selected (to avoid conflicts)
    // When weight is selected, it takes precedence
    if (selectedHeight && !selectedWeight) {
      // Parse height range and convert to weight bounds if needed
      // "< 10 in" -> under 20 lbs, "10-15 in" -> 20-40 lbs, etc.
      if (selectedHeight === "< 10 in") {
        parts.push("at most 20 lbs");
      } else if (selectedHeight === "10-15 in") {
        parts.push("at least 20 lbs at most 40 lbs");
      } else if (selectedHeight === "15-20 in") {
        parts.push("at least 40 lbs at most 60 lbs");
      } else if (selectedHeight === "20-25 in") {
        parts.push("at least 60 lbs at most 80 lbs");
      } else if (selectedHeight === "> 25 in") {
        parts.push("at least 80 lbs");
      }
    }
    
    // Add weight filter with strict bounds
    if (selectedWeight) {
      if (selectedWeight === "< 20 lbs") {
        parts.push("at most 20 lbs");
      } else if (selectedWeight === "20-40 lbs") {
        parts.push("at least 20 lbs at most 40 lbs");
      } else if (selectedWeight === "40-60 lbs") {
        parts.push("at least 40 lbs at most 60 lbs");
      } else if (selectedWeight === "60-80 lbs") {
        parts.push("at least 60 lbs at most 80 lbs");
      } else if (selectedWeight === "> 80 lbs") {
        parts.push("at least 80 lbs");
      }
    }
    
    return parts.filter(Boolean).join(", ");
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-cyan-50/30 shadow-lg border border-cyan-100 px-6 py-4 rounded-2xl">
      <div className="flex flex-wrap gap-4 items-end justify-center">
        {/* Nature (Temperament) */}
        <div className="flex flex-col relative">
          <label className="text-sm font-semibold text-gray-700 mb-2">Nature</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'nature' ? null : 'nature')}
            className="min-w-[140px] bg-white border-2 border-cyan-200 text-gray-700 rounded-lg px-3 py-2 text-sm shadow-sm hover:border-cyan-300 transition-colors text-left flex justify-between items-center"
          >
            <span>{selectedNatures.length > 0 ? `${selectedNatures.length} selected` : 'Select Nature'}</span>
            <span className="ml-2">▼</span>
          </button>
          {openDropdown === 'nature' && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-cyan-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {ALL_NATURES.map(nature => (
                <label key={nature} className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNatures.includes(nature)}
                    onChange={() => toggle(nature, selectedNatures, setSelectedNatures)}
                    className="rounded text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-900">{nature}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Lifespan */}
        <div className="flex flex-col relative">
          <label className="text-sm font-semibold text-gray-700 mb-2">Lifespan</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'lifespan' ? null : 'lifespan')}
            className="min-w-[120px] bg-white border-2 border-cyan-200 text-gray-700 rounded-lg px-3 py-2 text-sm shadow-sm hover:border-cyan-300 transition-colors text-left flex justify-between items-center"
          >
            <span>{selectedLifespan || 'Select Lifespan'}</span>
            <span className="ml-2">▼</span>
          </button>
          {openDropdown === 'lifespan' && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-cyan-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {ALL_LIFESPANS.map(life => (
                <label key={life} className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-50 cursor-pointer">
                  <input
                    type="radio"
                    name="lifespan"
                    checked={selectedLifespan === life}
                    onChange={() => {
                      setSelectedLifespan(life);
                      setOpenDropdown(null);
                    }}
                    className="text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-900">{life}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Height */}
        <div className="flex flex-col relative">
          <label className="text-sm font-semibold text-gray-700 mb-2">Height</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'height' ? null : 'height')}
            className="min-w-[120px] bg-white border-2 border-cyan-200 text-gray-700 rounded-lg px-3 py-2 text-sm shadow-sm hover:border-cyan-300 transition-colors text-left flex justify-between items-center"
          >
            <span>{selectedHeight || 'Select Height'}</span>
            <span className="ml-2">▼</span>
          </button>
          {openDropdown === 'height' && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-cyan-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {ALL_HEIGHTS.map(height => (
                <label key={height} className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-50 cursor-pointer">
                  <input
                    type="radio"
                    name="height"
                    checked={selectedHeight === height}
                    onChange={() => {
                      setSelectedHeight(height);
                      setOpenDropdown(null);
                    }}
                    className="text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-900">{height}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Weight */}
        <div className="flex flex-col relative">
          <label className="text-sm font-semibold text-gray-700 mb-2">Weight</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'weight' ? null : 'weight')}
            className="min-w-[120px] bg-white border-2 border-cyan-200 text-gray-700 rounded-lg px-3 py-2 text-sm shadow-sm hover:border-cyan-300 transition-colors text-left flex justify-between items-center"
          >
            <span>{selectedWeight || 'Select Weight'}</span>
            <span className="ml-2">▼</span>
          </button>
          {openDropdown === 'weight' && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-cyan-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {ALL_WEIGHTS.map(weight => (
                <label key={weight} className="flex items-center gap-2 px-3 py-2 hover:bg-cyan-50 cursor-pointer">
                  <input
                    type="radio"
                    name="weight"
                    checked={selectedWeight === weight}
                    onChange={() => {
                      setSelectedWeight(weight);
                      setOpenDropdown(null);
                    }}
                    className="text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-900">{weight}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Apply Button */}
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl transition-all transform hover:scale-105"
          onClick={() => onApply(buildQuery())}
        >
          Apply Filters
        </button>
        
        {/* Clear Button */}
        <button
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-gray-500 hover:to-gray-600 hover:shadow-xl transition-all transform hover:scale-105"
          onClick={() => {
            setSelectedNatures([]);
            setSelectedLifespan("");
            setSelectedHeight("");
            setSelectedWeight("");
            setOpenDropdown(null);
            onApply("");
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
export { AdvancedFilterBar };
export default AdvancedFilterBar;
