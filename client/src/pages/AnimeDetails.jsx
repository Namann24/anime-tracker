import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { getReviews, postReview } from "../services/reviewService";

import { createNotification } from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { getFullAnimeById, getAnimeCharacters, getAnimeStaff } from "../services/animeService";
import SagaButton from "../components/common/SagaButton";

export default function AnimeDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { watchlist, showSpoilers, addToWatchlist, removeFromWatchlist } = useWatchlist();
    const { showToast } = useToast();
    const { refreshNotifications } = useNotifications();

    const [anime, setAnime] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 10, content: "" });
    const [submitting, setSubmitting] = useState(false);
    const [revealSpoiler, setRevealSpoiler] = useState(false);
    const [watchlistPending, setWatchlistPending] = useState(false);
    const [reminderPending, setReminderPending] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);

    // NEW STATE
    const [activeTab, setActiveTab] = useState("Overview");
    const [characters, setCharacters] = useState([]);
    const [staff, setStaff] = useState([]);

    const isInWatchlist = watchlist?.find(a => a.mal_id?.toString() === id?.toString());

    useEffect(() => {
        const loadData = async () => {
            try {
                const animeData = await getFullAnimeById(id);
                setAnime(animeData);
                const reviewsRes = await getReviews(id);
                setReviews(reviewsRes.data);

                // Check if reminder exists for this anime
                if (user) {
                    try {
                        const { checkReminder } = await import("../services/notificationService");
                        const res = await checkReminder(id);
                        setReminderSet(res.data.exists);
                    } catch (err) {
                        console.error("Failed to check reminder", err);
                    }
                }
            } catch (err) {
                console.error("Error loading anime details", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, user]);

    // FETCH CHARACTERS/STAFF ON DEMAND
    useEffect(() => {
        if (!anime) return;

        const fetchData = async () => {
            if (activeTab === "Characters" && characters.length === 0) {
                try {
                    const res = await getAnimeCharacters(id);
                    setCharacters(res);
                } catch (e) { console.error(e); }
            }
            if (activeTab === "Staff" && staff.length === 0) {
                try {
                    const res = await getAnimeStaff(id);
                    setStaff(res);
                } catch (e) { console.error(e); }
            }
        }
        fetchData();
    }, [activeTab, id, anime]);

    const handleToggleWatchlist = async () => {
        if (!user) return showToast("Please login first", "error");
        setWatchlistPending(true);
        try {
            if (isInWatchlist) {
                await removeFromWatchlist(isInWatchlist._id);
                showToast("Removed from chronicles", "success");
            } else {
                await addToWatchlist({
                    mal_id: anime.mal_id,
                    title: anime.title,
                    images: anime.images,
                    status: "Watching",
                    episodes: anime.episodes || 0,
                    genres: anime.genres
                });
                showToast("Added to chronicles!", "success");
            }
        } catch (err) {
            showToast("Failed to update chronicle", "error");
        } finally {
            setWatchlistPending(false);
        }
    };

    const handleSetReminder = async () => {
        if (!user || reminderPending) return;
        setReminderPending(true);
        try {
            if (reminderSet) {
                // Remove reminder
                const { deleteReminder } = await import("../services/notificationService");
                await deleteReminder(id);
                setReminderSet(false);
                refreshNotifications(); // Update notification count immediately
                showToast(`Reminder removed for ${anime.title}`, "success");
            } else {
                // Create reminder
                const { createNotification } = await import("../services/notificationService");
                await createNotification({
                    type: "reminder",
                    message: `The saga of ${anime.title} awaits you! Reminder active.`,
                    link: `/anime/${id}`,
                    animeId: id.toString()
                });
                setReminderSet(true);
                refreshNotifications(); // Update notification count immediately
                showToast(`Reminder set for ${anime.title}!`, "success");
            }
        } catch (err) {
            if (err.response?.data?.exists) {
                showToast("Reminder already exists", "error");
            } else {
                showToast("Failed to toggle reminder", "error");
            }
        } finally {
            setReminderPending(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast("Please login to post a chronicle entry", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res = await postReview(id, reviewForm);
            setReviews(prev => {
                const filtered = prev.filter(r => r.user?._id !== user.id && r.user?.id !== user.id);
                return [res.data, ...filtered];
            });
            setReviewForm({ rating: 10, content: "" });
            showToast("Chronicle entry posted!", "success");
        } catch (err) {
            console.error("Failed to post review", err);
            showToast("Error posting entry", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--saga-background)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin shadow-neon-red"></div>
        </div>
    );

    if (!anime) return (
        <div className="min-h-screen bg-[var(--saga-background)] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-32 h-32 rounded-3xl border-2 border-red-600/30 flex items-center justify-center mb-10 relative group">
                <div className="absolute inset-0 bg-red-600/10 blur-2xl group-hover:bg-red-600/20 transition-all rounded-full"></div>
                <span className="text-6xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">⚠️</span>
            </div>
            <h1 className="text-shonen-bold text-5xl md:text-7xl text-white mb-6 uppercase tracking-tighter leading-none animate-pulse">
                Saga <span className="text-red-600">Missing</span> In Time
            </h1>
            <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium italic">
                The neural stream encountered a temporal anomaly. The requested mission data is currently unavailable in the central archives.
            </p>
            <SagaButton v="outline" size="xl" onClick={() => navigate("/dashboard")} className="px-12 group">
                <span className="relative z-10 flex items-center gap-3">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    RETURN TO COMMAND
                </span>
            </SagaButton>
        </div>
    );

    return (
        <div className="min-h-screen text-[var(--saga-text)] pb-20 overflow-x-hidden transition-colors duration-500">
            {/* DYNAMIC HEADER */}
            <div className="relative h-[600px] md:h-[700px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
                <div className="absolute inset-0 halftone opacity-20 z-0"></div>
                <img
                    src={anime.images.jpg.large_image_url}
                    className="w-full h-full object-cover blur-2xl scale-110 opacity-40"
                    alt=""
                />

                <div className="absolute inset-0 z-20 flex items-end">
                    <div className="max-w-[1400px] mx-auto w-full px-6 flex flex-col lg:flex-row gap-12 items-center lg:items-end pb-20">
                        {/* Poster */}
                        <div className="relative group/poster perspective-2000">
                            <div className="absolute -inset-6 bg-red-600/20 blur-[60px] rounded-3xl opacity-0 group-hover/poster:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] group-hover/poster:scale-105 group-hover/poster:rotate-1 transition-all duration-700">
                                <img
                                    src={anime.images.jpg.large_image_url}
                                    className="w-64 md:w-80 h-auto"
                                    alt={anime.title}
                                />
                            </div>
                            {anime.rank && (
                                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] z-20 border-4 border-[var(--saga-background)] transform group-hover/poster:scale-110 transition-transform">
                                    <span className="text-[10px] font-black uppercase opacity-60">Rank</span>
                                    <span className="text-xl font-black italic">#{anime.rank}</span>
                                </div>
                            )}
                        </div>

                        {/* Title Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                                <span className="px-3 py-1.5 bg-red-600/20 border border-red-600/30 text-red-500 rounded-lg text-xs font-black uppercase tracking-widest animate-pulse">
                                    {anime.status}
                                </span>
                                {anime.genres?.slice(0, 3).map(g => (
                                    <span key={g.mal_id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400">
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-shonen-bold text-4xl md:text-7xl lg:text-8xl mb-8 leading-[0.9] drop-shadow-2xl">
                                {anime.title}
                            </h1>

                            <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-black text-red-500">{anime.score || 'N/A'}</div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Score</span>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(anime.score / 2) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-10 w-px bg-white/10 mx-2 hidden md:block"></div>

                                <div className="flex gap-4">
                                    <SagaButton
                                        variant={isInWatchlist ? "secondary" : "primary"}
                                        size="lg"
                                        onClick={handleToggleWatchlist}
                                        disabled={watchlistPending}
                                        icon={isInWatchlist ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                        )}
                                    >
                                        {isInWatchlist ? "In Chronicles" : "Add to List"}
                                    </SagaButton>

                                    {anime.status === "Not yet aired" && (
                                        <SagaButton
                                            variant="outline"
                                            size="lg"
                                            onClick={handleSetReminder}
                                        >
                                            {reminderSet ? "✓ Reminder Active" : "Set Alert"}
                                        </SagaButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="max-w-[1400px] mx-auto px-6 mb-12 border-b border-[var(--saga-border)]">
                <div className="flex gap-12 overflow-x-auto no-scrollbar">
                    {["Overview", "Characters", "Staff", "Reviews"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap relative ${activeTab === tab
                                ? "text-red-500"
                                : "text-[var(--saga-text-dim)] hover:text-[var(--saga-text)]"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-neon-red animate-in fade-in duration-300"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 pb-20 grid lg:grid-cols-12 gap-16">
                {/* CONTENT AREA */}
                <div className="lg:col-span-8 min-h-[500px]">

                    {activeTab === "Overview" && (
                        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* SYNOPSIS PANEL */}
                            <section className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative saga-glass-premium border border-[var(--saga-border)] p-12 rounded-[2.5rem] overflow-hidden">
                                    <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>

                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-shonen-bold text-4xl text-[var(--saga-text)] flex items-center gap-6">
                                            <span className="w-2 h-10 bg-red-600 rounded-full shadow-neon-red"></span>
                                            SYNOPSIS ARCHIVE
                                        </h2>
                                        {!showSpoilers && !revealSpoiler && anime.synopsis && (
                                            <SagaButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setRevealSpoiler(true)}
                                                className="border border-white/10"
                                            >
                                                Reveal Secrets
                                            </SagaButton>
                                        )}
                                    </div>

                                    <p className={`text-gray-300 text-lg leading-relaxed whitespace-pre-line transition-all duration-1000 ${!showSpoilers && !revealSpoiler && anime.synopsis ? 'blur-xl select-none opacity-20' : 'blur-0'} ${!anime.synopsis ? 'italic text-white/20' : ''}`}>
                                        {anime.synopsis || "This entry is yet to be fully chronicled. The archives await more temporal data to complete the legend."}
                                    </p>

                                    {anime.background && (
                                        <div className="mt-12 pt-12 border-t border-white/5">
                                            <h3 className="text-shonen-bold text-xl text-red-500 mb-6 flex items-center gap-3">
                                                HISTORICAL DATA
                                            </h3>
                                            <p className={`text-gray-400 italic leading-relaxed transition-all duration-1000 ${!showSpoilers && !revealSpoiler ? 'blur-xl select-none opacity-20' : 'blur-0'}`}>
                                                {anime.background}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* RELATED SEASONS (Overview Only) */}
                            {anime.relations && anime.relations.length > 0 && (
                                <section>
                                    <h3 className="text-shonen-bold text-2xl text-white mb-6">CONNECTED CHRONICLES</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {anime.relations.flatMap(r => r.entry.map(e => ({ ...e, relation: r.relation }))).slice(0, 6).map((rel, idx) => (
                                            <Link to={`/anime/${rel.mal_id}`} key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:border-red-600/30 hover:bg-white/10 transition-all">
                                                <div className="w-10 h-10 rounded bg-[#111] flex items-center justify-center text-xs font-black text-gray-500">
                                                    {rel.type}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">{rel.relation}</div>
                                                    <div className="text-sm font-bold text-white truncate">{rel.name}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {activeTab === "Characters" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {characters.length === 0 ? (
                                <div className="h-60 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {characters.slice(0, 20).map((char) => (
                                        <div key={char.character.mal_id} className="flex gap-4 p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)]/50 hover:bg-[var(--saga-surface-hover)]/80 hover:border-red-600/30 transition-all group">
                                            <img src={char.character.images.jpg.image_url} className="w-16 h-24 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform" alt="" />
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="text-lg font-black text-[var(--saga-text)] truncate">{char.character.name}</div>
                                                <div className="text-xs text-red-500 font-bold uppercase tracking-widest">{char.role}</div>

                                                {char.voice_actors && char.voice_actors.length > 0 && (
                                                    <div className="mt-2 text-xs text-[var(--saga-text-dim)] flex items-center gap-2">
                                                        <span className="truncate">{char.voice_actors[0].person.name}</span>
                                                        <span className="px-1.5 py-0.5 bg-[var(--saga-background)] rounded text-[8px]">{char.voice_actors[0].language}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Staff" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {staff.length === 0 ? (
                                <div className="h-60 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {staff.slice(0, 20).map((st, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl border border-[var(--saga-border)] bg-[var(--saga-surface)]/50 hover:bg-[var(--saga-surface-hover)]/80 hover:border-red-600/30 transition-all">
                                            <img src={st.person.images.jpg.image_url} className="w-16 h-24 object-cover rounded-lg shadow-lg grayscale hover:grayscale-0 transition-all" alt="" />
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="text-lg font-black text-[var(--saga-text)] truncate">{st.person.name}</div>
                                                <div className="text-xs text-red-500 font-bold uppercase tracking-widest truncate">{st.positions.join(", ")}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Reviews" && (
                        /* REVIEW SECTION (Moved inside Tab) */
                        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h2 className="text-shonen-bold text-4xl text-white">CHRONICLE ENTRIES</h2>
                                    <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Community Wisdom & Predictions</p>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-red-600">{reviews.length}</span>
                                        <span className="text-[10px] font-black uppercase text-gray-500">Writings</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-white">{Math.round(anime.score * 10)}%</span>
                                        <span className="text-[10px] font-black uppercase text-gray-500">Resonance</span>
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT REVIEW */}
                            <div className="saga-glass border border-white/10 p-10 rounded-2xl relative overflow-hidden">
                                <h3 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-6">Write Your Chapter</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Resonance Level (Rating)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                                                    className={`w-12 h-12 rounded-xl font-black transition-all duration-300 ${reviewForm.rating >= num
                                                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,60,0.3)] scale-110"
                                                        : "bg-white/5 text-gray-500 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[140px] outline-none focus:border-red-600/50 transition-all text-white leading-relaxed resize-none"
                                        placeholder="Commemorate your thoughts on this saga..."
                                        value={reviewForm.content}
                                        onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                                        required
                                    />

                                    <SagaButton
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        Post Chronicle Entry
                                    </SagaButton>
                                </form>
                            </div>

                            {/* REVIEWS LIST */}
                            <div className="grid gap-10">
                                {reviews.length === 0 ? (
                                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <div className="text-6xl mb-6">📜</div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase">The Tome is Empty</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto">Be the first to record your thoughts and lead this saga's community.</p>
                                    </div>
                                ) : (
                                    reviews.map(rev => (
                                        <div key={rev._id} className="group relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                            <div className="relative saga-glass border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row gap-8">
                                                {/* Reviewer Info */}
                                                <div className="flex flex-col items-center md:items-start md:w-32 flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden border border-white/10 mb-4 group-hover:rotate-6 transition-transform">
                                                        <img src={`https://ui-avatars.com/api/?name=${rev.user?.username}&background=random&color=fff&bold=true`} alt="" />
                                                    </div>
                                                    <Link to={`/profile/${rev.user?.username}`} className="text-white font-black uppercase text-xs hover:text-red-500 transition-colors">{rev.user?.username}</Link>
                                                    <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Watcher</span>
                                                </div>

                                                {/* Review Content */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-[var(--saga-border)]">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(rev.rating / 2) ? 'text-red-500 fill-red-500' : 'text-[var(--saga-text-dim)]'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-3xl font-black text-red-600 italic -mt-2">{rev.rating}<span className="text-xs text-[var(--saga-text-dim)] not-italic">/10</span></span>
                                                    </div>
                                                    <p className="text-[var(--saga-text)] leading-relaxed font-medium italic">"{rev.content}"</p>
                                                    <div className="mt-6 flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-[var(--saga-text-dim)] uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* SIDEBAR: ARCHIVE DATA */}
                <div className="lg:col-span-4 space-y-12">
                    <section className="saga-glass-premium border border-[var(--saga-border)] rounded-[2.5rem] overflow-hidden sticky top-32 shadow-2xl">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 flex items-center justify-between border-b border-white/10">
                            <h3 className="text-shonen-bold text-2xl text-white">STUDIO LOG</h3>
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            <ArchiveRow label="Signal Format" value={anime.type} />
                            <ArchiveRow label="Episode Count" value={anime.episodes} />
                            <ArchiveRow label="Aired Cycle" value={anime.aired?.string} />
                            <ArchiveRow label="Production Hub" value={anime.studios?.[0]?.name} />
                            <ArchiveRow label="Popularity Index" value={`#${anime.popularity}`} />
                            <ArchiveRow label="Original Source" value={anime.source} />

                            <div className="mt-10 pt-10 border-t border-[var(--saga-border)] space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--saga-text-dim)]">Transmission Access</h4>
                                <div className="flex flex-wrap gap-3">
                                    {anime.streaming?.length > 0 ? anime.streaming.map((stream, idx) => (
                                        <a
                                            key={idx}
                                            href={stream.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-xl text-[10px] font-black uppercase text-[var(--saga-text)] hover:border-red-600/50 hover:bg-red-600/10 hover:-translate-y-1 shadow-sm transition-all"
                                        >
                                            {stream.name}
                                        </a>
                                    )) : (
                                        <span className="text-xs text-[var(--saga-text-dim)] italic">Access data restricted.</span>
                                    )}
                                </div>
                            </div>

                            {anime.trailer?.embed_url && (
                                <div className="mt-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--saga-text-dim)] mb-6">Visual Transmission</h4>
                                    <div className="relative aspect-video rounded-[1.5rem] overflow-hidden border-2 border-[var(--saga-border)] group shadow-lg">
                                        <iframe
                                            src={anime.trailer.embed_url}
                                            className="w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                                            allowFullScreen
                                        />
                                        <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[1.5rem]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ArchiveRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-3 group/row border-b border-[var(--saga-border)] last:border-0 hover:bg-white/5 px-2 rounded-lg transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)] group-hover/row:text-red-500 transition-colors">{label}</span>
            <span className="text-sm font-black text-[var(--saga-text)] text-right tracking-tight">{value || "UNK"}</span>
        </div>
    );
}
