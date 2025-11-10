"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import BreedCard from "../components/BreedCard";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [breeds, setBreeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(stored);

    const fetchFavorites = async () => {
      try {
        if (stored.length === 0) {
          setBreeds([]);
          return;
        }
        const res = await axios.get("https://api.thedogapi.com/v1/breeds");
        const filtered = res.data.filter((b: any) => stored.includes(b.id));
        setBreeds(filtered);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading your favorite dogs... 🐾</p>
      </main>
    );
  }

  if (favorites.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">No Favorites Yet 💔</h1>
        <p className="text-gray-600 mb-6">Start adding dogs you love to your favorites list!</p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all"
        >
          Browse Breeds
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">❤️ My Favorite Breeds</h1>
        <p className="text-gray-600">Your personally curated list of lovable companions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {breeds.map((b) => (
          <BreedCard
            key={b.id}
            id={b.id}
            name={b.name}
            image={b.image?.url}
            temperament={b.temperament}
          />
        ))}
      </div>
    </main>
  );
}
