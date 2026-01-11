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

      {/* 🚀 ELITE COMMAND HERO (RE-ENGINEERED: TACTICAL MISSION FRAME) */}
      <section className="relative pt-32 pb-12 px-6 md:px-12 transition-all duration-700">
        <div className="max-w-[1500px] mx-auto relative min-h-[65vh] lg:h-[70vh] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-3xl bg-saga-surface/30 backdrop-blur-sm group/hero transition-all duration-500 hover:border-red-600/20">
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
                {/* Complex Overlay Layers */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--saga-background)] via-[var(--saga-background)]/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--saga-background)] via-[var(--saga-background)]/50 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(239,68,68,0.15),transparent_60%)]"></div>
                <div className="absolute inset-0 scanline-mask opacity-[0.12]"></div>
                <div className="absolute inset-0 halftone opacity-[0.04]"></div>

                {/* Dynamic Lens Flare Decor */}
                <div className="absolute top-[30%] left-[10%] w-64 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent opacity-40 rotate-12"></div>
              </div>

              <div className="relative z-10 w-full h-full flex items-center p-8 lg:p-20">
                <div className="grid lg:grid-cols-12 gap-16 items-center w-full">

                  {/* LEFT: MISSION INTEL */}
                  <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000 ease-out">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-center gap-3 px-5 py-2 bg-red-600/15 border border-red-600/30 rounded-full backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.1)] group/tooltip relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-neon-red"></span>
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-red-500">Aether Priority Alpha</span>

                        {/* Tactical Briefing Tooltip */}
                        <div className="absolute bottom-full left-0 mb-4 w-64 p-5 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 shadow-3xl pointer-events-none">
                          <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            Command Briefing
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed normal-case font-medium">
                            The CMD Hub is your live cockpit. Access your active mission, monitor real-time sync data, and jump directly into the next episode of your primary sagas.
                          </p>
                        </div>
                      </div>
                      <div className="h-4 w-[1px] bg-white/10"></div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 font-mono">
                        <span className="text-red-600/50 mr-2">LOG_TARGET:</span>
                        {activeMission.type || 'SAGA_CHRONICLE'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h1 className="font-shonen text-4xl md:text-6xl lg:text-[7.5rem] leading-[0.85] tracking-tighter transition-all duration-500">
                        <span className="text-white block mb-2 drop-shadow-[0_0_30px_rgba(239,68,68,0.2)]">CURRENT MISSION:</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                          {activeMission.title}
                        </span>
                      </h1>

                      <div className="flex flex-wrap items-center gap-8 pt-1">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/80">Neural Sync</span>
                            <span className="text-[10px] font-mono text-white/40">{calculateProgress(activeMission)}%</span>
                          </div>
                          <div className="w-[400px] h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 relative group/sync">
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.3)_4px,rgba(0,0,0,0.3)_5px)] z-10 opacity-30"></div>
                            <div className="absolute inset-y-0 left-0 bg-red-600 blur-md w-full -translate-x-full group-hover/sync:translate-x-full transition-transform duration-[2000ms] opacity-20"></div>
                            <div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-[1500ms] ease-out rounded-full relative" style={{ width: `${calculateProgress(activeMission)}%` }}>
                              <div className="absolute top-0 right-0 w-4 h-full bg-white/20 skew-x-[25deg] blur-sm"></div>
                            </div>
                          </div>
                        </div>

                        <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Milestone Target</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white italic">EP {getNextEpisode(activeMission)}</span>
                            <span className="text-[10px] text-red-500/60 font-black uppercase tracking-widest animate-pulse font-mono">STANDBY</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <SagaButton v="primary" size="lg" onClick={() => navigate(`/anime/${activeMission.mal_id}`)} className="shadow-impact hover:scale-105 group px-10 h-14 relative overflow-hidden transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="relative z-10 flex items-center gap-3 text-[11px] tracking-[0.2em] font-black">
                          <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          RE-ENGAGE SESSION
                        </span>
                      </SagaButton>
                      <SagaButton v="outline" size="lg" onClick={() => navigate("/watchlist")} className="px-10 h-14 border-white/10 hover:border-red-600/50 hover:bg-red-600/5 transition-all duration-500 text-[11px] tracking-[0.2em] font-black">
                        ACCESS CHRONICLES
                      </SagaButton>
                    </div>
                  </div>

                  {/* RIGHT: TACTICAL TELEMETRY */}
                  <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
                    <TacticalTelemetry />
                    <UserIdentityCard user={user} />
                  </div>
                </div>

                {/* TACTICAL BORDER DECOR */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-red-600/30 rounded-tl-2xl"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-red-600/30 rounded-tr-2xl"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-red-600/30 rounded-bl-2xl"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-red-600/30 rounded-br-2xl"></div>

                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 scanline-mask opacity-[0.05] pointer-events-none"></div>
              </div>
            </>
          ) : (
            <div className="relative z-10 max-w-4xl mx-auto text-center px-6 animate-in fade-in zoom-in duration-1000 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-20 rounded-[4rem] shadow-3xl">
              <div className="w-40 h-40 mx-auto mb-12 rounded-[2.5rem] border-2 border-red-600/30 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-red-600/10 blur-2xl group-hover:bg-red-600/20 transition-all rounded-full"></div>
                <span className="text-7xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] relative z-10">📡</span>
              </div>
              <h1 className="text-shonen-bold text-7xl md:text-8xl text-white mb-8 uppercase tracking-tighter leading-none">
                COMMAND LOG: <span className="text-red-600">NULL</span>
              </h1>
              <p className="text-[var(--saga-text-dim)] mb-14 max-w-lg mx-auto italic text-xl opacity-60 font-medium leading-relaxed">
                "The neural stream is silent. Initiate a new saga to synchronize the hub and forge your legend in the archives."
              </p>
              <SagaButton v="primary" size="xl" onClick={() => navigate("/search")} className="px-16 py-7 rounded-full shadow-neon-red text-lg tracking-[0.3em] font-black group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative z-10">INITIALIZE DISCOVERY</span>
              </SagaButton>
            </div>
          )}
        </div>
      </section>

      {/* 📊 SECONDARY OPERATIONS GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-24 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-14">
          <div className="flex items-center gap-6">
            <div className="w-2.5 h-10 bg-red-600 shadow-neon-red rounded-sm"></div>
            <div>
              <h2 className="text-shonen-bold text-4xl text-white uppercase tracking-tight leading-none mb-1">Active Mission Pulse</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">OPERATIONAL_LIVE_FEED</p>
            </div>
          </div>
          <Link to="/watchlist" className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.08] px-6 py-3 rounded-full border border-white/[0.05] transition-all duration-500">
            <span className="text-[11px] font-black text-white/60 group-hover:text-red-500 uppercase tracking-[0.4em] transition-colors tabular-nums">Archive Interface</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600/50 group-hover:rotate-45 transition-all">
              <span className="text-white/40 group-hover:text-red-500 text-xl font-light">→</span>
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => <SagaSkeleton key={i} type="card" className="aspect-[16/10]" />)}
          </div>
        ) : continueWatching.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 fill-mode-backwards">
            {continueWatching.map(anime => (
              <div
                key={anime._id}
                onClick={() => navigate(`/anime/${anime.mal_id}`)}
                className="group cursor-pointer relative"
              >
                <div className="relative aspect-[16/10] rounded-[3.5rem] overflow-hidden border border-white/10 bg-saga-surface shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:border-red-600/50 group/card">
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/20 to-black/90 group-hover:via-red-900/10 transition-colors"></div>
                  <img src={anime.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:invert-0 transition-all duration-1000 group-hover:scale-125" alt="" />

                  <div className="absolute top-6 left-6 z-20">
                    <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black text-white/80 tracking-[0.3em] uppercase shadow-2xl">
                      EP {getNextEpisode(anime)} READY
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transition-transform duration-700 group-hover:translate-x-2">
                    <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em]">Sector Monitoring Active</span>
                    </div>
                    <h3 className="text-white font-black text-2xl leading-tight line-clamp-1 group-hover:text-red-400 transition-colors uppercase tracking-tight drop-shadow-lg">{anime.title}</h3>
                    <div className="w-full h-[3px] bg-white/10 mt-5 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover:brightness-125 transition-all duration-1000" style={{ width: `${calculateProgress(anime)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/search" className="flex flex-col items-center justify-center aspect-[16/10] rounded-[3.5rem] border-2 border-dashed border-white/10 bg-white/[0.01] hover:border-red-600/40 hover:bg-red-600/[0.02] transition-all duration-500 group overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] flex items-center justify-center mb-5 group-hover:scale-125 transition-all duration-500 group-hover:shadow-neon-red group-hover:bg-red-600 group-hover:text-white border border-white/5">
                <span className="text-3xl font-light">+</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-colors relative z-10">Add Mission</span>
            </Link>
          </div>
        ) : (
          <div className="p-24 border border-dashed border-white/10 rounded-[4rem] text-center bg-white/[0.01] backdrop-blur-xl group hover:border-red-600/20 transition-colors">
            <div className="text-6xl mb-6 opacity-10 group-hover:scale-110 transition-transform">📁</div>
            <p className="text-white/30 font-black text-sm italic uppercase tracking-[0.6em] group-hover:text-white/50 transition-colors">Archive empty. Local sector dormant.</p>
          </div>
        )}
      </section>

      {/* ⚡ RAPID ACCESS CONSOLE */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-28 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-[1200ms] fill-mode-backwards relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <TerminalButton title="Temporal Grid" subtitle="Scheduling Hub" icon="🗓️" onClick={() => navigate("/schedule")} color="text-red-500" />
          <TerminalButton title="League" subtitle="Operative Rankings" icon="🎖️" onClick={() => navigate("/leaderboard")} color="text-red-500" />
          <TerminalButton
            title="Feeling Lucky"
            subtitle="Neural Drift"
            icon="🎲"
            onClick={handleFeelingLucky}
            color="text-red-500"
            loading={drifting}
          />
          <TerminalButton title="Archives" subtitle="System Records" icon="📂" onClick={() => navigate("/watchlist")} color="text-red-500" />
        </div>
      </section>
    </div>
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
      className={`flex flex-col p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-red-600/40 hover:bg-white/[0.06] transition-all duration-700 group relative overflow-hidden text-left shadow-2xl ${loading ? 'cursor-wait border-red-600/50 bg-red-600/5' : ''}`}
    >
      <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.15] group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-700 ${loading ? 'opacity-20 translate-y-0 rotate-45 scale-125' : ''}`}>
        <span className="text-7xl">{icon}</span>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-red-500 transition-colors mb-4 font-mono">{subtitle}</div>
      <div className="text-2xl font-black text-white uppercase tracking-tighter group-hover:translate-x-2 transition-transform duration-500 drop-shadow-md">{title}</div>
      <div className={`mt-8 flex items-center gap-3 transition-all duration-500 text-[10px] font-black text-red-500 tracking-[0.4em] ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'}`}>
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
