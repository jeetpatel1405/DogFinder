"use client";
import { useState, useEffect } from "react";
// Debug: CategoryFilterBar module evaluated
console.log("[CategoryFilterBar] module evaluated");

interface FilterBarProps {
  onSelect: (filter: string) => void;
  categories?: string[];
}

export default function CategoryFilterBar({ onSelect, categories: categoriesProp }: FilterBarProps) {
  console.log("[CategoryFilterBar] render start");
  const [selected, setSelected] = useState("All");
  const categories = categoriesProp && categoriesProp.length > 0
    ? ["All", ...Array.from(new Set(categoriesProp.map(c => c.trim()).filter(Boolean)))]
    : ["All", "Playful", "Alert", "Friendly", "Active"];

  useEffect(() => {
    console.log("[CategoryFilterBar] mounted");
    return () => console.log("[CategoryFilterBar] unmounted");
  }, []);

  useEffect(() => {
    console.log("[CategoryFilterBar] selected changed", selected);
  }, [selected]);

  const handleClick = (cat: string) => {
    console.log("[CategoryFilterBar] handleClick", { cat });
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
