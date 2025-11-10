"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const res = await axios.get(
        `https://api.thedogapi.com/v1/breeds/search?q=${query}`
      );
      setResults(res.data.slice(0, 5)); // show top 5
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) router.push(`/breeds/${results[0].id}`);
  };

  const handleSelect = (id: number) => {
    router.push(`/breeds/${id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-[90%] sm:w-[500px]">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white/60 backdrop-blur-md border rounded-full shadow px-4 py-2"
      >
        <input
          type="text"
          placeholder="Search for a breed..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700 px-2"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-5 py-2 rounded-full font-medium"
        >
          Search
        </button>
      </form>

      {results.length > 0 && (
        <ul className="absolute z-10 mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg w-full border border-gray-100">
          {results.map((r) => (
            <li
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700"
            >
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
