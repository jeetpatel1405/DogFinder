// "use client";
// import { useState, useEffect } from "react";
// import BreedCard from "./BreedCard";
// import { AlertCircle, Loader } from "lucide-react";
// // Debug: ResultsGrid module evaluated
// console.log("[ResultsGrid] module evaluated");

// interface Breed {
// 	id: number;
// 	name: string;
// 	image?: { url: string };
// 	temperament?: string;
// 	weight?: { imperial?: string };
// 	height?: { imperial?: string };
// 	lifespan?: string;
// 	matchScore?: number;
// }

// interface ResultsGridProps {
// 	results: Breed[];
// 	loading: boolean;
// 	error?: string;
// 	query?: string;
// 	total?: number;
// }

// export default function ResultsGrid({
// 	results,
// 	loading,
// 	error,
// 	query,
// 	total,
// }: ResultsGridProps) {
// 	console.log("[ResultsGrid] render start", { loading, error, resultsCount: results.length, query, total });
// 	const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");

// 	useEffect(() => {
// 		console.log("[ResultsGrid] mounted");
// 		return () => console.log("[ResultsGrid] unmounted");
// 	}, []);

// 	useEffect(() => {
// 		console.log("[ResultsGrid] sortBy changed", sortBy);
// 	}, [sortBy]);

// 	const sortedResults = [...results].sort((a, b) => {
// 		if (sortBy === "relevance") {
// 			return (b.matchScore || 0) - (a.matchScore || 0);
// 		} else {
// 			return a.name.localeCompare(b.name);
// 		}
// 	});
// 	console.log("[ResultsGrid] sortedResults computed", { sortBy, first: sortedResults[0]?.name });

// 	if (loading) {
// 		console.log("[ResultsGrid] loading state");
// 		return (
// 			<div className="flex flex-col items-center justify-center py-12">
// 				<Loader className="w-10 h-10 text-blue-500 animate-spin mb-3" />
// 				<p className="text-gray-600 font-medium">Searching for perfect matches...</p>
// 			</div>
// 		);
// 	}

// 	if (error) {
// 		console.log("[ResultsGrid] error state", error);
// 		return (
// 			<div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
// 				<AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
// 				<div>
// 					<h3 className="font-semibold text-red-900">Search Error</h3>
// 					<p className="text-red-700 text-sm mt-1">{error}</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	if (results.length === 0) {
// 		console.log("[ResultsGrid] empty results");
// 		return (
// 			<div className="text-center py-12">
// 				<h3 className="text-xl font-semibold text-gray-700 mb-2">No breeds found</h3>
// 				<p className="text-gray-600">Try adjusting your search criteria. Here are some example queries:</p>
// 				<ul className="mt-4 space-y-2 text-sm text-gray-600">
// 					<li>• "Small friendly dogs good with kids"</li>
// 					<li>• "Large energetic breeds under 80 lbs"</li>
// 					<li>• "Calm intelligent companion dogs"</li>
// 				</ul>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="w-full">
// 			<div className="flex items-center justify-between mb-6">
// 				<div>
// 					<h2 className="text-2xl font-bold text-gray-800">
// 						{query ? `Results for "${query}"` : "Search Results"}
// 					</h2>
// 					<p className="text-sm text-gray-600 mt-1">
// 						Found <span className="font-semibold text-blue-600">{total || results.length}</span> matching breed
// 						{(total || results.length) !== 1 ? "s" : ""}
// 					</p>
// 				</div>
// 				<div className="flex items-center gap-2">
// 					<label className="text-sm font-medium text-gray-700">Sort by:</label>
// 					<select
// 						value={sortBy}
// 						onChange={(e) => {
// 							console.log("[ResultsGrid] sort changed", e.target.value);
// 							setSortBy(e.target.value as "relevance" | "name");
// 						}}
// 						className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
// 					>
// 						<option value="relevance">Relevance</option>
// 						<option value="name">Name (A-Z)</option>
// 					</select>
// 				</div>
// 			</div>
// 			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
// 				{sortedResults.map((breed) => (
// 					<div key={breed.id} className="relative">
// 						<BreedCard
// 							id={breed.id}
// 							name={breed.name}
// 							image={breed.image?.url || "/dog-placeholder.jpg"}
// 							temperament={breed.temperament}
// 						/>
// 						{breed.matchScore && breed.matchScore > 0 && (
// 							<div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
// 								{breed.matchScore}% ⭐
// 							</div>
							// <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }
