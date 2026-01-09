import AnimeCard from "./Animecard.jsx";

const dummyAnime = [
  { id: 1, title: "Naruto", status: "Watching" },
  { id: 2, title: "Attack on Titan", status: "Completed" },
  { id: 3, title: "One Piece", status: "Plan to Watch" },
];

export default function AnimeList() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {dummyAnime.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
