import BreedCard from "./BreedCard";
// Debug: CategorySection module evaluated
console.log("[CategorySection] module evaluated");

export default function CategorySection({ title, breeds }: { title: string; breeds: any[] }) {
  console.log("[CategorySection] render", { title, count: breeds?.length });
  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {breeds.map((b) => (
          <BreedCard
            key={b.id}
            id={b.id}
            name={b.name}
            image={b.image?.url || "/dog-placeholder.jpg"}
            temperament={b.temperament}
            weight={b.weight}
            height={b.height}
            lifespan={b.lifespan}
            // matchScore={b.matchScore} 
          />
        ))}
      </div>
    </section>
  );
}
