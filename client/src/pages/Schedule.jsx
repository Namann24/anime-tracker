import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAnimeSchedule } from "../services/animeService";
import { useWatchlist } from "../context/WatchlistContext";
import SagaButton from "../components/common/SagaButton";
import SagaSkeleton from "../components/common/SagaSkeleton";

export default function Schedule() {
    const { watchlist } = useWatchlist();
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setLoading(true);
                // Jikan API returns everything if no filter, or specific day.
                // We'll fetch the active day to be fast, or implement a caching strategy for all days.
                // For better UX, let's fetch day by day on click to avoid rate limits, or all at once with delays.
                // Strategy: Fetch active day immediately.

                const data = await getAnimeSchedule(activeDay);

                // Deduplicate by mal_id and sort by broadcast time
                const uniqueData = Array.from(new Map(data.map(item => [item.mal_id, item])).values())
                    .sort((a, b) => {
                        const timeA = a.broadcast?.time || "99:99";
                        const timeB = b.broadcast?.time || "99:99";
                        return timeA.localeCompare(timeB);
                    });

                setSchedule(prev => ({ ...prev, [activeDay]: uniqueData }));
            } catch (err) {
                console.error("Schedule error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [activeDay]);

    const watchlistIds = new Set(watchlist.map(a => a.mal_id));

    return (
        <div className="min-h-screen text-[var(--saga-text)] pb-20 overflow-x-hidden transition-colors duration-500 saga-animate-in">
            <div className="layout-shell pt-24 md:pt-32 section-stack">

                {/* THE SIGNAL CORE (HEADER) */}
                <div className="relative mb-16 md:mb-24 group">
                    <div className="absolute inset-x-0 -top-24 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-all duration-1000"></div>

                    <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-red-600/30 bg-red-600/5 text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-4 md:mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="relative flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-600 shadow-neon-red"></span>
                                    <span className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full border border-red-600 animate-signal-pulse"></span>
                                </div>
                                Live Signal: 88.4 MHz
                            </div>

                            <h1 className="text-shonen-bold text-4xl sm:text-6xl md:text-9xl tracking-tighter uppercase text-[var(--saga-text)] leading-[0.9] md:leading-[0.8] mb-4 md:mb-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                                TEMPORAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 font-outline-sm text-glow">GRID.</span>
                            </h1>
                            <p className="text-lg text-[var(--saga-text-dim)] font-medium italic max-w-xl animate-in fade-in slide-in-from-left-12 duration-700 delay-200">
                                "The archive monitors every transmission. Synchronize your internal clock with the global broadcast signal."
                            </p>
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-12 duration-700 delay-300">
                            <div className="flex items-center gap-4 bg-[var(--saga-surface)]/50 backdrop-blur-xl border border-[var(--saga-border)] p-6 rounded-[2rem] shadow-2xl">
                                <div className="text-right">
                                    <div className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">Local Signal</div>
                                    <div className="text-4xl font-black text-[var(--saga-text)] font-mono tracking-tighter">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day Selector - Edge to Edge Scroll */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 md:mb-10 pb-4 border-b border-[var(--saga-border)] -mx-4 px-4 md:mx-0 md:px-0">
                    {/* Sort days to start with active day or today? Let's just keep standard order or rotate. 
                        For now, standard order is fine, but let's scroll to active? 
                        Simpler: Just standard list. 
                    */}
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`flex-shrink-0 px-5 py-2 md:px-6 md:py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border ${activeDay === day
                                ? "bg-red-600 text-white border-red-600 shadow-neon-red scale-105"
                                : "bg-[var(--saga-surface)] text-[var(--saga-text-dim)] border-transparent hover:border-[var(--saga-border)] hover:text-[var(--saga-text)]"
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Schedule Grid */}
                {loading && !schedule[activeDay] ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-[var(--saga-surface)] rounded-2xl h-40 border border-[var(--saga-border)] relative overflow-hidden">
                                <SagaSkeleton type="text" className="absolute bottom-4 left-4 w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Desktop Grid */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {schedule[activeDay]?.map((anime) => {
                                const isTracked = watchlistIds.has(anime.mal_id);
                                return (
                                    <Link
                                        to={`/anime/${anime.mal_id}`}
                                        key={anime.mal_id}
                                        className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${isTracked
                                            ? "bg-red-600/5 border-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.1)]"
                                            : "bg-[var(--saga-surface)] border-[var(--saga-border)] hover:border-red-500/30"
                                            }`}
                                    >
                                        <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>

                                        <div className="flex flex-col gap-6">
                                            <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden border-2 border-[var(--saga-border)] group-hover:border-red-500/50 transition-colors bg-[var(--saga-background)]">
                                                <img
                                                    src={anime.images.jpg.large_image_url}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                    alt=""
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/600x400/1a1a1a/ef4444?text=Signal+Lost";
                                                        e.target.classList.add('opacity-40');
                                                    }}
                                                />

                                                {/* SIGNAL OVERLAY */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                    <div className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Signal Protocol</div>
                                                    <div className="text-[10px] text-white font-bold">{anime.source} • {anime.type}</div>
                                                </div>

                                                {isTracked && (
                                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-2xl z-10 animate-in zoom-in duration-300">
                                                        Neural Sync
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest mb-1">
                                                        {anime.broadcast.time || "Unknown Time"}
                                                    </div>
                                                    <h3 className="font-bold text-[var(--saga-text)] text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                                                        {anime.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {anime.genres.slice(0, 2).map(g => (
                                                            <span key={g.mal_id} className="text-[8px] px-1.5 py-0.5 bg-[var(--saga-background)] border border-[var(--saga-border)] rounded text-[var(--saga-text-dim)]">
                                                                {g.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[9px] text-[var(--saga-text-dim)] font-bold uppercase">
                                                        {anime.source}
                                                    </span>
                                                    <span className="text-xs font-black text-red-500">
                                                        {anime.score ? `★ ${anime.score}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Vertical Timeline */}
                        <div className="md:hidden space-y-0 relative border-l-2 border-[var(--saga-border)] ml-4 my-8 pb-12">
                            {schedule[activeDay]?.map((anime, idx) => {
                                const isTracked = watchlistIds.has(anime.mal_id);
                                return (
                                    <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="block relative pl-6 pb-6 last:pb-0 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-500 bg-[var(--saga-bg)] ${isTracked ? 'border-red-600 shadow-neon-red scale-110' : 'border-[var(--saga-border)] group-hover:border-red-500'}`}>
                                            {isTracked && <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>}
                                        </div>

                                        {/* Time Label */}
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-2">
                                            {anime.broadcast.time || "23:00"}
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/20 to-transparent"></div>
                                        </div>

                                        {/* Timeline Card - Compact */}
                                        <div className={`bg-[var(--saga-surface)] rounded-xl p-2.5 flex gap-3 border transition-all duration-300 ${isTracked ? 'border-red-600/30 bg-red-600/5' : 'border-[var(--saga-border)]'}`}>
                                            <div className="w-16 h-20 rounded-lg bg-[var(--saga-background)] overflow-hidden shrink-0 border border-[var(--saga-border)]">
                                                <img src={anime.images.jpg.image_url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <h3 className="font-bold text-[var(--saga-text)] text-xs line-clamp-2 leading-tight mb-1">{anime.title}</h3>
                                                <p className="text-[8px] text-[var(--saga-text-dim)] uppercase tracking-wide mb-auto">{anime.source} • {anime.type}</p>

                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {anime.genres.slice(0, 2).map(g => (
                                                        <span key={g.mal_id} className="text-[8px] px-1.5 py-0.5 bg-[var(--saga-background)] border border-[var(--saga-border)] rounded text-[var(--saga-text-dim)]">
                                                            {g.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}

                {schedule[activeDay]?.length === 0 && !loading && (
                    <div className="text-center py-20 text-[var(--saga-text-dim)] font-bold uppercase tracking-widest">
                        No transmissions detected for this cycle.
                    </div>
                )}

            </div>
        </div>
    );
}
