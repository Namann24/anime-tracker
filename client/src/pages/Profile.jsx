import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfile, updateProfile, updatePersonalization } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getAnimeById, searchAnime } from "../services/animeService";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import BottomSheet from "../components/common/BottomSheet";

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser, logout } = useAuth();

    const [user, setUser] = useState(null);
    const { setUser: setAuthUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        bio: "",
        profilePic: "",
        primaryColor: "#ff003c",
        accentColor: "#f43f5e",
        bannerUrl: "",
        favorites: []
    });
    const [favoritesDetails, setFavoritesDetails] = useState([]);
    const [favSearch, setFavSearch] = useState("");
    const [favSearchResults, setFavSearchResults] = useState([]);
    const [isSearchingFavs, setIsSearchingFavs] = useState(false);
    const [bannerSearch, setBannerSearch] = useState("");
    const [bannerSearchResults, setBannerSearchResults] = useState([]);
    const [isSearchingBanners, setIsSearchingBanners] = useState(false);

    const isOwnProfile = currentUser?.username === username;
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const data = await getProfile(username);
                setUser(data);
                setEditData({
                    bio: data.bio || "",
                    profilePic: data.profilePic || "👤",
                    primaryColor: data.personalization?.primaryColor || "#ff003c",
                    accentColor: data.personalization?.accentColor || "#f43f5e",
                    bannerUrl: data.personalization?.bannerUrl || "",
                    favorites: data.favorites || []
                });

                if (data.favorites?.length > 0) {
                    const favs = await Promise.all(
                        data.favorites.slice(0, 5).map(id => getAnimeById(id))
                    );
                    setFavoritesDetails(favs.filter(f => f));
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [username]);

    useEffect(() => {
        if (!favSearch.trim()) {
            setFavSearchResults([]);
            return;
        }
        const delay = setTimeout(async () => {
            setIsSearchingFavs(true);
            try {
                const results = await searchAnime(favSearch);
                setFavSearchResults(results.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingFavs(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [favSearch]);

    useEffect(() => {
        if (!bannerSearch.trim()) {
            setBannerSearchResults([]);
            return;
        }
        const delay = setTimeout(async () => {
            setIsSearchingBanners(true);
            try {
                const results = await searchAnime(bannerSearch);
                setBannerSearchResults(results.slice(0, 9));
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingBanners(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [bannerSearch]);

    const handleAddFavorite = (anime) => {
        if (editData.favorites.length >= 5) return;
        if (editData.favorites.includes(anime.mal_id)) return;
        setEditData(prev => ({ ...prev, favorites: [...prev.favorites, anime.mal_id] }));
        setFavSearch("");
        setFavSearchResults([]);
        setFavoritesDetails(prev => [...prev, anime].slice(0, 5));
    };

    const handleRemoveFavorite = (malId) => {
        setEditData(prev => ({ ...prev, favorites: prev.favorites.filter(id => id !== malId) }));
        setFavoritesDetails(prev => prev.filter(f => f.mal_id !== malId));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const updated = await updateProfile({
                bio: editData.bio,
                profilePic: editData.profilePic,
                favorites: editData.favorites
            });
            const updatedPers = await updatePersonalization({
                primaryColor: editData.primaryColor,
                accentColor: editData.accentColor,
                bannerUrl: editData.bannerUrl
            });
            const fullUpdatedUser = { ...user, ...updated, personalization: updatedPers };
            setUser(fullUpdatedUser);
            setAuthUser(fullUpdatedUser);
            localStorage.setItem("user", JSON.stringify(fullUpdatedUser));

            setSaveStatus('success');
            setTimeout(() => {
                setIsEditing(false);
                setSaveStatus(null);
            }, 1000);
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-saga-bg flex items-center justify-center"><div className="w-12 h-12 border-4 border-saga-accent border-t-transparent rounded-full animate-spin"></div></div>;
    if (!user) return <div className="min-h-screen bg-saga-bg flex items-center justify-center text-saga-accent font-shonen text-4xl uppercase tracking-widest">Aura Not Found</div>;

    const stats = {
        total: user.watchlist?.length || 0,
        completed: user.watchlist?.filter(i => i.status === "Completed").length || 0,
        watching: user.watchlist?.filter(i => i.status === "Watching").length || 0,
        episodes: user.watchlist?.reduce((acc, item) => acc + (item.progress || 0), 0) || 0
    };

    const getRankInfo = (eps) => {
        const power = eps * 10;
        if (eps >= 1000) return { title: "Archon", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", next: Infinity, prev: 1000 };
        if (eps >= 500) return { title: "Warlord", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30", next: 1000, prev: 500 };
        if (eps >= 200) return { title: "Master", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", next: 500, prev: 200 };
        if (eps >= 50) return { title: "Ronin", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", next: 200, prev: 50 };
        return { title: "Initiate", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30", next: 50, prev: 0 };
    };

    const rank = getRankInfo(stats.episodes);
    const powerLevel = stats.episodes * 10;
    const progressToNext = rank.next === Infinity ? 100 : Math.round(((stats.episodes - rank.prev) / (rank.next - rank.prev)) * 100);

    const achievements = [
        { id: 'binge', label: 'Eclipse Watcher', icon: '🌑', active: stats.episodes > 100, desc: 'Consumed 100+ chapters' },
        { id: 'master', label: 'Grandmaster', icon: '🏆', active: stats.completed >= 10, desc: 'Mastered 10+ titles' },
        { id: 'social', label: 'Saga Herald', icon: '📯', active: user.clubs?.length > 0, desc: 'Joined a society' },
        { id: 'og', label: 'Founding Soul', icon: '⚔️', active: true, desc: 'Member of the First Wave' }
    ];

    const AVATARS = ["/avatars/goku.png", "/avatars/naruto.png", "/avatars/luffy.png", "/avatars/sasuke.png", "🍥", "🐉", "👹", "✨"];
    const COLORS = ["#ff003c", "#a855f7", "#3b82f6", "#10b981", "#f59e0b"];

    return (
        <div className="min-h-screen text-saga-text pb-24 md:pb-32 overflow-x-hidden bg-transparent transition-colors duration-500">
            <div className="h-64 md:h-[450px] relative overflow-hidden">
                {user.personalization?.bannerUrl ? (
                    <img src={user.personalization.bannerUrl} className="w-full h-full object-cover brightness-75 contrast-150 saturate-110 dark:brightness-50 dark:contrast-125 dark:saturate-100" alt="" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-saga-accent/40 via-saga-bg to-saga-bg"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                <div className="absolute inset-0 halftone opacity-20 pointer-events-none"></div>
                <div className="absolute inset-0 speed-lines opacity-10 pointer-events-none"></div>


            </div>

            <div className="relative z-20 -mt-16 md:-mt-32 layout-shell mb-8 md:mb-20">
                <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[400px_1fr] gap-6 md:gap-12 items-end">

                    {/* AVATAR SECTION - Compacted & Centered on Mobile */}
                    <div className="relative group/avatar mx-auto lg:mx-0 w-32 md:w-auto">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-dashed border-red-600/20 rounded-full animate-spin-ultra-slow"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dotted border-white/10 rounded-full animate-spin-reverse-slow"></div>

                        <div className="relative w-full aspect-square clip-hex p-1 bg-gradient-to-b from-saga-accent via-purple-600 to-saga-bg animate-float-shatter">
                            <div className="w-full h-full clip-hex bg-saga-bg relative overflow-hidden group">
                                {(typeof user.profilePic === 'string' && (user.profilePic.includes('/') || user.profilePic.startsWith('http') || user.profilePic.startsWith('data:'))) ? (
                                    <img
                                        src={user.profilePic}
                                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 group-hover:rotate-3"
                                        alt=""
                                        onError={(e) => { e.target.src = "https://placehold.co/400x400/1a1a1a/ef4444?text=Signal+Lost"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-saga-surface">
                                        <span className="text-6xl md:text-9xl drop-shadow-[0_0_50px_rgba(255,0,60,0.5)]">{user.profilePic || '👤'}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className={`absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 md:px-6 md:py-2 bg-saga-bg border border-saga-border skew-x-[-12deg] shadow-lg group-hover/avatar:border-saga-accent transition-colors duration-500`}>
                            <div className="skew-x-[12deg] flex flex-col items-center">
                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] ${rank.color} whitespace-nowrap`}>Current Rank</span>
                                <span className="text-xs md:text-2xl font-black text-saga-text uppercase tracking-tighter">{rank.title}</span>
                            </div>
                        </div>

                        {isOwnProfile && (
                            <>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="absolute top-0 right-0 p-2 md:p-4 bg-saga-surface clip-hex hover:bg-saga-accent hover:text-white transition-all backdrop-blur-md border border-saga-border z-10"
                                    title="Rewrite History"
                                >
                                    <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = "/login";
                                    }}
                                    className="absolute top-0 left-0 p-2 md:p-4 bg-saga-surface clip-hex hover:bg-red-600 hover:text-white transition-all backdrop-blur-md border border-saga-border z-10"
                                    title="Sever Connection"
                                >
                                    <svg className="w-3 h-3 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* USER INFO - Compacted */}
                    <div className="flex flex-col gap-4 md:gap-8 mt-4 lg:mt-0 text-center lg:text-left">
                        <div className="relative">
                            <h1 className="font-shonen text-4xl md:text-7xl lg:text-9xl text-saga-text tracking-widest uppercase leading-[0.9] mb-2 md:mb-4 drop-shadow-sm break-words">
                                {user.username}
                            </h1>
                            <div className="h-0.5 md:h-1 w-full bg-gradient-to-r from-transparent via-saga-accent to-transparent lg:from-saga-accent lg:to-transparent"></div>
                            <div className="flex justify-between items-end mt-2 px-2 md:px-0">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-saga-accent">Subject #{Math.floor(Math.random() * 9000) + 1000}</span>
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-saga-text-dim">Status: ASCENDED</span>
                            </div>
                        </div>

                        <div className="relative p-4 md:p-8 border-l-2 md:border-l-4 border-saga-border bg-gradient-to-r from-saga-surface to-transparent backdrop-blur-sm">
                            <p className="text-sm md:text-2xl text-saga-text-dim italic font-medium leading-relaxed">
                                "{user.bio || "Legend pending..."}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatusCard label="Total Spirits" value={stats.total} />
                            <StatusCard label="Power Level" value={powerLevel.toLocaleString()} highlight color={editData.primaryColor} />
                            <StatusCard label="Episodes" value={stats.episodes} />
                            <StatusCard label="Mastered" value={stats.completed} />
                        </div>

                        <div className="space-y-1 md:space-y-2">
                            <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-500">
                                <span>Sync Rate to Next Rank</span>
                                <span>{progressToNext}%</span>
                            </div>
                            <div className="h-2 md:h-4 bg-white/5 skew-x-[-20deg] border border-white/10 overflow-hidden relative">
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.5)_4px,rgba(0,0,0,0.5)_5px)] z-10 pointer-events-none"></div>
                                <div
                                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 shadow-[0_0_20px_rgba(255,0,60,0.6)] animate-pulse"
                                    style={{ width: `${progressToNext}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-saga-text-dim">Achievements</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                {achievements.map(ach => (
                                    <div key={ach.id} className={`p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 ${ach.active ? 'bg-saga-surface border border-saga-accent/20' : 'bg-saga-surface opacity-50'}`}>
                                        <span className="text-2xl md:text-3xl">{ach.icon}</span>
                                        <div className="text-left">
                                            <p className="font-bold text-saga-text text-xs md:text-base">{ach.label}</p>
                                            <p className="text-[9px] md:text-xs text-saga-text-dim">{ach.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-shell relative z-20 section-stack">



                <BottomSheet isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Identity">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 pb-8">
                        <div className="space-y-6 md:space-y-8">
                            <SagaInput
                                label="Personal Biography"
                                area
                                placeholder="Define your legacy..."
                                value={editData.bio}
                                onChange={e => setEditData({ ...editData, bio: e.target.value })}
                                className="bg-black/20 text-saga-text border-white/10 focus:border-saga-accent/50 min-h-[80px] text-sm"
                            />

                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-3">Essence Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setEditData({ ...editData, primaryColor: c })}
                                            className={`w-9 h-9 rounded-xl border transition-all duration-300 ${editData.primaryColor === c ? 'border-white scale-110 shadow-pulse ring-1 ring-white/20' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <label className="text-[9px] font-black text-saga-text-dim uppercase tracking-widest block mb-3">Visual Icon</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {AVATARS.map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setEditData({ ...editData, profilePic: a })}
                                            className={`aspect-square rounded-xl bg-black/20 border flex items-center justify-center transition-all duration-300 overflow-hidden group ${editData.profilePic === a ? 'border-saga-accent shadow-[0_0_10px_rgba(255,0,60,0.3)]' : 'border-transparent hover:border-white/20'}`}
                                        >
                                            {a.startsWith('/') ? (
                                                <img src={a} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar option" />
                                            ) : (
                                                <span className="text-xl group-hover:scale-110 transition-transform">{a}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 md:pt-6 border-t border-white/5">
                                <SagaButton variant="primary" size="md" className="flex-1 rounded-xl font-black tracking-widest uppercase hover:brightness-110 text-xs py-3" onClick={handleUpdate} disabled={isSaving}>
                                    {isSaving ? "Syncing..." : "Bind Changes"}
                                </SagaButton>
                                <button
                                    className="px-6 py-3 rounded-xl font-bold bg-white/5 text-saga-text-dim text-xs hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </BottomSheet>

                <section className="mb-12 md:mb-24">
                    <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                        <div className="w-1 md:w-1.5 h-8 md:h-10 bg-saga-accent rounded-full shadow-neon-red"></div>
                        <h2 className="font-shonen text-3xl md:text-4xl text-saga-text uppercase tracking-wider">Ascended Sagas</h2>
                    </div>

                    {favoritesDetails.length === 0 ? (
                        <div className="p-12 md:p-20 text-center border-2 border-dashed border-saga-border rounded-[2rem] md:rounded-[3rem] text-saga-text-dim opacity-40 italic">
                            The gallery of heroes awaits entry...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-10">
                            {favoritesDetails.map((anime, idx) => (
                                <Link
                                    to={`/anime/${anime.mal_id}`}
                                    key={anime.mal_id}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                    <div className={`relative aspect-[2/3.2] rounded-xl md:rounded-2xl overflow-hidden bg-[#121212] transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1 hover:rotate-0'}`}>
                                        <img src={anime.images.jpg.large_image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2000ms]" alt="" />
                                        <div className="absolute inset-x-0 bottom-0 p-3 md:p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
                                            <span className="text-[8px] md:text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1 md:mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Legend #{idx + 1}</span>
                                            <h4 className="text-white font-black text-xs md:text-sm uppercase leading-tight line-clamp-2">{anime.title}</h4>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                        <div className="w-1 md:w-1.5 h-8 md:h-10 bg-saga-accent rounded-full shadow-neon-red"></div>
                        <h2 className="font-shonen text-3xl md:text-4xl text-saga-text uppercase tracking-wider">Chronicle History</h2>
                    </div>

                    <div className="bg-saga-surface backdrop-blur-xl border border-saga-border rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
                        {!user.watchlist || user.watchlist.length === 0 ? (
                            <p className="p-20 md:p-32 text-center text-gray-600 font-bold italic tracking-wider opacity-30">"The scroll is still blank... Your legend begins now."</p>
                        ) : (
                            <div className="divide-y divide-white/[0.03]">
                                {user.watchlist.slice(0, 8).map((item) => {
                                    const totalWatched = item.progress || 0;
                                    const totalAvail = item.totalEpisodes || 0;
                                    const progress = totalAvail > 0 ? Math.round((totalWatched / totalAvail) * 100) : 0;
                                    return (
                                        <div key={item._id} className="p-4 md:p-8 flex flex-row items-center gap-4 md:gap-10 hover:bg-saga-accent/5 transition-all group border-b border-saga-border last:border-0 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-saga-accent/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
                                            <div className="w-16 h-16 md:w-24 md:h-24 clip-hex bg-gradient-to-br from-saga-accent to-purple-800 p-0.5 shrink-0 group-hover:rotate-180 transition-transform duration-700">
                                                <div className="w-full h-full clip-hex bg-saga-bg">
                                                    <img src={item.bannerUrl || item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 text-left relative z-10">
                                                <h4 className="text-saga-text font-black text-sm md:text-2xl uppercase tracking-tighter mb-1 md:mb-4 group-hover:text-saga-accent transition-colors truncate">{item.title}</h4>
                                                <div className="flex flex-wrap items-center gap-3 md:gap-6">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-saga-accent shadow-neon-red animate-pulse"></span>
                                                        <span className="text-[8px] md:text-[10px] font-black text-saga-text-dim uppercase tracking-widest">{item.status}</span>
                                                    </div>
                                                    <div className="hidden md:flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-saga-text-dim uppercase tracking-widest">{totalWatched} / {totalAvail || "?"} CHAPTERS</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex flex-col items-end gap-1 md:gap-3 shrink-0">
                                                <div className="text-[8px] md:text-[9px] font-black text-saga-text-dim uppercase tracking-[0.2em] hidden md:block">Sync Rate</div>
                                                <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-4">
                                                    <div className="w-16 md:w-32 h-1 md:h-1.5 bg-saga-bg skew-x-12 overflow-hidden border border-saga-border">
                                                        <div className="h-full bg-saga-accent shadow-neon-red" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                    <span className="text-saga-text font-black text-xs md:text-sm italic">{progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>

        </div>

    );
}

function StatusCard({ label, value, highlight, color = "#ff003c" }) {
    // Determine if value is a number for animation
    const isNumber = !isNaN(parseFloat(value));
    const finalValue = isNumber ? parseFloat(value) : 0;

    // Simple custom hook logic inline for animation
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isNumber) return;
        let startTimestamp = null;
        const duration = 1500; // 1.5s animation

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            setDisplayValue(Math.floor(ease * finalValue));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [finalValue, isNumber]);

    return (
        <div
            className={`p-3 md:p-6 border-l-2 transition-all hover:pl-8 group relative overflow-hidden ${highlight ? 'border-saga-accent bg-saga-accent/5 shadow-neon-red' : 'border-saga-border bg-saga-surface hover:border-saga-text-dim'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${highlight ? 'from-saga-accent/10' : 'from-saga-text/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-1 transition-colors relative z-10" style={highlight ? { color: 'var(--saga-text)' } : { color: 'var(--saga-text-dim)' }}>{label}</p>
            <p className={`text-2xl md:text-4xl font-black italic tracking-tighter text-saga-text relative z-10 group-hover:scale-110 transition-transform origin-left`}>
                {isNumber ? displayValue.toLocaleString() : value}
            </p>
        </div>
    );
}
