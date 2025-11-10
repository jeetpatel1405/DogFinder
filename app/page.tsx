"use client";
import { useState, useEffect } from "react";
import CategoryFilterBar from "./components/CategoryFilterBar";
import SearchBar from "./components/SearchBar";
import CategorySection from "./components/CategorySection";
import axios from "axios";
import NavBar from "./components/NavBar";

export default function Home() {
  const [breeds, setBreeds] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("https://api.thedogapi.com/v1/breeds", {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_DOG_API_KEY },
      });
      setBreeds(res.data);
    };
    fetchData();
  }, []);

  const filteredBreeds =
    filter === "All"
      ? breeds
      : breeds.filter((b) =>
          b.temperament?.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-pink-100">
      {/* Hero Section */}
      <section className="text-center pt-16">
        <h1 className="text-6xl font-extrabold text-gray-800 drop-shadow-sm mb-4">
          🐶 Dog<span className="text-blue-600">Finder</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Discover the perfect companion — by mood, lifestyle, or purpose.
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </section>

      {/* Floating Filter Bar */}
      <CategoryFilterBar onSelect={(cat) => setFilter(cat)} />

      {/* Breed Display Section */}
      <div className="max-w-7xl mx-auto p-10">
        <CategorySection title={`${filter} Breeds`} breeds={filteredBreeds.slice(0, 8)} />
      </div>
    </main>
  );
}
