import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../services/authService";

export default function Leaderboard() {
    const [warriors, setWarriors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getLeaderboard();
                setWarriors(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-neon-red"></div>
        </div>
    );

    const topThree = warriors.slice(0, 3);
    const rest = warriors.slice(3);

    return (
        <div className="min-h-screen pt-24 md:pt-40 pb-32 px-4 md:px-12 transition-colors duration-700 saga-animate-in selection:bg-red-500/30">

            {/* 🌌 ATMOSPHERIC CORE */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-gradient-to-b from-red-600/10 via-red-600/5 to-transparent"></div>
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse-slow"></div>
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[180px] rounded-full animate-pulse-slow delay-1000"></div>
            </div>

            <div className="layout-shell relative z-10 section-stack">

                {/* EPIC HEADER */}
                <header className="text-center mb-32 md:mb-48">
                    <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 mb-8 animate-in fade-in slide-in-from-top-12 duration-1000">
                        <div className="w-2 h-2 rounded-full bg-red-600 shadow-neon-red animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">Celestial Rankings</span>
                    </div>
                    <h1 className="text-shonen-bold text-6xl md:text-[10rem] lg:text-[13rem] leading-none tracking-tighter uppercase italic text-white drop-shadow-impact">
                        Elite <span className="text-red-500 font-outline-sm">Spirit</span>
                    </h1>
                    <p className="text-[var(--saga-text-dim)] font-medium italic opacity-40 max-w-xl mx-auto text-sm md:text-xl md:mt-4">
                        "Only the most resonant chronicles ascend to the heights of the Spirit Podium."
                    </p>
                </header>

                {/* SPIRIT PODIUM (NON-LINEAR) */}
                <div className="relative mb-40 md:mb-64">
                    {/* Background Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-end max-w-5xl mx-auto">
                        {/* RANK 2 */}
                        <div className="order-2 md:order-1 animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
                            <ElitePodium warrior={topThree[1]} rank={2} color="text-slate-400" glow="shadow-slate-500/20" height="h-[280px]" />
                        </div>

                        {/* RANK 1 (CHAMPION) */}
                        <div className="order-1 md:order-2 z-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            <ElitePodium warrior={topThree[0]} rank={1} featured color="text-red-500" glow="shadow-red-600/40" height="h-[380px]" />
                        </div>

                        {/* RANK 3 */}
                        <div className="order-3 md:order-3 animate-in fade-in slide-in-from-right-12 duration-1000 delay-500">
                            <ElitePodium warrior={topThree[2]} rank={3} color="text-amber-700" glow="shadow-amber-900/20" height="h-[240px]" />
                        </div>
                    </div>
                </div>

                {/* THE REGISTRY (SAGA TABLE) */}
                <section className="max-w-[1100px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-backwards">
                    <div className="flex items-center gap-6 mb-12 px-4">
                        <div className="h-0.5 w-16 bg-red-600/30 shadow-neon-red"></div>
                        <h3 className="text-shonen-bold text-2xl md:text-5xl tracking-tighter uppercase text-white leading-none">The Immortal Registry</h3>
                    </div>

                    <div className="bg-black/60 backdrop-blur-3xl border border-white/[0.08] rounded-[3.5rem] overflow-hidden shadow-4xl relative group/registry">
                        {/* Top scanning line */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-0 group-hover/registry:opacity-100 transition-opacity duration-1000"></div>

                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-8 px-12 py-8 bg-white/[0.02] border-b border-white/[0.05] text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                            <div className="col-span-1">RNK</div>
                            <div className="col-span-5">Warrior Signature</div>
                            <div className="col-span-3 text-center">Spirit Reservoir</div>
                            <div className="col-span-3 text-right">Operational Status</div>
                        </div>

                        <div className="divide-y divide-white/[0.03]">
                            {rest.length > 0 ? rest.map((warrior, idx) => (
                                <SpiritRegistryRow key={warrior._id} warrior={warrior} rank={idx + 4} />
                            )) : (
                                <div className="py-24 text-center px-8">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-white/20 mx-auto mb-6 flex items-center justify-center opacity-40">
                                        <span className="text-3xl animate-pulse">📡</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Establishing Deep Sync Connections...</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Metadata */}
                        <div className="px-12 py-6 bg-white/[0.01] flex justify-between items-center text-[8px] font-black uppercase tracking-[0.5em] text-white/10 font-mono">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-600/20"></div>
                                REG_BLOCK_0x{warriors.length.toString(16).toUpperCase()}
                            </div>
                            <div>SYNC_STABLE // 256_BIT_AES</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Avatar({ src, username, className, size = "md" }) {
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden shrink-0 border border-[var(--saga-border)] bg-[var(--saga-background)] flex items-center justify-center transition-all duration-500 ${className}`}>
            {!error && src && (src.includes('/') || src.startsWith('http') || src.startsWith('data:')) ? (
                <img
                    src={src}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    alt={username}
                    onError={() => setError(true)}
                />
            ) : (
                <div className={`font-black text-[var(--saga-text-dim)] group-hover:text-red-500 transition-colors select-none ${size === "lg" ? "text-4xl" : "text-sm"}`}>
                    {username?.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
    );
}

function ElitePodium({ warrior, rank, featured, color, glow, height }) {
    if (!warrior) return null;
    return (
        <Link to={`/profile/${warrior.username}`} className="group relative block w-full focus:outline-none">
            <div className={`flex flex-col items-center gap-12`}>
                {/* Avatar Orb */}
                <div className="relative">
                    {/* Champion Crown/Decoration */}
                    {featured && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce duration-[2500ms]">
                            <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em] mb-3">Ascendant</div>
                            <div className="w-px h-10 bg-gradient-to-t from-red-600 to-transparent mx-auto"></div>
                        </div>
                    )}

                    <div className={`relative ${featured ? 'w-48 h-48 md:w-64 md:h-64' : 'w-32 h-32 md:w-44 md:h-44'}`}>
                        {/* Auras */}
                        <div className={`absolute -inset-6 rounded-full bg-red-600/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${featured ? 'opacity-40 animate-pulse' : ''}`}></div>
                        <div className={`absolute -inset-1 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                        {/* Main Image */}
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-600/50 transition-all duration-700 shadow-3xl bg-black">
                            {warrior.profilePic ? (
                                <img src={warrior.profilePic} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10 group-hover:text-red-500/20 transition-colors">
                                    {warrior.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Rank Glyph */}
                        <div className={`absolute -bottom-2 -right-2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black border-2 ${featured ? 'border-red-600 ' + glow : 'border-white/20'} flex items-center justify-center z-20 group-hover:scale-110 transition-transform`}>
                            <span className={`text-xl md:text-3xl font-black uppercase italic ${color}`}>#{rank}</span>
                        </div>
                    </div>
                </div>

                {/* Podium Base */}
                <div className={`w-full ${height} bg-gradient-to-b from-white/[0.04] to-transparent border-t border-x border-white/[0.08] rounded-t-[4rem] md:rounded-t-[6rem] p-10 flex flex-col items-center text-center backdrop-blur-xl group-hover:border-red-600/30 transition-all duration-700 hover:from-red-600/5`}>
                    <h3 className={`text-shonen-bold text-3xl md:text-5xl tracking-tighter uppercase italic leading-none mb-3 ${featured ? 'text-red-500' : 'text-white'} group-hover:scale-110 transition-transform origin-bottom`}>
                        {warrior.username}
                    </h3>
                    <div className={`text-[12px] font-black uppercase tracking-[0.4em] ${color} opacity-60`}>
                        {warrior.spiritPower.toLocaleString()} Reserved
                    </div>

                    {/* Achievement Markers */}
                    <div className="flex gap-10 mt-10">
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Episodes</span>
                            <span className="text-xl font-black text-white/60 group-hover:text-white transition-colors">{warrior.episodesWatched}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Mastery</span>
                            <span className="text-xl font-black text-red-600 italic">{warrior.titlesMastered}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function SpiritRegistryRow({ warrior, rank }) {
    return (
        <Link to={`/profile/${warrior.username}`} className="group/row grid grid-cols-12 gap-4 px-8 md:px-12 py-8 items-center transition-all duration-500 hover:bg-red-600/[0.03] active:bg-red-600/[0.05] relative overflow-hidden">
            {/* Hover Highlight Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 -translate-x-full group-hover/row:translate-x-0 transition-transform duration-500"></div>

            {/* Rank */}
            <div className="col-span-2 md:col-span-1">
                <span className="text-2xl font-black italic text-white/10 group-hover/row:text-red-500 transition-colors opacity-40 group-hover:opacity-100">#{rank}</span>
            </div>

            {/* Identity */}
            <div className="col-span-10 md:col-span-5 flex items-center gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] overflow-hidden border border-white/10 group-hover/row:border-red-600/40 group-hover/row:rotate-3 transition-all duration-500 bg-saga-surface">
                    {warrior.profilePic ? (
                        <img src={warrior.profilePic} className="w-full h-full object-cover grayscale group-hover/row:grayscale-0 transition-all duration-700" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/5">{warrior.username.charAt(0).toUpperCase()}</div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-lg md:text-2xl font-black uppercase tracking-tight text-white group-hover/row:text-red-500 transition-colors">{warrior.username}</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">SIGNAL_ID: {warrior._id.slice(-6).toUpperCase()}</span>
                </div>
            </div>

            {/* Score */}
            <div className="col-span-6 md:col-span-3 text-center md:text-left pt-4 md:pt-0">
                <div className="flex flex-col md:items-center">
                    <span className="text-[7px] md:hidden font-black text-white/20 uppercase tracking-[0.3em] mb-1">Spirit Reservoir</span>
                    <span className="text-xl md:text-3xl font-black text-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">{warrior.spiritPower.toLocaleString()}</span>
                </div>
            </div>

            {/* Stats Button (Mobile Optimized) */}
            <div className="col-span-6 md:col-span-3 flex justify-end pt-4 md:pt-0">
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover/row:border-red-600/30 group-hover/row:bg-red-600/5 transition-all duration-500">
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Operational Rank</span>
                        <span className="text-xs font-black text-white/60 italic group-hover/row:text-white transition-colors">{warrior.titlesMastered} LEVEL</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover/row:border-red-600/50 group-hover/row:rotate-45 transition-all">
                        <span className="text-white/20 group-hover/row:text-red-500 text-lg font-light">→</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
