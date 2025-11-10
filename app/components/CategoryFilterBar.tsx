"use client";
import { useState } from "react";

interface FilterBarProps {
  onSelect: (filter: string) => void;
}

export default function CategoryFilterBar({ onSelect }: FilterBarProps) {
  const [selected, setSelected] = useState("All");
  const categories = ["All", "Playful", "Alert", "Friendly", "Active"];

  const handleClick = (cat: string) => {
    setSelected(cat);
    onSelect(cat);
  };

  return (
    <div className="flex justify-center mt-6 mb-12 space-x-3 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-5 py-2 rounded-full font-medium transition-all ${
            selected === cat
              ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md"
              : "bg-white/70 text-gray-700 hover:bg-white/90"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
