"use client";
import { useState, useEffect, Suspense } from "react";
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
import AdvancedFilterBar from "./components/AdvancedFilterBar";

function HomeContent() {
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
  // Track original user-entered query (before we augment with extracted keywords)
  const [keywordBase, setKeywordBase] = useState<string>("");
  // When true, skip adding ?q=... to URL and reset path to home
  const [suppressUrlUpdate, setSuppressUrlUpdate] = useState(false);
  // Track if a search/filter was performed (true = show "no results", false = show all breeds)
  const [hasSearched, setHasSearched] = useState(false);

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
    
    // If query is provided and not empty, mark as searched
    // If query is explicitly empty string, reset to not searched
    if (query !== undefined) {
      setHasSearched(query.trim().length > 0);
    }
    
    if (query) {
      setKeywordBase(query); // remember raw user input as baseline
    }
    if (traits) {
      setLastTraits(traits);
      try { localStorage.setItem("lastTraits", JSON.stringify(traits)); } catch {}
      // Build minimal augmentation: ONLY temperament + size keywords not already present in baseline
      const baseline = (query || keywordBase || "").toLowerCase();
      const keywords: string[] = [];
      if (Array.isArray(traits.temperaments)) keywords.push(...traits.temperaments.map((t: string) => t.toLowerCase()));
      if (Array.isArray(traits.sizes)) keywords.push(...traits.sizes.map((s: string) => s.toLowerCase()));
      // Filter out any keyword already present (substring match) in baseline
      const missing = keywords.filter(k => !baseline.includes(k));
      if (missing.length > 0) {
        const augmented = ((query || keywordBase) + " " + missing.join(" ")).trim();
        console.log("[Home] setting forcedQuery with missing keywords only", { missing, augmented });
        setForcedQuery(augmented);
        setAutoSearch(false); // Do not auto search; user can refine manually
      }
    }
    
  // Update URL
  // Always reset URL to home without remounting; use replace to avoid state loss
  router.replace('/', { scroll: false });
  if (suppressUrlUpdate) setSuppressUrlUpdate(false);
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
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Navbar */}
      <NavBar />

   

      {/* Hero Section */}
      <section className="text-center pt-36 pb-6"> {/* pt-36 for filter bar space */}
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

        {/* Advanced Filter Bar below search bar */}
        <div className="flex justify-center mt-4 mb-8">
          <AdvancedFilterBar
            onApply={(query) => {
              setForcedQuery(query);
              setAutoSearch(true);
              setSuppressUrlUpdate(true);
            }}
          />
        </div>

     
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
                lifespan={(breed as any).life_span || breed.lifespan}
                // matchScore={breed.matchScore}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results Message - Show when search was performed but no results */}
      {searchResults.length === 0 && hasSearched && !isSearching && (
        <div className="max-w-7xl mx-auto p-10 text-center">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-12 border border-cyan-100">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              No breeds match your selected filters. Try adjusting your criteria or use the "Clear All" button to start over.
            </p>
          </div>
        </div>
      )}

      {/* Breed Display Section - Show when no search has been performed */}
      {searchResults.length === 0 && !hasSearched && !isSearching && (
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

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
