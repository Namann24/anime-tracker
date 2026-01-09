import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrendingAnime } from "../../services/animeService";

export default function Trending() {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        async function fetch() {
            const data = await getTrendingAnime();
            setTrending(data);
        }
        fetch();
    }, []);

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                🔥 Trending Now
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {trending.map((anime) => (
                    <Link
                        to={`/anime/${anime.mal_id}`}
                        key={anime.mal_id}
                        className="min-w-[200px] snap-center group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
                    >
                        <img
                            src={anime.images.jpg.large_image_url}
                            alt={anime.title}
                            className="w-full h-[300px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{anime.title}</h3>
                            <div className="text-gray-300 text-sm mt-1">{anime.score} ⭐</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
