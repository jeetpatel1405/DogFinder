"use client";
import { useState, useEffect } from "react";
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
  const [breeds, setBreeds] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [hasFavorites, setHasFavorites] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
  }, []);

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
            onResultsChange={(r) => { console.log("[Home] searchResults changed", { count: r.length }); setSearchResults(r); }}
            onLoadingChange={(l) => { console.log("[Home] isSearching changed", l); setIsSearching(l); }}
          />
        </div>

        {hasFavorites && !isSearching && searchResults.length === 0 && (
          <div className="flex justify-center mt-6">
            <Link
              href="/favorites"
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              ❤️ View My Favorites
            </Link>
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <CategoryFilterBar onSelect={(cat) => setFilter(cat)} />
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
                matchScore={breed.matchScore}
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
