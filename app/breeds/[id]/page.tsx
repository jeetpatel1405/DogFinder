import axios from "axios";
import Link from "next/link";

export default async function BreedDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: breedId } = await params; // ✅ await required in Next.js 14

  try {
    const res = await axios.get(`https://api.thedogapi.com/v1/breeds/${breedId}`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_DOG_API_KEY },
    });
    const breed = res.data;

    let imageUrl = "/dog-placeholder.jpg";
    if (breed.reference_image_id) {
      const imgRes = await axios.get(
        `https://api.thedogapi.com/v1/images/${breed.reference_image_id}`
      );
      imageUrl = imgRes.data?.url || imageUrl;
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex flex-col items-center p-10">
        <div className="max-w-xl w-full bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/40">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>

          <div className="flex flex-col items-center text-center">
            <img
              src={imageUrl}
              alt={breed.name}
              className="rounded-2xl w-[400px] h-[350px] object-cover shadow-lg mb-6"
            />
            <h1 className="text-3xl font-extrabold text-gray-800">{breed.name}</h1>
            <p className="text-gray-500 italic mb-4">{breed.temperament || "N/A"}</p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700 text-sm">
              <p><strong>Life Span:</strong> {breed.life_span}</p>
              <p><strong>Bred For:</strong> {breed.bred_for || "N/A"}</p>
              <p><strong>Weight:</strong> {breed.weight?.metric || "N/A"} kg</p>
              <p><strong>Height:</strong> {breed.height?.metric || "N/A"} cm</p>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching breed:", error);
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600">Breed not found</h1>
        <Link href="/" className="text-blue-600 mt-4">
          ← Back
        </Link>
      </main>
    );
  }
}
