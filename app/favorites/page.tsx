"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BreedCard from "../components/BreedCard";
import Link from "next/link";
import NavBar from "../components/NavBar";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [breeds, setBreeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and filter favorites on load
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(stored);

    const fetchFavorites = async () => {
      try {
        if (stored.length === 0) {
          setBreeds([]);
          return;
        }

        // Get all breeds
        const res = await axios.get("https://api.thedogapi.com/v1/breeds");
        const filtered = res.data.filter((b: any) => stored.includes(b.id));

        // 🔧 Fix: fetch missing images using reference_image_id
        const withImages = await Promise.all(
          filtered.map(async (breed: any) => {
            if (breed.image?.url) return breed;

            if (breed.reference_image_id) {
              try {
                const imgRes = await axios.get(
                  `https://api.thedogapi.com/v1/images/${breed.reference_image_id}`
                );
                return { ...breed, image: { url: imgRes.data.url } };
              } catch {
                return { ...breed, image: { url: "/dog-placeholder.jpg" } };
              }
            }

            return { ...breed, image: { url: "/dog-placeholder.jpg" } };
          })
        );

        setBreeds(withImages);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Remove all favorites at once
  const clearFavorites = () => {
    localStorage.removeItem("favorites");
    setFavorites([]);
    setBreeds([]);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <NavBar />
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 pt-20">
          <p className="text-gray-600 text-lg">Loading your favorite dogs... 🐾</p>
        </main>
      </>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <>
        <NavBar />
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 pt-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">No Favorites Yet 💔</h1>
          <p className="text-gray-600 mb-6">Start adding your favorite dogs to see them here!</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            🐶 Browse Breeds
          </Link>
        </main>
      </>
    );
  }

  // Display favorites
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 p-8 pt-24">
        <div className="text-center mb-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto mb-2">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-extrabold text-gray-800 flex-1">❤️ My Favorite Breeds</h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={clearFavorites}
                className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:bg-red-600 transition-all text-sm"
              >
                🗑️ Remove All
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            A list of all the adorable dogs you've added to your favorites.
          </p>
        </div>

        {/* Favorites grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {breeds.map((b) => (
            <BreedCard
              key={b.id}
              id={b.id}
              name={b.name}
              image={b.image?.url}
              temperament={b.temperament}
              weight={b.weight}
              height={b.height}
              lifespan={b.lifespan}
            />
          ))}
        </div>
      </main>
    </>
  );
}
