import { useEffect, useState } from "react";
import {

  getWatchlist,
  updateWatchStatus,
  toggleEpisode,
  updateWatchlistDetails,
  resetWatchlist
} from "../services/watchlistService";

import { searchAnime, getAnimeRelations, getAnimeById } from "../services/animeService";
import { useWatchlist } from "../context/WatchlistContext";
import { useNavigate } from "react-router-dom";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaSelect from "../components/common/SagaSelect";
import { useToast } from "../context/ToastContext";
import SagaSkeleton from "../components/common/SagaSkeleton";

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

  return (
    <div className="min-h-screen text-[var(--saga-text)] pb-20 overflow-x-hidden transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* COMMAND HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pt-32 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/30 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 w-fit animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              Live Tracking Interface
            </div>
            <h1 className="text-shonen-bold text-5xl md:text-7xl lg:text-8xl mb-2 leading-none animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              COMMAND <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-glow">CHRONICLES.</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium italic animate-in fade-in slide-in-from-left-12 duration-700 delay-200">
              "Every episode watched is a chapter carved into your legend."
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 bg-[var(--saga-glass-bg)] border border-[var(--saga-border)] px-6 py-3 rounded-2xl">
              <span className="text-red-600 text-2xl mr-2">{filteredWatchlist.length}</span> Sagas Tracked
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid lg:grid-cols-12 gap-6 mb-12 items-start">
          <div className="lg:col-span-8 relative z-30">
            <div className="flex-1 w-full bg-transparent flex items-center h-16 group relative mb-4">
              {/* Underline Effect */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--saga-text-dim)]/20 group-focus-within:bg-red-600 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 group-focus-within:w-full transition-all duration-700 ease-out"></div>

              <div className="text-red-500/50 mr-4 group-focus-within:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                placeholder="Search for new sagas to track..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent text-xl font-light text-[var(--saga-text)] placeholder-[var(--saga-text-dim)]/50 outline-none tracking-wide font-sans translate-y-[-2px]"
              />
            </div>

            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 saga-glass border border-[var(--saga-border)] rounded-2xl shadow-2xl p-2 max-h-[350px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200 no-scrollbar">
                {results.map((a) => (
                  <div
                    key={a.mal_id}
                    onClick={() => !isInWatchlist(a.mal_id) && handleAdd(a)}
                    className={`p-3 rounded-xl transition flex gap-4 items-center mb-1 border ${isInWatchlist(a.mal_id)
                      ? 'bg-green-600/10 border-green-600/30 cursor-not-allowed'
                      : 'hover:bg-red-600/5 border-transparent hover:border-red-600/20 cursor-pointer group/item'
                      }`}
                  >
                    <img src={a.images?.jpg?.small_image_url} className="w-10 h-14 object-cover rounded shadow-md" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--saga-text)] truncate text-sm">{a.title}</div>
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{a.type} • {a.episodes || '?'} EPS</div>
                    </div>
                    {isInWatchlist(a.mal_id) ? (
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Added</span>
                      </div>
                    ) : isAdding === a.mal_id ? (
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <SagaButton variant="ghost" size="sm" className="opacity-0 group-hover/item:opacity-100">Add</SagaButton>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex gap-3">
            <div className="flex-1">
              <SagaSelect
                value={activeFilter}
                options={["All", "Watching", "Completed", "Plan to Watch", "On Hold", "Dropped"]}
                onChange={setActiveFilter}
              />
            </div>
          </div>
        </div>

        {/* CHRONICLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {watchlistLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--saga-surface)] rounded-[2rem] h-[300px] border border-[var(--saga-border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--saga-surface-hover)] to-transparent -translate-x-full animate-shimmer"></div>
              </div>
            ))
          ) : filteredWatchlist.map((anime) => {
            const season = activeSeason[anime._id] ?? anime.seasons?.[0]?.seasonNumber;
            const seasonData = anime.seasons.find(s => s.seasonNumber === season);
            const totalWatched = anime.seasons?.reduce((acc, s) => acc + s.watchedEpisodes.length, 0) || 0;
            const totalEpisodes = anime.seasons?.reduce((acc, s) => acc + s.totalEpisodes, 0) || 0;
            const progress = totalEpisodes > 0 ? Math.round((totalWatched / totalEpisodes) * 100) : 0;
            const isExpanded = expandedAnime === anime._id;

            return (
              <div key={anime._id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-transparent rounded-[2rem] blur-sm opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative bg-[var(--saga-surface)] border-4 border-black rounded-[2rem] overflow-hidden shadow-impact transition-all duration-500 hover:-translate-y-2 hover:shadow-pulse">
                  {/* Decorative Manga Line */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-600 z-10 pointer-events-none"></div>

                  {/* Card Content Wrapper */}
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Visual Section */}
                    <div
                      className="relative w-full sm:w-40 h-56 sm:h-auto overflow-hidden flex-shrink-0 cursor-pointer group/img border-r-4 border-black"
                      onClick={() => navigate(`/anime/${anime.mal_id}`)}
                    >
                      <img src={anime.image} className="w-full h-full object-cover transition-all duration-1000 group-hover/img:scale-110 grayscale group-hover/img:grayscale-0" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                      {/* Percent Badge */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-[0.2em] z-10 border-2 border-black">
                        {progress}%
                      </div>
                    </div>

                    {/* Data Section */}
                    <div className="p-8 flex-1 flex flex-col justify-between min-w-0 bg-white/5">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></span>
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">
                            STATUS: {anime.status}
                          </span>
                        </div>
                        <h3 className="text-[var(--saga-text)] font-black text-xl truncate mb-3 group-hover:text-red-500 transition-colors uppercase tracking-tight leading-tight">
                          {anime.title}
                        </h3>

                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                            <span>Progress</span>
                            <span className="text-[var(--saga-text)]">{totalWatched} / {totalEpisodes}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[var(--saga-border)]/20 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(255,0,60,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <SagaButton
                          variant={isExpanded ? "secondary" : "primary"}
                          size="md"
                          className="w-full text-[10px] py-3 rounded-xl shadow-impact"
                          onClick={() => setExpandedAnime(isExpanded ? null : anime._id)}
                        >
                          {isExpanded ? "Seal Records" : "Access Chapters"}
                        </SagaButton>

                        <div className="flex flex-wrap gap-2 items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            <StatusPill active={anime.status === "Watching"} icon={<PlayIcon className="w-4 h-4" />} label="Active" onClick={() => handleStatus(anime._id, "Watching")} />
                            <StatusPill active={anime.status === "Completed"} icon={<CheckIcon className="w-4 h-4" />} label="End" onClick={() => handleStatus(anime._id, "Completed")} />
                            <StatusPill active={anime.status === "Plan to Watch"} icon={<PlusIcon className="w-4 h-4" />} label="Later" onClick={() => handleStatus(anime._id, "Plan to Watch")} />
                            <StatusPill active={anime.status === "On Hold"} icon={<PauseIcon className="w-4 h-4" />} label="Wait" onClick={() => handleStatus(anime._id, "On Hold")} />
                            <StatusPill active={anime.status === "Dropped"} icon={<XIcon className="w-4 h-4" />} label="Drop" onClick={() => handleStatus(anime._id, "Dropped")} />
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <ActionIcon icon={<SettingsIcon className="w-4 h-4" />} onClick={() => openEditModal(anime)} />
                            <ActionIcon icon={<TrashIcon className="w-4 h-4" />} onClick={() => handleRemove(anime._id)} color="hover:bg-red-600/20 hover:text-red-500 border-red-600/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expansion Area */}
                  {isExpanded && (
                    <div className="border-t border-[var(--saga-border)] bg-black/5 p-6 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Accessing Chapters</span>
                        <div className="flex gap-3">
                          <button onClick={() => handleResetProgress(anime._id)} className="text-[8px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors">Reset</button>
                          <button onClick={() => handleFindSequel(anime)} disabled={checkingSequel[anime._id]} className="text-[8px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors">
                            {checkingSequel[anime._id] ? "Scanning..." : "Sequels?"}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                        {anime.seasons.map((s) => (
                          <button
                            key={s.seasonNumber}
                            onClick={() => setActiveSeason({ ...activeSeason, [anime._id]: s.seasonNumber })}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${season === s.seasonNumber ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[var(--saga-surface)] border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:border-red-600/30'}`}
                          >
                            SS {s.seasonNumber}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-8 xl:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                        {seasonData?.totalEpisodes && Array.from({ length: seasonData.totalEpisodes }, (_, i) => i + 1).map((ep) => {
                          const watched = seasonData.watchedEpisodes.includes(ep);
                          return (
                            <button
                              key={ep}
                              onClick={() => handleEpisodeToggle(anime._id, season, ep)}
                              className={`aspect-square rounded-lg border text-[9px] font-black transition-all ${watched ? 'bg-red-600 border-red-600 text-white shadow-inner' : 'bg-[var(--saga-surface)] border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:border-red-600/50'}`}
                            >
                              {ep}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {!watchlistLoading && filteredWatchlist.length === 0 && (
          <div className="mt-16 p-20 text-center border-2 border-dashed border-[var(--saga-border)] rounded-[3rem] bg-[var(--saga-surface)]/20">
            <div className="text-7xl mb-6 opacity-20">⛩️</div>
            <h3 className="text-shonen-bold text-3xl mb-3 uppercase tracking-tighter text-[var(--saga-text)]">THE ARCHIVE IS EMPTY</h3>
            <p className="text-[var(--saga-text-dim)] mb-10 max-w-sm mx-auto text-sm italic">"The ink has not yet touched this page. Start searching above to expand your chronicles."</p>
            <SagaButton variant="primary" size="lg" onClick={() => { setQuery(""); setActiveFilter("All"); }}>View All Chronicles</SagaButton>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingAnime && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[var(--saga-surface)] border border-[var(--saga-border)] rounded-3xl p-10 relative shadow-2xl overflow-hidden">
            <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>
            <h3 className="text-shonen-bold text-3xl mb-1 uppercase tracking-tighter text-[var(--saga-text)]">RECONFIGURE SAGA</h3>
            <p className="text-[9px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest mb-10">Adjust metrics for: {editingAnime.title}</p>

            <div className="space-y-6">
              <SagaInput
                label="Total Seasons"
                type="number"
                value={editForm.totalSeasons}
                onChange={e => setEditForm({ ...editForm, totalSeasons: Number(e.target.value) })}
              />
              <SagaInput
                label="Episodes Per Season"
                type="number"
                value={editForm.episodesPerSeason}
                onChange={e => setEditForm({ ...editForm, episodesPerSeason: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-3 mt-10 pt-8 border-t border-[var(--saga-border)]">
              <SagaButton variant="ghost" size="lg" className="flex-1" onClick={() => setEditingAnime(null)}>Cancel</SagaButton>
              <SagaButton variant="primary" size="lg" className="flex-1" onClick={handleEditSubmit}>Sync Legend</SagaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative group/pill w-10 h-10 flex flex-col items-center justify-center rounded-xl border transition-all ${active ? 'bg-red-600 border-red-600 text-white shadow-lg scale-110 z-10' : 'bg-[var(--saga-surface)] border-[var(--saga-border)] text-[var(--saga-text-dim)] hover:border-red-600/30 hover:bg-red-600/5 hover:text-red-500'}`}
    >
      <span className="text-xs">{icon}</span>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/pill:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-[6px] font-black px-1 rounded uppercase tracking-tighter shadow-xl border border-white/10">
        {label}
      </span>
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
