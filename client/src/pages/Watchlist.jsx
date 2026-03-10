import { useEffect, useState } from "react";
import {

  getWatchlist,
  updateWatchStatus,
  toggleEpisode,
  updateWatchlistDetails,
  resetWatchlist
} from "../services/watchlistService";

import { searchAnime, getAnimeRelations, getAnimeById } from "../services/animeService";
import { ShieldAlert } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { useNavigate } from "react-router-dom";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaSelect from "../components/common/SagaSelect";
import { useToast } from "../context/ToastContext";
import SagaSkeleton from "../components/common/SagaSkeleton";
import BottomSheet from "../components/common/BottomSheet";
import { useAuth } from "../context/AuthContext"; // NEW: Import Auth


// --- PREMIUM SVG ICONS ---
const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
);
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PauseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default function Watchlist() {
  const navigate = useNavigate();
  const { user } = useAuth(); // NEW: Get user
  const {
    watchlist,
    loading: watchlistLoading,
    updateLocalWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    showSpoilers,
    setShowSpoilers
  } = useWatchlist();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeSeason, setActiveSeason] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedAnime, setExpandedAnime] = useState(null);

  const [editingAnime, setEditingAnime] = useState(null);
  const [editForm, setEditForm] = useState({ totalSeasons: 1, episodesPerSeason: 12 });
  const [checkingSequel, setCheckingSequel] = useState({});
  const [isAdding, setIsAdding] = useState(null); // ID of anime being added
  const [showFilters, setShowFilters] = useState(false);

  // Check if anime is already in watchlist
  const isInWatchlist = (malId) => {
    return watchlist.some(anime => anime.mal_id === malId);
  };

  const filteredWatchlist = watchlist.filter(anime => {
    if (activeFilter === "All") return true;
    return anime.status === activeFilter;
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        const res = await searchAnime(query);
        setResults(res);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const res = await searchAnime(query);
    setResults(res);
  };

  const handleAdd = async (anime) => {
    if (isAdding) return;
    setIsAdding(anime.mal_id);
    try {
      const totalEpisodes = anime.episodes || 12;
      const totalSeasons = 1; // Default to 1, let user adjust
      addToWatchlist({
        ...anime,
        episodes: anime.episodes // Ensure episodes are passed
      });
      setResults([]);
      setQuery("");
    } catch (error) {
      console.error("Failed to add anime", error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemove = async (id) => {
    await removeFromWatchlist(id);
  };

  const handleStatus = async (id, status) => {
    const anime = watchlist.find(a => a._id === id);
    if (!anime) return;

    let optimisticAnime = { ...anime, status };

    if (status === "Completed") {
      optimisticAnime.seasons = anime.seasons.map(season => ({
        ...season,
        watchedEpisodes: Array.from({ length: season.totalEpisodes }, (_, i) => i + 1)
      }));
    }

    updateLocalWatchlist(optimisticAnime);

    try {
      const res = await updateWatchStatus(id, status);
      updateLocalWatchlist(res.data);
      showToast(`Saga status updated to ${status}`, 'success');
    } catch (err) {
      console.error("Status update failed", err);
      updateLocalWatchlist(anime);
      showToast("Sync failure. Chronicle reverted.", 'error');
    }
  };

  const handleEpisodeToggle = async (id, season, ep) => {
    try {
      const res = await toggleEpisode(id, season, ep);
      updateLocalWatchlist(res.data);
    } catch (err) {
      console.error("Episode toggle failed", err);
      showToast("Chapter synchronization failed.", "error");
    }
  };

  const handleResetProgress = async (id) => {
    try {
      const res = await resetWatchlist(id);
      updateLocalWatchlist(res.data);
      showToast("Progress purged from chronicles.", "success");
    } catch (err) {
      console.error("Reset failed", err);
      showToast("Unable to clear records.", "error");
    }
  };

  const openEditModal = (anime) => {
    setEditingAnime(anime);
    setEditForm({
      totalSeasons: anime.seasons.length,
      episodesPerSeason: anime.seasons[0]?.totalEpisodes || 12
    });
  };

  const handleEditSubmit = async () => {
    if (!editingAnime) return;
    try {
      const res = await updateWatchlistDetails(editingAnime._id, editForm);
      updateLocalWatchlist(res.data);
      setEditingAnime(null);
    } catch (error) {
      console.error("Failed to update", error);
    }
  };

  const handleFindSequel = async (anime) => {
    if (!anime.mal_id) return;
    setCheckingSequel({ ...checkingSequel, [anime._id]: true });
    try {
      const relations = await getAnimeRelations(anime.mal_id);
      const sequel = relations.find(r => r.relation === "Sequel");
      if (sequel?.entry?.[0]) {
        const details = await getAnimeById(sequel.entry[0].mal_id);
        await handleAdd(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      const newState = { ...checkingSequel };
      delete newState[anime._id];
      setCheckingSequel(newState);
    }
  };

  // --- LOADING STATE ---
  if (watchlistLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse">Synchronizing Data...</span>
        </div>
      </div>
    );
  }

  // --- LOGGED OUT STATE ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0a] relative overflow-hidden">
        {/* Background Glitch Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 max-w-sm animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-black border-2 border-red-600/50 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.2)] group transition-transform hover:scale-105">
            <ShieldAlert className="w-12 h-12 text-red-600 group-hover:animate-pulse" />
          </div>

          <h1 className="text-shonen-bold text-5xl mb-4 text-white uppercase tracking-tighter leading-none">
            ARCHIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">LOCKED.</span>
          </h1>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">
            The SAGA Command Chronicles are restricted to authorized personnel. Sync your identity to access the archives.
          </p>

          <SagaButton
            variant="primary"
            size="xl"
            className="w-full shadow-neon-red py-6 text-lg hover:scale-[1.02] transition-transform active:scale-95"
            onClick={() => navigate('/login')}
          >
            Initialize Login
          </SagaButton>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN WATCHLIST CONTENT ---
  return (
    <div className="min-h-screen text-[var(--saga-text)] pb-32 overflow-x-hidden transition-colors duration-700 saga-animate-in bg-transparent selection:bg-red-500/30">

      {/* 🌌 ATMOSPHERIC CORE */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-red-600/5 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[0%] w-[35%] h-[35%] bg-blue-600/5 blur-[180px] rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      <div className="layout-shell relative z-10 section-stack">

        {/* 📋 ARCHIVE COMMAND HEADER */}
        <header className="pt-24 md:pt-40 mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="relative group/header animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full backdrop-blur-3xl shadow-neon-red">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Live Tracking Protocol</span>
              </div>
              <div className="h-px w-12 bg-white/10 hidden md:block"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 font-mono hidden md:block">ARCHIVE_SYNC: ACTIVE</span>
            </div>

            <h1 className="text-shonen-bold text-6xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tighter uppercase italic text-white drop-shadow-impact transition-transform duration-700 group-hover/header:translate-x-2">
              Central <span className="text-red-500 font-outline-sm">Archive.</span>
            </h1>

            <div className="mt-8 flex items-center gap-6 opacity-40 italic font-medium text-xs md:text-lg">
              <span className="text-red-600 font-black"># ARCHIVE_PROTOCOL_V4</span>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <p className="max-w-md">"The command chronicles are synchronized. Every saga etched, every resonance tracked."</p>
            </div>
          </div>

          <div className="flex-shrink-0 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 fill-mode-backwards">
            <div className="relative p-8 md:p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl overflow-hidden group/stats">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl opacity-0 group-hover/stats:opacity-100 transition-opacity"></div>

              <div className="flex flex-col items-end">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-[1px] bg-red-600"></span>
                  Metadata Entry
                </div>
                <div className="text-5xl md:text-7xl font-black text-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)] tabular-nums mb-2">
                  {filteredWatchlist.length}
                </div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Sagas Synchronized</div>
              </div>
            </div>
          </div>
        </header>

        {/* 🕵️ TACTICAL SEARCH & FILTERS */}
        <div className="grid lg:grid-cols-12 gap-6 mb-20 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">

          {/* SEARCH TERMINAL */}
          <div className="lg:col-span-7 relative group/search">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20 rounded-[2rem] blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity"></div>

            <div className="relative h-14 md:h-20 bg-black/60 border-2 border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center px-6 md:px-10 transition-all duration-500 group-focus-within/search:border-red-600/50 group-focus-within/search:bg-black/90 group-focus-within/search:scale-[1.01] shadow-2xl">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-focus-within/search:text-red-600 transition-colors mr-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                placeholder="QUERY ARCHIVE DATABASE..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent text-sm md:text-lg font-black uppercase tracking-[0.2em] text-white placeholder-white/10 outline-none"
              />
              <div className="hidden md:flex items-center gap-3 px-4 py-2 border border-white/10 rounded-xl bg-white/5 font-mono text-[9px] text-white/30 tracking-widest group-focus-within/search:border-red-600/20">
                [F1] BROWSE
              </div>
            </div>

            {/* HOLOGRAPHIC DROPDOWN */}
            {results.length > 0 && (
              <div className="absolute top-full left-4 right-4 md:left-8 md:right-8 mt-4 bg-black/95 backdrop-blur-[40px] border border-white/10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-2 z-[100] max-h-[500px] overflow-y-auto no-scrollbar animate-in slide-in-from-top-4 duration-500">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                  <span>SEARCH_RESULTS</span>
                  <span>RETURN: {results.length}</span>
                </div>
                {results.map((a) => (
                  <div
                    key={a.mal_id}
                    onClick={() => !isInWatchlist(a.mal_id) && handleAdd(a)}
                    className="flex gap-6 p-4 rounded-2xl hover:bg-white/[0.03] cursor-pointer transition-all border border-transparent hover:border-white/5 mb-1 group/item"
                  >
                    <div className="w-14 h-20 md:w-16 md:h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 group-hover/item:border-red-600/30 transition-all">
                      <img src={a.images?.jpg?.small_image_url} className="w-full h-full object-cover grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-700" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                      <div className="text-xs md:text-base font-black uppercase text-white tracking-tight line-clamp-1 group-hover/item:text-red-500 transition-colors">{a.title}</div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] font-mono">{a.type} // {a.episodes || '?'}_EPS</span>
                        {a.score && (
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-600"></div>
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{a.score} RATING</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pr-4">
                      {isInWatchlist(a.mal_id) ? (
                        <div className="w-10 h-10 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center text-green-500">
                          <CheckIcon className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover/item:border-red-600 group-hover/item:text-red-600 transition-all group-hover/item:bg-red-600 group-hover/item:text-white">
                          <span className="text-lg font-light">+</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILTER CONSOLE */}
          <div className="lg:col-span-5 flex gap-3 overflow-x-auto no-scrollbar py-2">
            {["All", "Watching", "Completed", "On Hold", "Plan to Watch"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-6 md:px-8 py-4 md:py-0 rounded-[1.5rem] md:rounded-[2rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-500 flex items-center justify-center min-w-[120px] md:min-w-[150px] ${activeFilter === f ? 'bg-red-600 border-red-600 text-white shadow-impact scale-[1.02]' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20 hover:text-white/80'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 📘 ARCHIVE DOSSIER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredWatchlist.map((anime, idx) => {
            const isExpanded = expandedAnime === anime._id;
            const season = activeSeason[anime._id] ?? anime.seasons?.[0]?.seasonNumber;
            const seasonData = anime.seasons.find(s => s.seasonNumber === season);
            const totalWatched = anime.seasons?.reduce((acc, s) => acc + s.watchedEpisodes.length, 0) || 0;
            const totalEpisodes = anime.seasons?.reduce((acc, s) => acc + s.totalEpisodes, 0) || 0;
            const progress = totalEpisodes > 0 ? Math.round((totalWatched / totalEpisodes) * 100) : 0;

            return (
              <div
                key={anime._id}
                className={`group relative transition-all duration-700 animate-in fade-in slide-in-from-bottom-12 fill-mode-backwards`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`relative bg-black border border-white/[0.08] rounded-[3.5rem] overflow-hidden transition-all duration-700 ${isExpanded ? 'shadow-[0_40px_100px_-20px_rgba(239,68,68,0.2)] border-red-600/40 ring-4 ring-red-600/5' : 'hover:border-white/20 hover:-translate-y-3 hover:shadow-4xl'} flex flex-col`}>

                  {/* DOSSIER BACKGROUND (HUD LAYER) */}
                  <div className="relative h-56 md:h-64 w-full overflow-hidden">
                    <img src={anime.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" alt="" />

                    {/* OVERLAYS */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"></div>

                    {/* TACTICAL ELEMENTS */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                      <div className="flex flex-col gap-1">
                        <div className="text-[7px] font-mono font-black text-white/30 tracking-[0.4em] uppercase">SYNC_NODE_{anime._id.slice(-4).toUpperCase()}</div>
                        <div className={`px-4 py-1.5 rounded-full backdrop-blur-3xl border text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 ${progress === 100 ? 'bg-green-600/20 border-green-500/40 text-green-500' : 'bg-red-600/20 border-red-600/40 text-red-500'}`}>
                          {progress}% RESONANCE
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(anime)}
                          className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-gray-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all active:scale-90 flex items-center justify-center shadow-2xl"
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(anime._id)}
                          className="w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-600/50 hover:bg-red-600/10 transition-all active:scale-90 flex items-center justify-center shadow-2xl"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <h3 className="text-white font-shonen text-2xl md:text-4xl leading-none uppercase tracking-tighter drop-shadow-impact drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-3 line-clamp-1 group-hover:text-red-500 transition-colors">
                        {anime.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10"></div>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em] font-mono">ID_CHRONICLE_01</span>
                      </div>
                    </div>

                    {/* Scanline Mask */}
                    <div className="absolute inset-0 scanline-mask opacity-[0.08] pointer-events-none"></div>
                  </div>

                  {/* ACTION MODULE */}
                  <div className="p-8 pb-10 flex flex-col gap-8 relative z-20">
                    <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.03] border border-white/5 rounded-[2.5rem]">
                      <StatusNode active={anime.status === "Watching"} icon={<PlayIcon className="w-4 h-4" />} label="ACTIVE" onClick={() => handleStatus(anime._id, "Watching")} />
                      <StatusNode active={anime.status === "Completed"} icon={<CheckIcon className="w-4 h-4" />} label="FINISHED" onClick={() => handleStatus(anime._id, "Completed")} />
                      <StatusNode active={anime.status === "Plan to Watch"} icon={<PlusIcon className="w-4 h-4" />} label="LOCKED" onClick={() => handleStatus(anime._id, "Plan to Watch")} />
                      <StatusNode active={anime.status === "On Hold"} icon={<PauseIcon className="w-4 h-4" />} label="PAUSED" onClick={() => handleStatus(anime._id, "On Hold")} />
                    </div>

                    <SagaButton
                      variant={isExpanded ? "primary" : "outline"}
                      size="lg"
                      className={`w-full py-5 rounded-3xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-impact ${isExpanded ? 'h-16' : 'hover:border-red-600/50 hover:bg-red-600/[0.03]'}`}
                      onClick={() => setExpandedAnime(isExpanded ? null : anime._id)}
                    >
                      {isExpanded ? "--- CLOSE CHRONICLE ---" : "UNFOLD DATA CHAPTERS →"}
                    </SagaButton>
                  </div>

                  {/* TACTICAL UNFOLDING AREA */}
                  {isExpanded && (
                    <div className="bg-white/[0.02] border-t border-white/5 p-8 md:p-10 animate-in slide-in-from-top-12 duration-700 ease-out fill-mode-backwards">
                      <div className="flex justify-between items-end mb-10">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em] flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            Synchronized Chapters
                          </div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">MANUAL_SYNC_ENABLED</p>
                        </div>
                        <button
                          onClick={() => handleResetProgress(anime._id)}
                          className="px-5 py-2 rounded-xl text-[8px] font-black uppercase text-white/30 tracking-widest border border-white/5 hover:border-red-600/40 hover:text-red-500 transition-all active:scale-90"
                        >
                          PURGE RECORDS
                        </button>
                      </div>

                      {/* DOSSIER SEASONS TABS */}
                      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-3">
                        {anime.seasons.map((s) => (
                          <button
                            key={s.seasonNumber}
                            onClick={() => setActiveSeason({ ...activeSeason, [anime._id]: s.seasonNumber })}
                            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border-2 transition-all duration-500 flex items-center justify-center min-w-[100px] ${season === s.seasonNumber ? 'bg-red-600 border-red-600 text-white shadow-neon-red scale-105' : 'bg-black/40 border-white/10 text-gray-500 hover:border-red-600/30 hover:text-white/60'}`}
                          >
                            SEC_{s.seasonNumber < 10 ? `0${s.seasonNumber}` : s.seasonNumber}
                          </button>
                        ))}
                      </div>

                      {/* CHAPTER GRID (EPISODES) */}
                      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-3 max-h-72 overflow-y-auto pr-2 no-scrollbar p-2">
                        {seasonData?.totalEpisodes && Array.from({ length: seasonData.totalEpisodes }, (_, i) => i + 1).map((ep) => {
                          const watched = seasonData.watchedEpisodes.includes(ep);
                          return (
                            <button
                              key={ep}
                              onClick={() => handleEpisodeToggle(anime._id, season, ep)}
                              className={`aspect-square rounded-2xl border-2 text-[10px] md:text-[11px] font-bold transition-all duration-500 flex items-center justify-center relative group/ep ${watched ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-[0.95]' : 'bg-white/[0.02] border-white/[0.05] text-white/20 hover:border-red-600/40 hover:text-red-500 hover:bg-red-600/5 hover:scale-110 active:scale-90'}`}
                            >
                              {ep}
                              {watched && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* SEQUEL HUNTER HUD */}
                      <div className="mt-12 pt-8 border-t border-white/5">
                        <SagaButton
                          v="ghost"
                          size="sm"
                          onClick={() => handleFindSequel(anime)}
                          className="w-full h-14 bg-white/[0.01] border-white/5 group-hover:border-red-600/20 text-[9px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white"
                          loading={checkingSequel[anime._id]}
                        >
                          SCAN FOR SEQUEL CONTINUUM →
                        </SagaButton>
                      </div>
                    </div>
                  )}
                </div>

                {/* Corner Accents */}
                {!isExpanded && (
                  <>
                    <div className="absolute top-4 left-4 w-6 h-6 border-t font-mono text-[6px] text-white/10 pointer-events-none">SYNC_01</div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b font-mono text-[6px] text-white/10 pointer-events-none text-right">SEC_OK</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ⛩️ EMPTY STATE ARCHIVE */}
        {!watchlistLoading && filteredWatchlist.length === 0 && (
          <div className="mt-20 md:mt-32 p-16 md:p-32 text-center border-4 border-dashed border-white/5 rounded-[4rem] md:rounded-[6rem] bg-white/[0.01] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-1000 relative group">
            <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-[6rem]"></div>

            <div className="relative z-10">
              <div className="text-[10rem] md:text-[15rem] mb-12 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000 filter grayscale">⛩️</div>
              <h3 className="text-shonen-bold text-4xl md:text-8xl mb-6 uppercase tracking-tighter text-white drop-shadow-impact">Dormant Sector</h3>
              <p className="text-gray-500 mb-16 max-w-xl mx-auto text-sm md:text-2xl italic font-medium opacity-60 leading-relaxed px-6">
                "The chronicles remain unwritten. Initialize deep synchronization to index your first saga and forge your legend in the archives."
              </p>
              <SagaButton variant="primary" size="xl" onClick={() => { setQuery(""); setActiveFilter("All"); }} className="shadow-neon-red px-16 h-20 md:h-24 rounded-full text-base md:text-xl relative overflow-hidden group/btn">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                INITIALIZE ARCHIVAL SEARCH
              </SagaButton>
            </div>
          </div>
        )}
      </div>

      {/* 🛠️ EDIT MODULE (RECONFIG) */}
      <BottomSheet isOpen={!!editingAnime} onClose={() => setEditingAnime(null)} title="RECONFIGURE ARCHIVE PARAMETERS">
        <div className="relative pb-10 px-4 md:px-0">
          <div className="flex items-start gap-6 p-6 bg-red-600/5 rounded-3xl border border-red-600/10 mb-12 animate-in slide-in-from-left-8 duration-500">
            <div className="w-1.5 h-16 bg-red-600 rounded-full"></div>
            <div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-2">INTELLIGENCE_BRIEF</span>
              <p className="text-xs md:text-base font-medium text-white/60 italic leading-relaxed">
                "You are reconfiguring the structural metadata for the chronicle: <span className="text-white font-black uppercase not-italic">[{editingAnime?.title}]</span>. Ensure synchronization metrics align with current archive records."
              </p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Temporal Segments (Seasons)</label>
              <SagaInput type="number" value={editForm.totalSeasons} onChange={e => setEditForm({ ...editForm, totalSeasons: Number(e.target.value) })} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2">Chapter Count (Eps/Season)</label>
              <SagaInput type="number" value={editForm.episodesPerSeason} onChange={e => setEditForm({ ...editForm, episodesPerSeason: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-16 pt-10 border-t border-white/5 font-mono">
            <SagaButton variant="ghost" size="lg" className="flex-1 h-16 border-white/5" onClick={() => setEditingAnime(null)}>ABORT_TRANSMISSION</SagaButton>
            <SagaButton variant="primary" size="lg" className="flex-1 h-16 shadow-impact font-black" onClick={handleEditSubmit}>DEPLOY_SYNC_LEGEND</SagaButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function StatusNode({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center h-14 rounded-3xl transition-all duration-500 relative group/node ${active ? 'bg-red-600 shadow-impact text-white scale-105 z-10' : 'text-white/20 hover:bg-white/[0.04] hover:text-white/60 active:scale-95'}`}
    >
      <span className={`transition-transform duration-500 ${active ? 'scale-110 rotate-3' : 'group-hover/node:scale-125'}`}>{icon}</span>
      <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap ${active ? 'opacity-100 md:-bottom-10' : 'group-hover/node:opacity-40'}`}>
        PROTOCOL_{label}
      </span>
      {active && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-red-600/50 animate-pulse"></div>
      )}
    </button>
  );
}

function ActionIcon({ icon, onClick, color = "hover:bg-[var(--saga-surface-hover)] hover:text-[var(--saga-text)]" }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--saga-border)] text-[var(--saga-text-dim)] transition-all ${color}`}
    >
      <span className="text-xs">{icon}</span>
    </button>
  );
}

// Additional icons needed for StatusPill
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
);
