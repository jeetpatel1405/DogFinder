"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
// Debug: BreedCard module evaluated
console.log("[BreedCard] module evaluated");

interface BreedCardProps {
  id?: number;
  name: string;
  image?: string;
  temperament?: string;
  weight?: { imperial?: string; metric?: string };
  height?: { imperial?: string; metric?: string };
  lifespan?: string;
  matchScore?: number;
}

export default function BreedCard({ 
  id, 
  name, 
  image, 
  temperament,
  weight,
  height,
  lifespan,
  matchScore
}: BreedCardProps) {
  console.log("[BreedCard] render", { id, name, hasImage: !!image, matchScore });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    console.log("[BreedCard] mount", { id });
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (stored.includes(id)) {
      setIsFavorite(true);
      console.log("[BreedCard] initial favorite", { id });
    }
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("[BreedCard] toggleFavorite", { id, before: isFavorite });
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    let updated;
    if (stored.includes(id)) {
      updated = stored.filter((f: number) => f !== id);
      setIsFavorite(false);
      console.log("[BreedCard] removed from favorites", { id });
    } else {
      updated = [...stored, id];
      setIsFavorite(true);
      console.log("[BreedCard] added to favorites", { id });
    }
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (!id) {
    console.log("[BreedCard] no id -> not rendering", { name });
    return null;
  }

  return (
    <Link href={`/breeds/${id}`}>
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all p-5 border border-white/40 hover:border-blue-300 h-full flex flex-col">
        {/* Image */}
        <div className="overflow-hidden rounded-xl mb-4">
          <img
            src={image || "/dog-placeholder.jpg"}
            alt={name}
            className="w-full h-48 object-cover rounded-xl transform hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Match Score Badge */}
        {/* {matchScore && (
          <div className="mb-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
              {matchScore}% match
            </span>
          </div>
        )} */}

        {/* Name + Heart */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex-1">{name}</h3>
          <button
            onClick={toggleFavorite}
            className="hover:scale-110 transition-transform flex-shrink-0"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm flex-1">
          {weight && (
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">Weight:</span> {weight.imperial || weight.metric || "N/A"}
            </p>
          )}
          {height && (
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">Height:</span> {height.imperial || height.metric || "N/A"}
            </p>
          )}
          {lifespan && (
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">Lifespan:</span> {lifespan}
            </p>
          )}
          {temperament && (
            <p className="text-gray-600 text-xs pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-700">Traits:</span> {temperament}
            </p>
          )}
        </div>

        {/* View Details Button */}
        <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-600 transition-all">
          View Details →
        </button>
      </div>
    </Link>
  );
}
