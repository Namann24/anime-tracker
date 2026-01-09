export default function AnimeCard({ anime }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h3 className="font-semibold text-lg">{anime.title}</h3>
      <p className="text-gray-600 text-sm">Status: {anime.status}</p>
    </div>
  );
}
