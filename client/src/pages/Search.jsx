import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAnime, getAnimeGenres } from "../services/animeService";
import { useWatchlist } from "../context/WatchlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaSelect from "../components/common/SagaSelect";
import SagaImage from "../components/common/SagaImage";
import SagaSkeleton from "../components/common/SagaSkeleton";
import BottomSheet from "../components/common/BottomSheet";
import { RefreshCw } from "lucide-react";

export default function Search() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const { addToWatchlist, removeFromWatchlist, watchlist, showNSFW } = useWatchlist();
    const { refreshNotifications } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const [addingId, setAddingId] = useState(null);
    const [discoveryLabel, setDiscoveryLabel] = useState("🔥 Trending Discovery");
    const [reminders, setReminders] = useState(new Set()); // Track which anime have reminders

    const query = searchParams.get("q") || "";
    const selectedGenre = searchParams.get("genre") || "";
    const sortBy = searchParams.get("sort") || (query ? "relevance" : "popularity");
    const statusFilter = searchParams.get("status") || "";
    const selectedYear = searchParams.get("year") || "";

    useEffect(() => {
        async function loadGenres() {
            try {
                const data = await getAnimeGenres();
                setGenres(data || []);
            } catch (err) {
                console.error("Failed to load genres", err);
            }
        }
        loadGenres();
    }, []);

    const performSearch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const trimmedQuery = (query || "").trim();
            const hasActiveFilters = trimmedQuery || selectedGenre || statusFilter || selectedYear;
            let data;

            if (hasActiveFilters) {
                // If we have a query, use the general search
                if (trimmedQuery) {
                    const currentSort = searchParams.get("sort") || "relevance";
                    const options = {
                        genres: selectedGenre,
                        order_by: currentSort,
                        sort: "desc",
                        status: statusFilter,
                        year: selectedYear
                    };
                    data = await searchAnime(trimmedQuery, options);

                    // Client-side strict filter for upcoming
                    if (statusFilter === "upcoming" && Array.isArray(data)) {
                        data = data.filter(a => a.status?.toLowerCase().includes("not yet") || a.status?.toLowerCase().includes("upcoming"));
                    }
                }
                // If no query but status=upcoming, use the top endpoint for accuracy
                else if (statusFilter === "upcoming" && !selectedGenre && !selectedYear) {
                    const { getUpcomingAnime } = await import("../services/animeService");
                    data = await getUpcomingAnime(24);
                    setDiscoveryLabel("🗓️ Highly Anticipated");
                }
                // If no query but status=airing, use top airing
                else if (statusFilter === "airing" && !selectedGenre && !selectedYear) {
                    const { getAiringAnime } = await import("../services/animeService");
                    data = await getAiringAnime(24);
                    setDiscoveryLabel("📺 Currently Airing");
                }
                // Otherwise fallback to general search with options
                else {
                    const options = {
                        genres: selectedGenre,
                        order_by: sortBy,
                        sort: "desc",
                        status: statusFilter,
                        year: selectedYear
                    };
                    data = await searchAnime("", options);
                }
            } else {
                const discoveryFilters = [
                    { id: "airing", label: "Currently Airing", emoji: "📺" },
                    { id: "upcoming", label: "Highly Anticipated", emoji: "🗓️" },
                    { id: "bypopularity", label: "Most Popular", emoji: "🔥" },
                    { id: "favorite", label: "All-Time Favorites", emoji: "❤️" }
                ];
                const random = discoveryFilters[Math.floor(Math.random() * discoveryFilters.length)];
                setDiscoveryLabel(`${random.emoji} ${random.label}`);
                const res = await fetch(`https://api.jikan.moe/v4/top/anime?limit=24&filter=${random.id}`);
                const json = await res.json();
                data = json.data;
            }
            // Deduplicate results by mal_id
            if (Array.isArray(data)) {
                data = [...new Map(data.map(item => [item.mal_id, item])).values()];
            }
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Search failed", err);
            setError(err.response?.status === 429 ? "Jikan API is busy. Please wait." : "Unable to reach archive.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, selectedGenre, sortBy, statusFilter, selectedYear]);

    useEffect(() => {
        const handler = setTimeout(() => performSearch(), query ? 600 : 0);
        return () => clearTimeout(handler);
    }, [query, selectedGenre, sortBy, statusFilter, selectedYear, performSearch]);

    // Check for existing reminders when results load
    useEffect(() => {
        const checkReminders = async () => {
            if (!user || results.length === 0) return;

            const { checkReminder } = await import("../services/notificationService");

            // Check first item to verify auth validity before spamming network
            try {
                await checkReminder(results[0].mal_id);
            } catch (err) {
                if (err.response?.status === 401) return; // Stop if auth is invalid
            }

            const reminderChecks = results.map(async (anime) => {
                try {
                    const res = await checkReminder(anime.mal_id);
                    return { malId: anime.mal_id, exists: res.data.exists };
                } catch (err) {
                    return { malId: anime.mal_id, exists: false };
                }
            });

            const checks = await Promise.all(reminderChecks);
            const newReminders = new Set();
            checks.forEach(({ malId, exists }) => {
                if (exists) newReminders.add(malId);
            });
            setReminders(newReminders);
        };

        checkReminders();
    }, [results, user]);

    const updateFilters = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        value ? newParams.set(key, value) : newParams.delete(key);
        setSearchParams(newParams);
    };

    const handleToggleWatchlist = async (anime) => {
        if (!user || addingId === anime.mal_id) return;
        const isUpcoming = anime.status?.toLowerCase().includes("not yet") || anime.status?.toLowerCase().includes("upcoming");

        if (isUpcoming) {
            setAddingId(anime.mal_id);
            try {
                const hasReminder = reminders.has(anime.mal_id);

                if (hasReminder) {
                    // Remove reminder
                    const { deleteReminder } = await import("../services/notificationService");
                    await deleteReminder(anime.mal_id);
                    setReminders(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(anime.mal_id);
                        return newSet;
                    });
                    refreshNotifications(); // Update notification count immediately
                    showToast(`Reminder removed for ${anime.title}`, 'success');
                } else {
                    // Create reminder
                    const { createNotification } = await import("../services/notificationService");
                    await createNotification({
                        type: "reminder",
                        message: `Reminder set for ${anime.title}. We'll notify you when it starts airing!`,
                        link: `/anime/${anime.mal_id}`,
                        animeId: anime.mal_id.toString()
                    });
                    setReminders(prev => new Set([...prev, anime.mal_id]));
                    refreshNotifications(); // Update notification count immediately
                    showToast(`Tactical Reminder Set: ${anime.title}`, 'success');
                }
            } catch (err) {
                console.error(err);
                if (err.response?.data?.exists) {
                    showToast("Reminder already exists for this anime", 'error');
                } else {
                    showToast("Failed to link Neural Sync.", 'error');
                }
            } finally {
                setAddingId(null);
            }
            return;
        }

        const existingItem = watchlist.find(a => a.mal_id === anime.mal_id);
        const action = existingItem ? "Removed from" : "Added to";

        setAddingId(anime.mal_id);
        try {
            if (existingItem) {
                await removeFromWatchlist(existingItem._id || existingItem.mal_id);
            } else {
                await addToWatchlist({
                    title: anime.title,
                    mal_id: anime.mal_id,
                    images: anime.images, // Pass full images object as context handles mapping
                    genres: anime.genres,
                    score: anime.score,
                    episodes: anime.episodes
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddingId(null);
        }
    };

    const isInWatchlist = (malId) => watchlist.some(a => a.mal_id === malId);

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="min-h-screen pb-24 overflow-x-hidden transition-colors duration-500 saga-animate-in">
            {/* SEARCH HERO */}
            <div className="pt-24 md:pt-32 pb-6 relative border-b border-[var(--saga-border)] z-[20]">
                {/* Background FX */}
                <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--saga-accent)]/5 to-transparent pointer-events-none"></div>

                <div className="layout-shell relative z-10 section-stack">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-neon-red"></span>
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em]">Archive Protocol</span>
                            </div>
                            <h1 className="text-shonen-bold text-5xl md:text-8xl tracking-tight uppercase leading-none text-[var(--saga-text)] text-glow">
                                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Sagas</span>
                            </h1>
                        </div>

                        <div className="flex gap-3 items-center ml-auto">
                            {(query || selectedGenre || statusFilter || selectedYear) && (
                                <SagaButton variant="outline" size="sm" onClick={() => setSearchParams(new URLSearchParams())} className="animate-in fade-in zoom-in duration-300">
                                    <span className="mr-2">✕</span> Reset
                                </SagaButton>
                            )}
                            <button
                                onClick={() => performSearch()}
                                disabled={loading}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--saga-surface)] border border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:text-[var(--saga-text)] hover:border-red-600/30 transition-all hover:shadow-neon-red/20 active:scale-95 disabled:opacity-50"
                                title="Refresh Engine"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-3 items-stretch relative z-50">
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-red-600/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex items-center h-10 md:h-12 bg-black/40 border border-white/10 rounded-xl px-4 transition-all duration-300 group-focus-within:border-red-600/50 group-focus-within:shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                                <svg className="w-4 h-4 text-gray-500 mr-3 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    placeholder="Search..."
                                    value={query}
                                    onChange={e => updateFilters("q", e.target.value)}
                                    className="w-full bg-transparent text-sm font-medium text-white placeholder-gray-600 outline-none tracking-tight font-sans"
                                />
                                <div className="hidden md:flex gap-2">
                                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--saga-bg)] border border-[var(--saga-border)] text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-wider">
                                        CTRL + K
                                    </kbd>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col w-full lg:w-auto">
                            {/* Mobile Filter Toggle */}
                            <div className="lg:hidden w-full mb-1">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 h-10 md:h-12
                                        ${showFilters
                                            ? 'bg-red-600/10 border-red-600 text-red-500 shadow-neon-red'
                                            : 'bg-[var(--saga-surface)] border-[var(--saga-border)] text-[var(--saga-text)] hover:border-red-600/30'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-0.5 rounded-md transition-colors ${showFilters ? 'bg-red-600 text-white' : 'bg-[var(--saga-bg)] text-[var(--saga-text-dim)] border border-[var(--saga-border)]'}`}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                            {(selectedGenre || statusFilter || selectedYear || (sortBy && sortBy !== 'popularity' && sortBy !== 'relevance')) ? 'FILTERS ACTIVE' : 'FILTERS'}
                                        </span>
                                    </div>
                                    <div className={`transform transition-transform duration-300 ${showFilters ? 'rotate-180 text-red-500' : 'text-[var(--saga-text-dim)]'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </button>
                            </div>

                            {/* Filter Grid */}
                            {/* Filter Grid - Desktop Only */}
                            <div className="hidden lg:flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                                <SagaSelect
                                    label={null}
                                    value={selectedGenre}
                                    onChange={val => updateFilters("genre", val)}
                                    options={[{ label: "All Genres", value: "" }, ...genres.map(g => ({ label: g.name, value: g.mal_id }))]}
                                    className="h-full w-full lg:w-48"
                                />
                                <SagaSelect
                                    label={null}
                                    value={sortBy}
                                    onChange={val => updateFilters("sort", val)}
                                    options={[
                                        { label: "Relevance/Pop", value: query ? "relevance" : "popularity" },
                                        { label: "Rating", value: "score" },
                                        { label: "Newest", value: "aired" }
                                    ]}
                                    className="h-full w-full lg:w-40"
                                />
                                <SagaSelect
                                    label={null}
                                    value={statusFilter}
                                    onChange={val => updateFilters("status", val)}
                                    options={[
                                        { label: "All Status", value: "" },
                                        { label: "Airing", value: "airing" },
                                        { label: "Finished", value: "complete" },
                                        { label: "Upcoming", value: "upcoming" }
                                    ]}
                                    className="h-full w-full lg:w-40"
                                />
                            </div>

                            {/* Mobile Filters Bottom Sheet */}
                            <BottomSheet
                                isOpen={showFilters}
                                onClose={() => setShowFilters(false)}
                                title="Search Parameters"
                            >
                                <div className="flex flex-col gap-6 pb-8">
                                    <SagaSelect
                                        label="Genre"
                                        value={selectedGenre}
                                        onChange={val => updateFilters("genre", val)}
                                        options={[{ label: "All Genres", value: "" }, ...genres.map(g => ({ label: g.name, value: g.mal_id }))]}
                                        className="w-full"
                                    />
                                    <SagaSelect
                                        label="Sort Order"
                                        value={sortBy}
                                        onChange={val => updateFilters("sort", val)}
                                        options={[
                                            { label: query ? "Relevance" : "Popularity", value: query ? "relevance" : "popularity" },
                                            { label: "Rating", value: "score" },
                                            { label: "Newest", value: "aired" }
                                        ]}
                                        className="w-full"
                                    />
                                    <SagaSelect
                                        label="Airing Status"
                                        value={statusFilter}
                                        onChange={val => updateFilters("status", val)}
                                        options={[
                                            { label: "All Status", value: "" },
                                            { label: "Airing", value: "airing" },
                                            { label: "Finished", value: "complete" },
                                            { label: "Upcoming", value: "upcoming" }
                                        ]}
                                        className="w-full"
                                    />
                                    <div className="pt-4">
                                        <SagaButton variant="primary" size="lg" className="w-full" onClick={() => setShowFilters(false)}>
                                            Apply Filters
                                        </SagaButton>
                                    </div>
                                </div>
                            </BottomSheet>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-shell mt-8 md:mt-12 relative z-10 section-stack">
                {error ? (
                    <div className="py-32 text-center border-2 border-dashed border-[var(--saga-border)] rounded-[3rem] bg-[var(--saga-surface)]">
                        <div className="text-8xl mb-6 opacity-20 animate-pulse">🔌</div>
                        <h2 className="text-shonen-bold text-4xl mb-2 text-[var(--saga-text)] uppercase">{error}</h2>
                        <SagaButton variant="primary" onClick={performSearch} className="mt-8">Re-Initialize</SagaButton>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8">
                        {[...Array(12)].map((_, i) => (
                            <SagaSkeleton key={i} type="card" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : (
                    <>
                        {results.length > 0 ? (
                            <>
                                {!query && (
                                    <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
                                        <div className="w-1.5 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-full shadow-neon-red"></div>
                                        <div>
                                            <h2 className="text-shonen-bold text-3xl uppercase tracking-wider text-[var(--saga-text)] leading-none">{discoveryLabel}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--saga-text-dim)]">Top Rated Selection</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-backwards">
                                    {results.map((anime, idx) => {
                                        const isNSFW = anime.rating?.includes('Rx') || (anime.rating?.includes('R+') && !anime.rating?.includes('mild'));
                                        const isHidden = isNSFW && !showNSFW;

                                        return (
                                            <div
                                                key={anime.mal_id}
                                                className={`group relative transition-all duration-500 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards`}
                                                style={{ animationDelay: `${idx * 0.05}s` }}
                                            >
                                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[var(--saga-surface)] border border-[var(--saga-border)] shadow-lg group-hover:border-red-600/50 group-hover:shadow-neon-red transition-all duration-300">
                                                    {isHidden && (
                                                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                                                            <div className="text-4xl mb-4 opacity-50">🔞</div>
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-900/50 bg-red-900/10 px-3 py-1 rounded">Restricted</span>
                                                        </div>
                                                    )}

                                                    <Link to={`/anime/${anime.mal_id}`} className="block w-full h-full relative cursor-none-custom">
                                                        <img
                                                            src={anime.images?.jpg?.image_url}
                                                            loading="lazy"
                                                            className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 ${isHidden ? 'opacity-10 blur-xl' : ''}`}
                                                            alt=""
                                                        />
                                                        {/* Status Pill */}
                                                        {anime.status === 'Currently Airing' && (
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500/90 text-black text-[9px] font-black uppercase tracking-widest rounded shadow-lg">
                                                                AIRING
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <div className="absolute top-2 right-2 z-20">
                                                        <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                                            <span className="text-yellow-400">★</span> {anime.score || "N/A"}
                                                        </div>
                                                    </div>

                                                    {/* Quick Action Overlay */}
                                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end">
                                                        <SagaButton
                                                            variant={isInWatchlist(anime.mal_id) ? "outline" : "primary"}
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleToggleWatchlist(anime);
                                                            }}
                                                            className="w-full shadow-lg"
                                                            disabled={addingId === anime.mal_id}
                                                        >
                                                            {addingId === anime.mal_id ? "Syncing..." : (
                                                                (anime.status?.toLowerCase().includes("not yet") || anime.status?.toLowerCase().includes("upcoming"))
                                                                    ? (reminders.has(anime.mal_id) ? "✓ Set" : "🔔 Remind")
                                                                    : (isInWatchlist(anime.mal_id) ? "✓ Added" : "+ Track")
                                                            )}
                                                        </SagaButton>
                                                    </div>
                                                </div>

                                                <div className="mt-4 px-1">
                                                    <h3 className="text-xs font-black uppercase tracking-wider line-clamp-1 mb-1 group-hover:text-red-500 transition-colors text-[var(--saga-text)]">{anime.title}</h3>
                                                    <div className="flex justify-between items-center text-[9px] font-bold text-[var(--saga-text-dim)] uppercase">
                                                        <span>{anime.type || 'TV'}</span>
                                                        <span>{anime.episodes || "?"} eps</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="py-40 text-center border border-dashed border-[var(--saga-border)] rounded-[3rem] bg-[var(--saga-surface)]">
                                <span className="text-8xl mb-6 block grayscale opacity-10">📂</span>
                                <h2 className="text-shonen-bold text-3xl mb-4 uppercase text-[var(--saga-text)]">No records found</h2>
                                <p className="text-[var(--saga-text-dim)] max-w-sm mx-auto italic mb-8">"The ink has not yet touched this page. Try searching for a different legend."</p>
                                <SagaButton variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>Reset Archive</SagaButton>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}
