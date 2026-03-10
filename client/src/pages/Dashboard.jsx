import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import SagaButton from "../components/common/SagaButton";
import SagaSkeleton from "../components/common/SagaSkeleton";
import UserAvatar from "../components/common/UserAvatar";
import { getRandomAnime } from "../services/animeService";

export default function Dashboard() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  const [activeMission, setActiveMission] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drifting, setDrifting] = useState(false);

  useEffect(() => {
    let isMounted = true;
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
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initDashboard();
    return () => { isMounted = false; };
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

  const handleFeelingLucky = async () => {
    if (drifting) return;
    setDrifting(true);
    try {
      const random = await getRandomAnime();
      if (random && random.mal_id) {
        navigate(`/anime/${random.mal_id}`);
      }
    } catch (err) {
      console.error("Failed to drift into random saga:", err);
      setDrifting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden transition-colors duration-700 saga-animate-in bg-transparent selection:bg-red-500/30">
      {/* 🌌 AMBIENT CORE */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-red-600/10 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* 🚀 ELITE COMMAND HERO */}
      <section className="relative pt-20 md:pt-32 pb-8 md:pb-12 transition-all duration-700">
        <div className="layout-shell">
          <div className="relative min-h-[45vh] md:min-h-[65vh] lg:h-[70vh] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-3xl bg-saga-surface/30 backdrop-blur-sm group/hero transition-all duration-500 hover:border-red-600/20">
          {loading ? (
            <div className="w-full h-full">
              <SagaSkeleton type="hero" />
            </div>
          ) : activeMission ? (
            <>
              <div className="absolute inset-0 z-0">
                <img
                  src={activeMission.image}
                  className="w-full h-full object-cover scale-105 animate-slow-zoom brightness-[0.7] contrast-[1.1]"
                  alt="Background"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x800/1a1a1a/ef4444?text=Mission+Data+Lost"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--saga-background)] via-[var(--saga-background)]/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--saga-background)] via-[var(--saga-background)]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(239,68,68,0.15),transparent_60%)]"></div>
                <div className="absolute inset-0 scanline-mask opacity-[0.12]"></div>
              </div>

              <div className="relative z-10 w-full h-full flex items-center p-6 md:p-8 lg:p-20">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">

                  {/* LEFT: MISSION INTEL */}
                  <div className="lg:col-span-8 space-y-4 md:space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000 ease-out">
                    <div className="flex flex-wrap items-center gap-3 md:gap-5">
                      <div className="flex items-center gap-3 px-3 py-1.5 md:px-5 md:py-2 bg-red-600/15 border border-red-600/30 rounded-full backdrop-blur-xl">
                        <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] text-red-500">Alpha Priority</span>
                      </div>
                      <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/40 font-mono">
                        <span className="text-red-600/50 mr-2 opacity-50">CMD_HUB:</span>
                        ACTIVE
                      </div>
                    </div>

                    <div className="space-y-1 md:space-y-4">
                      <h1 className="font-shonen text-2xl md:text-6xl lg:text-[7.5rem] leading-[1] md:leading-[0.85] tracking-tighter">
                        <span className="text-white block opacity-60 text-xs md:text-base font-black tracking-widest mb-1">COMMANDING SESSION:</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.3)] line-clamp-2 md:line-clamp-none">
                          {activeMission.title}
                        </span>
                      </h1>

                      <div className="flex flex-col md:flex-row flex-wrap md:items-center gap-4 md:gap-8 pt-4 md:pt-1">
                        <div className="flex flex-col w-full md:w-auto">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-red-500/80">Neural Sync</span>
                            <span className="text-[9px] md:text-[10px] font-mono text-white/40">{calculateProgress(activeMission)}%</span>
                          </div>
                          <div className="w-full md:w-[400px] h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/5 relative">
                            <div className="h-full bg-gradient-to-r from-red-600 via-white to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-[1500ms] ease-out rounded-full" style={{ width: `${calculateProgress(activeMission)}%` }}></div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-between items-center md:items-start p-3 md:p-0 bg-white/[0.03] md:bg-transparent rounded-2xl border border-white/5 md:border-0">
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-0 md:mb-2">Target Data</span>
                          <span className="text-xl md:text-3xl font-black text-white italic">EP {getNextEpisode(activeMission)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-6">
                      <SagaButton v="primary" size="lg" onClick={() => navigate(`/anime/${activeMission.mal_id}`)} className="shadow-impact group w-full md:w-auto px-10 h-14 relative overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] md:text-[11px] tracking-[0.2em] font-black">
                          RE-ENGAGE SYSTEM
                        </span>
                      </SagaButton>
                      <SagaButton v="outline" size="lg" onClick={() => navigate("/watchlist")} className="w-full md:w-auto px-10 h-14 bg-white/[0.03] border-white/10 text-[10px] md:text-[11px] tracking-[0.2em] font-black">
                        VIEW ARCHIVES
                      </SagaButton>
                    </div>
                  </div>

                  {/* RIGHT: TACTICAL TELEMETRY */}
                  <div className="lg:col-span-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 hidden md:block">
                    <TacticalTelemetry />
                    <UserIdentityCard user={user} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center min-h-[45vh]">
              <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-20"></div>
              <div className="w-20 h-20 md:w-32 md:h-32 mb-8 rounded-[2rem] border-2 border-dashed border-red-600/30 flex items-center justify-center relative group">
                <span className="text-4xl md:text-6xl animate-pulse grayscale opacity-40">📡</span>
              </div>
              <h2 className="text-shonen-bold text-3xl md:text-6xl text-white uppercase tracking-tighter mb-4">TACTICAL_HQ // <span className="text-red-600">NULL</span></h2>
              <p className="text-[10px] md:text-sm font-black text-white/30 uppercase tracking-[0.5em] mb-10 max-w-xs">No active sagas detected in primary core. Initializing deep discovery...</p>
              <SagaButton v="primary" size="lg" onClick={() => navigate("/search")} className="px-12 h-14 shadow-neon-red">
                DISCOVER SAGA
              </SagaButton>
            </div>
          )}
        </div>
      </div>
    </section>

    {/* 📊 OPERATIONS GRID */}
    <section className="mt-12 md:mt-24 relative z-20">
      <div className="layout-shell">
        <div className="flex items-center gap-4 md:gap-6 mb-10">
          <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-neon-red"></div>
          <div>
            <h2 className="text-shonen-bold text-3xl md:text-4xl text-white uppercase tracking-tighter leading-none mb-1">Mission Log</h2>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20">SYSTEM_OPERATIONS_FEED</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SagaSkeleton key={i} type="card" className="aspect-[16/10]" />)}
          </div>
        ) : continueWatching.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {continueWatching.map(anime => (
              <div
                key={anime._id}
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                className="group cursor-pointer relative"
              >
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-red-600/50">
                  <img src={anime.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-white font-black text-[13px] uppercase tracking-wider mb-2 line-clamp-1">{anime.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">EP {getNextEpisode(anime)} READY</span>
                      <span className="text-[9px] font-mono text-white/40">{calculateProgress(anime)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/search" className="flex flex-col items-center justify-center aspect-[16/10] rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-red-600/40 hover:bg-red-600/[0.03] transition-all group">
              <span className="text-2xl text-white/20 group-hover:text-red-500 mb-2 transition-colors">+</span>
              <span className="text-[10px] font-black text-white/20 group-hover:text-white uppercase tracking-widest transition-colors">ADD COMMAND</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col justify-center">
              <span className="text-[10px] font-black text-red-600 tracking-widest uppercase mb-2">SYSTEM_ALERT</span>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Secondary Core Dormant</h4>
              <p className="text-xs text-white/40 italic mb-8">No secondary missions indexed. Sync with the global grid to populate your tactical telemetry.</p>
              <SagaButton v="ghost" size="sm" onClick={() => navigate("/search")} className="w-fit">SEARCH_REGISTRY →</SagaButton>
            </div>
            <div className="aspect-[16/10] bg-red-600/5 border border-red-600/20 rounded-[2.5rem] p-8 flex flex-col items-end justify-between group">
              <Activity className="w-6 h-6 text-red-600 animate-pulse" />
              <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] text-right">Awaiting Integration</span>
            </div>
            <div className="aspect-[16/10] bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-start justify-between">
              <div className="w-2 h-2 rounded-full bg-white/10"></div>
              <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Module_Inert</span>
            </div>
          </div>
        )}
      </div>
    </section>

    {/* ⚡ RAPID ACCESS */}
    <section className="mt-12 md:mt-28 relative z-20">
      <div className="layout-shell">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TerminalNode title="Temporal Grid" icon="🗓️" path="/schedule" />
          <TerminalNode title="Elite League" icon="🎖️" path="/leaderboard" />
          <TerminalNode title="Neural Drift" icon="🎲" onClick={handleFeelingLucky} loading={drifting} />
          <TerminalNode title="Master Archive" icon="📂" path="/watchlist" />
        </div>
      </div>
    </section>
  </div>
);
}

function TerminalNode({ title, icon, path, onClick, loading }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={onClick || (() => navigate(path))}
      disabled={loading}
      className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:border-red-600/40 hover:bg-white/[0.06] transition-all group flex flex-col gap-4 text-left"
    >
      <span className="text-3xl opacity-20 group-hover:opacity-100 transition-opacity group-hover:scale-110 origin-left inline-block">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 group-hover:text-red-500 transition-colors">NODE_ACCESS</span>
        <span className="text-[13px] font-black text-white uppercase tracking-tight">{title}</span>
      </div>
    </button>
  );
}

function TacticalTelemetry() {
  const [neuralPulse, setNeuralPulse] = useState([]);
  const [waveform, setWaveform] = useState(Array.from({ length: 20 }, () => Math.random()));

  useEffect(() => {
    const interval = setInterval(() => {
      const logs = [
        "SATELLITE_UPLINK_SYNC",
        "NEURAL_STREAM_STABLE",
        "ARCHIVE_INDEX_COMPLETE",
        "PROTOCOL_V3_ACTIVE",
        "ENCRYPTION_KEY_ROTATED",
        "DATABASE_RELAY_ESTABLISHED",
        "AETHER_CORE_OPTIMIZED"
      ];
      const newLog = {
        id: Date.now(),
        msg: logs[Math.floor(Math.random() * logs.length)],
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setNeuralPulse(prev => [newLog, ...prev].slice(0, 5));
      setWaveform(prev => [...prev.slice(1), Math.random()]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-[32px] relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(239,68,68,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 p-5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping opacity-75"></div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-4 bg-red-600 shadow-neon-red"></div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500 font-mono italic">Sys_Telemetry_V5.0</h3>
      </div>

      <div className="h-20 flex items-end gap-1.5 mb-10 overflow-hidden px-1">
        {waveform.map((v, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-red-600/40 to-red-500 rounded-sm transition-all duration-500" style={{ height: `${20 + (v * 80)}%`, opacity: 0.3 + (v * 0.7) }}></div>
        ))}
      </div>

      <div className="space-y-4">
        {neuralPulse.map(log => (
          <div key={log.id} className="flex justify-between items-center text-[10px] font-mono py-2.5 border-b border-white/[0.08] last:border-0 hover:bg-white/[0.02] -mx-2 px-2 transition-colors group/log overflow-hidden">
            <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform truncate mr-4">❯ {log.msg}</span>
            <span className="text-white/25 shrink-0 tabular-nums font-black">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserIdentityCard({ user }) {
  return (
    <div className="p-6 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl hidden lg:flex items-center gap-5 group hover:border-red-600/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="w-14 h-14 rounded-2xl p-[1.5px] bg-gradient-to-br from-red-600/60 via-white/10 to-transparent group-hover:from-red-600 transition-all">
        <div className="w-full h-full rounded-[0.9rem] overflow-hidden bg-saga-surface shadow-inner">
          <UserAvatar src={user?.profilePic} username={user?.username} className="w-full h-full scale-110 group-hover:scale-125 transition-transform duration-700" size="md" />
        </div>
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-[13px] font-black text-white uppercase tracking-wider tabular-nums truncate mb-0.5 group-hover:text-red-400 transition-colors">{user?.username}</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></span>
          <span className="text-[9px] text-red-500/80 font-black uppercase tracking-[0.3em] font-mono">Auth_Level: COMMAND</span>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-red-600/20 transition-all">
        <span className="text-[10px]">⚙️</span>
      </div>
    </div>
  );
}

function TerminalButton({ title, subtitle, icon, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-red-600/40 hover:bg-white/[0.06] transition-all duration-700 group relative overflow-hidden text-left shadow-2xl ${loading ? 'cursor-wait border-red-600/50 bg-red-600/5' : ''}`}
    >
      <div className={`absolute top-0 right-0 p-4 md:p-6 opacity-[0.03] group-hover:opacity-[0.15] group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-700 ${loading ? 'opacity-20 translate-y-0 rotate-45 scale-125' : ''}`}>
        <span className="text-5xl md:text-7xl">{icon}</span>
      </div>
      <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-red-500 transition-colors mb-2 md:mb-4 font-mono">{subtitle}</div>
      <div className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter group-hover:translate-x-2 transition-transform duration-500 drop-shadow-md">{title}</div>
      <div className={`mt-6 md:mt-8 flex items-center gap-3 transition-all duration-500 text-[9px] md:text-[10px] font-black text-red-500 tracking-[0.4em] ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'}`}>
        {loading ? (
          <>SYNCING_DATA <span className="animate-spin text-lg ring-2 ring-red-500/20 rounded-full h-4 w-4 border-t-2 border-red-500"></span></>
        ) : (
          <>ACCESS_NODE <span className="animate-pulse">❯❯❯</span></>
        )}
      </div>

      {/* Interactive Border Glow */}
      <div className={`absolute bottom-0 left-0 h-[1px] bg-red-600 transition-all duration-1000 ${loading ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
    </button>
  );
}
