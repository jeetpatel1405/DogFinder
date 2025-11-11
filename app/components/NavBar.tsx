"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
// Debug: NavBar module loaded
console.log("[NavBar] module evaluated");

export default function NavBar() {
  console.log("[NavBar] render start");
  const pathname = usePathname();
  console.log("[NavBar] current pathname", pathname);

  useEffect(() => {
    console.log("[NavBar] mounted");
    return () => console.log("[NavBar] unmounted");
  }, []);

  useEffect(() => {
    console.log("[NavBar] pathname changed", pathname);
  }, [pathname]);

  return (
    <nav className="flex justify-between items-center w-full px-8 py-4 bg-white/40 backdrop-blur-md shadow-md fixed top-0 left-0 z-50">
      <Link href="/" className="text-2xl font-extrabold text-gray-800">
        🐶 Dog<span className="text-blue-600">Finder</span>
      </Link>

      <div className="flex gap-6 text-gray-700 font-medium">
        <Link
          href="/"
          className={`hover:text-blue-600 transition ${
            pathname === "/" ? "text-blue-600" : ""
          }`}
          onClick={() => console.log("[NavBar] Home link clicked")}
        >
          Home
        </Link>
        <Link
          href="/favorites"
          className={`hover:text-blue-600 transition ${
            pathname === "/favorites" ? "text-blue-600" : ""
          }`}
          onClick={() => console.log("[NavBar] Favorites link clicked")}
        >
          ❤️ Favorites
        </Link>
      </div>
    </nav>
  );
}
