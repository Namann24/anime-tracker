import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import SagaButton from "../components/common/SagaButton";
import SagaSkeleton from "../components/common/SagaSkeleton";
import UserAvatar from "../components/common/UserAvatar";
import { getAiringAnime } from "../services/animeService";

export default function Dashboard() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  const [activeMission, setActiveMission] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [neuralPulse, setNeuralPulse] = useState([]);

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        if (watchlist && watchlist.length > 0) {
          const watching = watchlist.filter(a => a.status === "Watching");
          if (watching.length > 0) {
            setActiveMission(watching[0]);
            setContinueWatching(watching.slice(1));
          } else {
            const planned = watchlist.filter(a => a.status === "Plan to Watch");
            if (planned.length > 0) setActiveMission(planned[0]);
          }
        }

        const trendingData = await getAiringAnime(4);
        setTrending(trendingData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    const interval = setInterval(() => {
      const logs = ["SATELLITE_UPLINK_SYNC", "NEURAL_STREAM_STABLE", "ARCHIVE_INDEX_COMPLETE", "PROTOCOL_V3_ACTIVE", "ENCRYPTION_KEY_ROTATED"];
      const newLog = {
        id: Date.now(),
        msg: logs[Math.floor(Math.random() * logs.length)],
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      setNeuralPulse(prev => [newLog, ...prev].slice(0, 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [watchlist]);

  const calculateProgress = (anime) => {
    if (!anime || !anime.seasons) return 0;
    const totalWatched = anime.seasons.reduce((acc, s) => acc + (s.watchedEpisodes?.length || 0), 0);
    const totalEps = anime.episodes || anime.seasons.reduce((acc, s) => acc + (s.totalEpisodes || 0), 0) || 12;
    return Math.min(100, Math.round((totalWatched / totalEps) * 100));
  };

  const getNextEpisode = (anime) => {
    if (!anime || !anime.seasons) return 1;
    const totalWatched = anime.seasons.reduce((acc, s) => acc + (s.watchedEpisodes?.length || 0), 0);
    return totalWatched + 1;
  }

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden transition-colors duration-500">
      <section className="relative h-[85vh] w-full overflow-hidden flex items-end pb-20 px-6 md:px-12">
        {loading ? (
          <div className="w-full max-w-4xl">
            <SagaSkeleton type="hero" />
          </div>
        ) : activeMission ? (
          <>
            <div className="absolute inset-0 z-0">
              <img
                src={activeMission.image}
                className="w-full h-full object-cover opacity-60 scale-105 blur-sm"
                alt="Background"
                onError={(e) => { e.target.src = "https://placehold.co/1200x800/1a1a1a/ef4444?text=Mission+Data+Lost"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--saga-background)] via-[var(--saga-background)]/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--saga-background)] via-[var(--saga-background)]/50 to-transparent"></div>
              <div className="absolute inset-0 halftone opacity-[0.05]"></div>
            </div>

            <div className="relative z-10 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="absolute -top-32 left-0 space-y-2 pointer-events-none hidden md:block border-l border-red-600/20 pl-4 py-2">
                {neuralPulse.map(log => (
                  <div key={log.id} className="text-[9px] font-mono text-red-500/40 animate-in fade-in slide-in-from-left-4">
                    <span className="mr-2">[{log.time}]</span>
                    <span>{log.msg}...</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-neon-red animate-pulse">
                  Priority Alpha
                </div>
                <div className="w-px h-4 bg-[var(--saga-text)]/20"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Episode {getNextEpisode(activeMission)} Ready
                </span>
              </div>

              <h1 className="text-shonen-bold text-6xl md:text-8xl lg:text-9xl text-[var(--saga-text)] leading-[0.85] mb-8 text-glow">
                {activeMission.title}
              </h1>

              <div className="flex flex-wrap gap-6 items-center">
                <SagaButton v="primary" size="xl" onClick={() => navigate(`/anime/${activeMission.mal_id}`)} className="shadow-neon-red hover:scale-105">
                  <span className="mr-3">▶</span> Resume Session
                </SagaButton>

                <div className="hidden sm:flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--saga-text-dim)] mb-2">Sync Status</span>
                  <div className="w-48 h-1.5 bg-[var(--saga-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{ width: `${calculateProgress(activeMission)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 animate-in fade-in zoom-in duration-1000 px-6">
            <h1 className="text-shonen-bold text-6xl text-[var(--saga-text)] mb-6">NO ACTIVE MISSIONS</h1>
            <p className="text-[var(--saga-text-dim)] mb-8 max-w-md italic">Your command log is empty. Initiate a new saga to populate the command center.</p>
            <SagaButton v="primary" onClick={() => navigate("/search")}>Discover New Intel</SagaButton>
          </div>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 -mt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-shonen-bold text-2xl text-[var(--saga-text)] flex items-center gap-3">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            SECONDARY OPERATIONS
          </h2>
          <Link to="/watchlist" className="text-[10px] font-black text-[var(--saga-text-dim)] hover:text-red-500 transition-colors uppercase tracking-widest">
            View Archive →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SagaSkeleton key={i} type="card" className="aspect-[16/10]" />)}
          </div>
        ) : continueWatching.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {continueWatching.map(anime => (
              <div key={anime._id} onClick={() => navigate(`/anime/${anime.mal_id}`)} className="group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--saga-border)] group-hover:border-red-600/50 transition-all duration-500 shadow-lg group-hover:shadow-neon-red bg-[var(--saga-surface)]">
                  <img src={anime.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110" alt="" onError={(e) => { e.target.src = "https://placehold.co/600x400/1a1a1a/ef4444?text=Signal+Lost"; }} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 group-hover:text-red-400 transition-colors">{anime.title}</h3>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/search" className="flex flex-col items-center justify-center aspect-[16/10] rounded-2xl border-2 border-dashed border-[var(--saga-border)] bg-[var(--saga-surface)] hover:border-red-600/30 hover:bg-[var(--saga-surface-hover)] transition-all group">
              <div className="w-12 h-12 rounded-full bg-[var(--saga-glass-bg)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl text-[var(--saga-text-dim)] group-hover:text-[var(--saga-text)]">+</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)] group-hover:text-[var(--saga-text)]">Add Operation</span>
            </Link>
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-[var(--saga-border)] rounded-3xl text-center bg-[var(--saga-surface)]">
            <p className="text-[var(--saga-text-dim)] font-bold text-sm italic">No secondary missions. Focus on the primary objective.</p>
          </div>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-6 md:px-12 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TerminalButton title="Temporal Grid" subtitle="View Schedule" icon="📅" onClick={() => navigate("/schedule")} color="text-blue-500" />
          <TerminalButton title="League Rankings" subtitle="View Leaderboard" icon="🏆" onClick={() => navigate("/leaderboard")} color="text-yellow-500" />
          <TerminalButton title="Feeling Lucky" subtitle="Random Access" icon="🎲" onClick={() => navigate("/search?sort=random")} color="text-purple-500" />
          <TerminalButton title="Archive" subtitle="View Watchlist" icon="⚔️" onClick={() => navigate("/watchlist")} color="text-red-500" />
        </div>
      </section>
    </div>
  );
}

function TerminalButton({ title, subtitle, icon, onClick, color }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-6 rounded-2xl border border-[var(--saga-border)] bg-[var(--saga-surface)] hover:border-red-600/30 transition-all group text-left">
      <div className={`text-3xl grayscale group-hover:grayscale-0 transition-all ${color}`}>{icon}</div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--saga-text-dim)] group-hover:text-red-500 transition-colors">{subtitle}</div>
        <div className="text-base font-bold text-[var(--saga-text)]">{title}</div>
      </div>
    </button>
  );
}
