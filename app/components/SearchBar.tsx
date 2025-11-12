"use client";
import { useState, useRef, useCallback, useEffect } from "react";
// Debug: SearchBar module evaluated
console.log("[SearchBar] module evaluated");
import axios from "axios";
import { Loader, AlertCircle } from "lucide-react";

export interface SearchResult {
  id: number;
  name: string;
  temperament?: string;
  weight?: { imperial?: string; metric?: string };
  height?: { imperial?: string; metric?: string };
  lifespan?: string;
  breedGroup?: string;
  bredFor?: string;
  image?: { url: string };
  matchScore?: number;
}

interface SearchBarProps {
    initialQuery?: string;
    onResultsChange?: (results: SearchResult[], query?: string, traits?: any) => void;
    onLoadingChange?: (loading: boolean) => void;
    // When provided, overrides the input value. If autoSearch is true, triggers a search immediately.
    forcedQuery?: string;
    autoSearch?: boolean;
}

export default function SearchBar({ initialQuery, onResultsChange, onLoadingChange, forcedQuery, autoSearch }: SearchBarProps) {
  console.log("[SearchBar] render start", { initialQuery, forcedQuery, autoSearch });
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("[SearchBar] mounted");
    return () => console.log("[SearchBar] unmounted");
  }, []);

  // Trigger search when initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      console.log("[SearchBar] auto-triggering search from initialQuery", initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  // Respond to forcedQuery from parent: update input and optionally auto-search
  useEffect(() => {
    if (typeof forcedQuery === 'string') {
      console.log("[SearchBar] syncing forcedQuery", { forcedQuery, autoSearch });
      setQuery(forcedQuery);
      if (autoSearch && forcedQuery.trim().length > 0) {
        performSearch(forcedQuery);
      }
    }
  }, [forcedQuery, autoSearch]);

  useEffect(() => {
    console.log("[SearchBar] query changed", query);
  }, [query]);

  const performSearch = useCallback(async (searchQuery: string) => {
    console.log("[SearchBar] performSearch", { searchQuery });
    if (searchQuery.trim().length === 0) {
      setResults([]);
      setError("");
      onResultsChange?.([], "");
      console.log("[SearchBar] empty query -> cleared results");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    setError("");

    try {
      console.log("[SearchBar] sending request", { q: searchQuery });
      const response = await axios.get("/api/search", {
        params: { q: searchQuery, limit: 12 },
      });
      console.log("[SearchBar] response", { success: response.data.success, count: response.data.results?.length });

      if (response.data.success) {
        const traits = response.data.extractedTraits;
        try {
          localStorage.setItem("lastTraits", JSON.stringify(traits));
        } catch {}
        setResults(response.data.results);
        onResultsChange?.(response.data.results, searchQuery, traits);
        setIsOpen(true);
        console.log("[SearchBar] results stored", { count: response.data.results.length });
      } else {
        setError("No matches found!");
        onResultsChange?.([], searchQuery);
        console.log("[SearchBar] no matches");
      }
    } catch (err) {
      setError("Failed to search.");
      setResults([]);
      onResultsChange?.([], searchQuery);
      console.log("[SearchBar] error", err);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
      console.log("[SearchBar] done");
    }
  }, [onResultsChange, onLoadingChange]);

  const handleSearch = () => {
    console.log("[SearchBar] handleSearch", { query });
    performSearch(query);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("[SearchBar] Enter pressed");
      handleSearch();
    }
  };

  return (
    <div className="relative w-[90%] sm:w-[600px]">
      <div className="flex items-center bg-white/60 backdrop-blur-md border border-gray-300 rounded-full shadow-lg px-4 py-3 hover:shadow-xl transition-shadow gap-2">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="E.g., 'friendly small dogs' or 'energetic large breeds'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent outline-none text-gray-700 px-2 text-sm"
        />
        {loading && <Loader className="w-5 h-5 text-blue-500 animate-spin mr-2 flex-shrink-0" />}
        <button
          onClick={handleSearch}
          disabled={loading || query.trim().length === 0}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:cursor-not-allowed flex-shrink-0"
        >
          Search
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">💡 Try: "friendly small dogs", "energetic large"</p>
    </div>
  );
}
