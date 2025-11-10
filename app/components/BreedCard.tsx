"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface BreedCardProps {
  id?: number;
  name: string;
  image?: string;
  temperament?: string;
}

export default function BreedCard({ id, name, image, temperament }: BreedCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (stored.includes(id)) setIsFavorite(true);
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    let updated;
    if (stored.includes(id)) {
      updated = stored.filter((f: number) => f !== id);
      setIsFavorite(false);
    } else {
      updated = [...stored, id];
      setIsFavorite(true);
    }
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (!id) return null;

  return (
    <Link href={`/breeds/${id}`}>
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 border border-white/40">
        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={image || "/dog-placeholder.jpg"}
            alt={name}
            className="w-full h-48 object-cover rounded-xl transform hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Name + Heart beside each other */}
        <div className="flex justify-center items-center gap-2 mt-3">
          <h3 className="text-lg font-semibold text-gray-800 text-center">{name}</h3>
          <button
            onClick={toggleFavorite}
            className="hover:scale-110 transition-transform"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        <p className="text-gray-500 text-sm text-center italic mt-1">
          {temperament?.split(",")[0] || "N/A"}
        </p>
      </div>
    </Link>
  );
}
