"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// Debug: Home page module evaluated
console.log("[Home] module evaluated");
import CategoryFilterBar from "./components/CategoryFilterBar";
import SearchBar, { SearchResult } from "./components/SearchBar";
import CategorySection from "./components/CategorySection";
import BreedCard from "./components/BreedCard";
import axios from "axios";
import Link from "next/link";
import NavBar from "./components/NavBar";

export default function Home() {
  console.log("[Home] render start");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [breeds, setBreeds] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [hasFavorites, setHasFavorites] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [lastTraits, setLastTraits] = useState<{ sizes?: string[]; temperaments?: string[]; maxWeight?: number | null; minWeight?: number | null; keywordMatches?: string[] } | null>(null);
  const [forcedQuery, setForcedQuery] = useState<string | undefined>(undefined);
  const [autoSearch, setAutoSearch] = useState(false);

  // Fetch all dog breeds
  useEffect(() => {
    console.log("[Home] fetching all breeds");
    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.thedogapi.com/v1/breeds", {
          headers: { "x-api-key": process.env.NEXT_PUBLIC_DOG_API_KEY },
        });
        console.log("[Home] breeds fetched", { count: res.data?.length });
        setBreeds(res.data);
      } catch (e) {
        console.log("[Home] fetch breeds error", e);
      }
    };
    fetchData();
  }, []);

  // Check favorites in localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setHasFavorites(stored.length > 0);
    console.log("[Home] hasFavorites set", stored.length > 0);
    // restore last traits if present
    try {
      const lt = localStorage.getItem("lastTraits");
      if (lt) {
        const parsed = JSON.parse(lt);
        setLastTraits(parsed);
        console.log("[Home] restored lastTraits", parsed);
      }
    } catch {}
  }, []);

  // Read query from URL on mount and restore search state
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      console.log("[Home] restoring search from URL", { urlQuery });
      setInitialQuery(urlQuery);
    }
  }, [searchParams]);

  // Update URL when search results change
  const handleResultsChange = (r: SearchResult[], query?: string, traits?: any) => {
    console.log("[Home] searchResults changed", { count: r.length, query, traits });
    setSearchResults(r);
    if (traits) {
      setLastTraits(traits);
      try { localStorage.setItem("lastTraits", JSON.stringify(traits)); } catch {}
      // Build a canonical query using standardized CategoryFilterBar traits (for next search)
      const parts: string[] = [];
      if (Array.isArray(traits.temperaments)) {
        parts.push(...traits.temperaments.map((t: string) => t));
      }
      if (Array.isArray(traits.sizes)) {
        parts.push(...traits.sizes.map((s: string) => s));
      }
      // weight bounds
      if (typeof traits.minWeight === 'number' && traits.minWeight > 0) {
        parts.push(`at least ${traits.minWeight} lbs`);
      }
      if (typeof traits.maxWeight === 'number' && traits.maxWeight > 0) {
        parts.push(`at most ${traits.maxWeight} lbs`);
      }
      const canonical = parts.join(" ").trim();
      if (canonical.length > 0) {
        console.log("[Home] set canonical forcedQuery (no auto)", canonical);
        setForcedQuery(canonical);
        setAutoSearch(false); // don't auto-trigger; apply for next search
      }
    }
    
    // Update URL with query param
    if (query) {
      const params = new URLSearchParams(searchParams.toString());
      if (r.length > 0) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    } else if (r.length === 0) {
      // Clear query from URL when results are cleared
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      const newUrl = params.toString() ? `?${params.toString()}` : "/";
      router.push(newUrl, { scroll: false });
    }
  };

  // Filter breeds
  const filteredBreeds =
    filter === "All"
      ? breeds
      : breeds.filter((b) =>
          b.temperament?.toLowerCase().includes(filter.toLowerCase())
        );
  console.log("[Home] filteredBreeds computed", { filter, count: filteredBreeds.length });

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-pink-100">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <section className="text-center pt-24 pb-6">
        <h1 className="text-6xl font-extrabold text-gray-800 drop-shadow-sm mb-4">
          🐶 Dog<span className="text-blue-600">Finder</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Discover the perfect companion — by mood, lifestyle, or purpose.
        </p>

        {/* Search Bar */}
        <div className="flex justify-center">
          <SearchBar 
            initialQuery={initialQuery}
            onResultsChange={handleResultsChange}
            onLoadingChange={(l) => { console.log("[Home] isSearching changed", l); setIsSearching(l); }}
            forcedQuery={forcedQuery}
            autoSearch={autoSearch}
          />
        </div>

        {/* {hasFavorites && !isSearching && searchResults.length === 0 && (
          <div className="flex justify-center mt-6">
            <Link
              href="/favorites"
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              ❤️ View My Favorites
            </Link>
          </div>
        )} */}

        {searchResults.length === 0 && !isSearching && (
          <CategoryFilterBar
            categories={[
              ...(lastTraits?.temperaments?.map((t) => t.charAt(0).toUpperCase() + t.slice(1)) || []),
              ...(lastTraits?.sizes?.map((s) => s.charAt(0).toUpperCase() + s.slice(1)) || []),
              ...(lastTraits?.maxWeight ? [
                `Max ${lastTraits.maxWeight} lbs`
              ] : []),
              ...(lastTraits?.minWeight ? [
                `Min ${lastTraits.minWeight} lbs`
              ] : []),
            ]}
            onSelect={(cat) => {
              console.log('[Home] CategoryFilterBar onSelect', cat);
              setFilter(cat);
              if (cat === 'All') {
                return;
              }
              // Build new traits from lastTraits plus the selected category standardized
              const newTraits: any = {
                sizes: [...(lastTraits?.sizes || [])],
                temperaments: [...(lastTraits?.temperaments || [])],
                maxWeight: lastTraits?.maxWeight ?? null,
                minWeight: lastTraits?.minWeight ?? null,
              };
              const lc = cat.toLowerCase();
              const weightMaxMatch = lc.match(/^max\s*(\d+)\s*lbs?$/);
              const weightMinMatch = lc.match(/^min\s*(\d+)\s*lbs?$/);
              if (weightMaxMatch) {
                newTraits.maxWeight = parseInt(weightMaxMatch[1], 10);
              } else if (weightMinMatch) {
                newTraits.minWeight = parseInt(weightMinMatch[1], 10);
              } else {
                // treat as size or temperament
                const sizes = ['small','medium','large'];
                if (sizes.includes(lc)) {
                  newTraits.sizes = Array.from(new Set([...(newTraits.sizes || []), lc]));
                } else {
                  newTraits.temperaments = Array.from(new Set([...(newTraits.temperaments || []), lc]));
                }
              }
              // Save and trigger a canonical search immediately
              setLastTraits(newTraits);
              try { localStorage.setItem('lastTraits', JSON.stringify(newTraits)); } catch {}
              const parts: string[] = [];
              if (Array.isArray(newTraits.temperaments)) parts.push(...newTraits.temperaments);
              if (Array.isArray(newTraits.sizes)) parts.push(...newTraits.sizes);
              if (typeof newTraits.minWeight === 'number' && newTraits.minWeight > 0) parts.push(`at least ${newTraits.minWeight} lbs`);
              if (typeof newTraits.maxWeight === 'number' && newTraits.maxWeight > 0) parts.push(`at most ${newTraits.maxWeight} lbs`);
              const canonical = parts.join(' ').trim();
              setForcedQuery(canonical);
              setAutoSearch(true);
            }}
          />
        )}
      </section>

      {/* Search Results Display */}
      {searchResults.length > 0 && (
        <div className="max-w-7xl mx-auto p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Search Results ({searchResults.length} found)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((breed) => (
              <BreedCard
                key={breed.id}
                id={breed.id}
                name={breed.name}
                image={breed.image?.url}
                temperament={breed.temperament}
                weight={breed.weight}
                height={breed.height}
                lifespan={breed.lifespan}
                // matchScore={breed.matchScore}
              />
            ))}
          </div>
        </div>
      )}

      {/* Breed Display Section - Show when no search */}
      {searchResults.length === 0 && !isSearching && (
        <div className="max-w-7xl mx-auto p-10">
          <CategorySection
            title={`${filter} Breeds`}
            breeds={filteredBreeds.slice(0, 8)}
          />
        </div>
      )}
    </main>
  );
}
