import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAIRecommendations } from "../../services/animeService";
import { useWatchlist } from "../../context/WatchlistContext";
import { addWatchlist, deleteWatchlist } from "../../services/watchlistService";

export default function AIRecommendations() {
    const { watchlist, addToLocalWatchlist, removeFromLocalWatchlist, loading: watchlistLoading } = useWatchlist();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState(null);
    const [hasAttempted, setHasAttempted] = useState(false);

    const isInWatchlist = (malId) => watchlist.some(a => a.mal_id === malId);

    useEffect(() => {
        // Only attempt if not already loading and we have a watchlist (even if empty, but after watchlistLoading is false)
        if (!watchlistLoading) {
            loadRecs();
        }
    }, [watchlist.length, watchlistLoading]);

    const [error, setError] = useState(null);

    const loadRecs = async () => {
        if (!watchlist || watchlist.length === 0) {
            setHasAttempted(true);
            return;
        }

        setLoading(true);
        setError(null);
        // Clear previous recommendations to show skeleton state during refresh
        setRecommendations([]);

        try {
            const data = await getAIRecommendations(watchlist);
            setRecommendations(data || []);
        } catch (err) {
            console.error("Failed to load AI recommendations", err);
            if (err.response?.status === 429) {
                setError("Database is a bit busy (Rate Limit). Please try again in 30 seconds.");
            } else {
                setError("Something went wrong while analyzing your taste.");
            }
        } finally {
            setLoading(false);
            setHasAttempted(true);
        }
    };

    const handleToggleWatchlist = async (anime) => {
        setAddingId(anime.mal_id);
        const existingItem = watchlist.find(a => a.mal_id === anime.mal_id);

        try {
            if (existingItem) {
                // Remove
                await deleteWatchlist(existingItem._id);
                removeFromLocalWatchlist(existingItem._id);
            } else {
                // Add
                const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
                const res = await addWatchlist({
                    title: anime.title,
                    image,
                    mal_id: anime.mal_id,
                    genres: anime.genres?.map(g => g.name) || [],
                    score: anime.score || 0,
                    totalEpisodes: anime.episodes || 12,
                    totalSeasons: anime.seasons || 1,
                });
                addToLocalWatchlist(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddingId(null);
        }
    };

    if (!hasAttempted || watchlistLoading || (loading && recommendations.length === 0)) {
        return (
            <div className="py-12 border-b border-gray-100 dark:border-gray-900 mb-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 rounded-2xl flex items-center justify-center animate-pulse text-2xl">🤖</div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">AI is Thinking...</h2>
                        <p className="text-gray-500 text-sm">Scanning your taste to find perfect matches.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        // Only show if we explicitly have a watchlist but no recs could be generated or watchlist is empty
        const isWatchlistEmpty = !watchlist || watchlist.length === 0;

        return (
            <div className="py-12 bg-gray-50 dark:bg-gray-900/40 rounded-3xl px-8 border border-gray-100 dark:border-gray-800 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors ${error ? 'bg-red-500/10 text-red-500' : 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600'}`}>
                        {error ? '🔌' : '🤖'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {error ? "Service Temporarily Busy" : (isWatchlistEmpty ? "Unlock AI Recommendations" : "More Data Needed")}
                        </h2>
                        <p className={`text-sm max-w-md ${error ? 'text-red-500/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {error || (isWatchlistEmpty
                                ? "Add at least 3 anime to your watchlist so our AI can learn your taste."
                                : "We need a bit more data about your taste, or Jikan is slow today. Try adding a few more series!")}
                        </p>
                    </div>
                    {!isWatchlistEmpty && (
                        <button
                            onClick={loadRecs}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <span className={loading ? 'animate-spin' : ''}>✨</span>
                            {loading ? "Analyzing..." : "Try Refresh"}
                        </button>
                    )}
                    {isWatchlistEmpty && (
                        <Link to="/watchlist" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                            Build My List
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded uppercase tracking-widest">AI Powered</span>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Recommendations For You</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Based on the genres you love most.</p>
                </div>
                <button
                    onClick={loadRecs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-all active:scale-95 group/btn disabled:opacity-50"
                    title="Refresh Recommendations"
                >
                    <span className={`transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180'}`}>✨</span>
                    <span className="text-xs uppercase tracking-wider">Shuffle AI</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {recommendations.map(anime => (
                    <div key={anime.mal_id} className="group relative">
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 relative shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                            <img
                                src={anime.images?.jpg?.image_url}
                                alt={anime.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <div className="text-[10px] font-bold text-blue-400 mb-1">{anime.genres?.[0]?.name}</div>
                                <div className="text-white text-xs font-bold line-clamp-2 mb-3">{anime.title}</div>
                                {isInWatchlist(anime.mal_id) ? (
                                    <button
                                        onClick={() => handleToggleWatchlist(anime)}
                                        disabled={addingId === anime.mal_id}
                                        className="w-full py-2 bg-green-500/20 backdrop-blur-md border border-green-500/40 text-green-400 text-[10px] font-black rounded-lg hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 transition-all duration-300"
                                    >
                                        {addingId === anime.mal_id ? "..." : "✓ ADDED TO LIST"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleWatchlist(anime)}
                                        disabled={addingId === anime.mal_id}
                                        className="w-full py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {addingId === anime.mal_id ? "ADDING..." : "+ ADD TO LIST"}
                                    </button>
                                )}
                            </div>

                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400">
                                ★ {anime.score}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
