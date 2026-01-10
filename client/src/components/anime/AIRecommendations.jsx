import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAIRecommendations } from "../../services/animeService";
import { useWatchlist } from "../../context/WatchlistContext";

import { Flame, Brain, Sparkles, RefreshCw, Plus, Check, Info } from "lucide-react";
import SagaSkeleton from "../common/SagaSkeleton";
import SagaButton from "../common/SagaButton";

export default function AIRecommendations() {
    const { watchlist, addToWatchlist, removeFromWatchlist, loading: watchlistLoading } = useWatchlist();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState(null);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [error, setError] = useState(null);

    const isInWatchlist = (malId) => watchlist.some(a => a.mal_id === malId);

    useEffect(() => {
        if (!watchlistLoading) {
            loadRecs();
        }
    }, [watchlist.length, watchlistLoading]);

    const loadRecs = async () => {
        if (!watchlist || watchlist.length === 0) {
            setHasAttempted(true);
            return;
        }

        setLoading(true);
        setError(null);
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
                await removeFromWatchlist(existingItem._id);
            } else {
                await addToWatchlist({
                    title: anime.title,
                    mal_id: anime.mal_id,
                    images: anime.images,
                    score: anime.score,
                    episodes: anime.episodes,
                    genres: anime.genres
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddingId(null);
        }
    };

    if (!hasAttempted || watchlistLoading || (loading && recommendations.length === 0)) {
        return (
            <div className="py-16 border-b border-saga-border mb-16">
                <div className="flex items-center gap-6 mb-12 animate-pulse">
                    <div className="w-16 h-16 bg-saga-accent/10 text-saga-accent rounded-[2rem] border border-saga-accent/20 flex items-center justify-center text-3xl">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="font-shonen text-4xl text-saga-text uppercase">NEURAL SCANNING</h2>
                        <p className="text-saga-text-dim text-sm font-medium italic">Synchronizing with your soul's resonance...</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-saga-surface rounded-2xl border border-saga-border relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-saga-surface-hover to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        const isWatchlistEmpty = !watchlist || watchlist.length === 0;

        return (
            <div className="py-20 bg-saga-surface rounded-[3rem] px-12 border border-saga-border mb-24 relative overflow-hidden group/empty backdrop-blur-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-saga-accent/5 blur-[100px] rounded-full"></div>
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 bg-saga-surface border border-saga-border group-hover/empty:border-saga-accent/50 group-hover/empty:shadow-neon-red">
                        {error ? <Info className="w-10 h-10 text-red-500" /> : <Brain className="w-10 h-10 text-saga-accent" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="font-shonen text-4xl text-saga-text mb-2">
                            {error ? "SERVICE DISRUPTION" : (isWatchlistEmpty ? "UNLOCK YOUR DESTINY" : "MORE DATA REQUIRED")}
                        </h2>
                        <p className={`text-base font-medium italic ${error ? 'text-red-500/80' : 'text-saga-text-dim'}`}>
                            {error || (isWatchlistEmpty
                                ? "Add at least 3 sagas to your chronicles so our AI can learn your true resonance."
                                : "We need a bit more data about your taste. Add a few more series to prime the engine.")}
                        </p>
                    </div>
                    {!isWatchlistEmpty && (
                        <SagaButton variant="primary" onClick={loadRecs} disabled={loading} icon={<RefreshCw className={loading ? 'animate-spin' : ''} />}>
                            {loading ? "Analyzing..." : "Refresh Engine"}
                        </SagaButton>
                    )}
                    {isWatchlistEmpty && (
                        <SagaButton variant="impact" onClick={() => window.location.href = '/watchlist'}>
                            Build My List
                        </SagaButton>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-saga-accent/20 border border-saga-accent/30 text-[9px] font-black text-saga-accent rounded uppercase tracking-[0.2em] shadow-neon-red/10">Neural Analysis</span>
                        <h2 className="font-shonen text-4xl md:text-5xl text-saga-text uppercase leading-none">DESTINY DISCOVERIES</h2>
                    </div>
                    <p className="text-saga-text-dim text-sm font-medium italic">Custom chronicles predicted by the Prophecy Engine based on your watchlist.</p>
                </div>
                <SagaButton
                    variant="secondary"
                    size="sm"
                    onClick={loadRecs}
                    disabled={loading}
                    className="self-start md:self-auto"
                    icon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
                >
                    Recalibrate Neural Link
                </SagaButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5">
                {recommendations.map(anime => (
                    <div key={anime.mal_id} className="group relative">
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-saga-surface border border-saga-border relative shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-saga-accent/50 group-hover:shadow-2xl">
                            <img
                                src={anime.images?.jpg?.image_url}
                                alt={anime.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-0"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                                <div className="text-[9px] font-black text-saga-accent uppercase tracking-widest mb-1.5">{anime.genres?.[0]?.name}</div>
                                <div className="text-white text-xs font-black line-clamp-2 mb-4 leading-tight uppercase tracking-tight">{anime.title}</div>
                                {isInWatchlist(anime.mal_id) ? (
                                    <button
                                        onClick={() => handleToggleWatchlist(anime)}
                                        disabled={addingId === anime.mal_id}
                                        className="w-full py-2 bg-green-500/20 backdrop-blur-md border border-green-500/40 text-green-400 text-[9px] font-black rounded-lg hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 transition-all duration-300"
                                    >
                                        {addingId === anime.mal_id ? "..." : "✓ IN CHRONICLES"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleWatchlist(anime)}
                                        disabled={addingId === anime.mal_id}
                                        className="w-full py-2 bg-saga-accent text-white text-[9px] font-black rounded-lg hover:shadow-neon-red transition-all duration-300 active:scale-95"
                                    >
                                        {addingId === anime.mal_id ? "SYNCING..." : "+ ADD TO SAGA"}
                                    </button>
                                )}
                            </div>

                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black text-amber-400 border border-white/10">
                                ★ {anime.score}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

