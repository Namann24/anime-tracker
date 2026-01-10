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
        <div className="min-h-screen text-[var(--saga-text)] pb-32 pt-32 transition-colors duration-500 bg-transparent">
            <div className="max-w-[1200px] mx-auto px-6">

                {/* HEADER SECTION */}
                <div className="text-center mb-24 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/20 bg-red-600/5 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            Spirit League Registry
                        </div>
                        <h1 className="text-shonen-bold text-6xl md:text-8xl mb-4 tracking-tighter uppercase text-[var(--saga-text)]">
                            THE <span className="text-red-600 font-outline-sm text-glow">ELITE.</span>
                        </h1>
                        <p className="text-[var(--saga-text-dim)] font-medium italic max-w-xl mx-auto text-sm">
                            "Only those with the highest resonance in the archives ascend to these heights."
                        </p>
                    </div>
                </div>

                {/* PODIUM SECTION */}
                <div className="grid md:grid-cols-3 gap-0 items-end mb-32 relative z-10">
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <div className="order-2 md:order-1 transition-transform hover:scale-105 duration-500">
                            <PodiumPlace warrior={topThree[1]} rank={2} color="text-slate-400" bgColor="bg-slate-500/5" delay="0.1s" />
                        </div>
                    )}
                    {/* Rank 1 */}
                    {topThree[0] && (
                        <div className="order-1 md:order-2 z-20 transition-transform hover:scale-110 duration-500 group/champion">
                            <PodiumPlace warrior={topThree[0]} rank={1} featured color="text-red-600" bgColor="bg-red-600/20" delay="0s" />
                        </div>
                    )}
                    {/* Rank 3 */}
                    {topThree[2] && (
                        <div className="order-3 md:order-3 transition-transform hover:scale-105 duration-500">
                            <PodiumPlace warrior={topThree[2]} rank={3} color="text-orange-600" bgColor="bg-orange-500/5" delay="0.2s" />
                        </div>
                    )}
                </div>

                {/* THE REGISTRY TABLE */}
                <div className="max-w-[1000px] mx-auto">
                    <div className="saga-glass border border-[var(--saga-border)] rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-600/20 to-transparent"></div>
                        <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-[var(--saga-border)] bg-[var(--saga-text)]/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--saga-text-dim)] items-center">
                            <div className="col-span-1 pl-2">#</div>
                            <div className="col-span-5 md:col-span-4">Warrior Registry</div>
                            <div className="col-span-3 text-center">Resonance</div>
                            <div className="col-span-3 md:col-span-2 text-center">Progress</div>
                            <div className="col-span-2 text-right hidden md:block pr-2">Mastery</div>
                        </div>

                        <div className="divide-y divide-[var(--saga-border)]">
                            {rest.map((warrior, idx) => (
                                <LeaderboardRow
                                    key={warrior._id}
                                    warrior={warrior}
                                    rank={idx + 4}
                                />
                            ))}
                        </div>

                        {warriors.length === 0 && (
                            <div className="p-24 text-center">
                                <span className="text-6xl mb-6 block animate-pulse">📡</span>
                                <p className="text-[var(--saga-text-dim)] italic font-medium">Scanning for rhythmic signatures...</p>
                            </div>
                        )}

                        <div className="px-8 py-4 bg-[var(--saga-text)]/[0.01] text-[8px] font-black uppercase text-[var(--saga-text-dim)]/40 tracking-[0.5em] flex justify-between items-center">
                            <span>REGISTRY_VOL_{warriors.length}</span>
                            <span>SYNC_SECURED</span>
                        </div>
                    </div>
                </div>
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

function PodiumPlace({ warrior, rank, featured, color, bgColor, delay }) {
    return (
        <Link
            to={`/profile/${warrior.username}`}
            className={`flex flex-col items-center group animate-in fade-in slide-in-from-bottom-12 duration-1000 relative`}
            style={{ animationDelay: delay }}
        >
            {featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-8">
                    <div className="flex flex-col items-center animate-bounce duration-[2000ms]">
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.5em] mb-2">Champion</span>
                        <div className="w-px h-12 bg-gradient-to-t from-red-600 to-transparent"></div>
                    </div>
                </div>
            )}

            <div className={`relative mb-8 ${featured ? 'w-56 h-56' : 'w-40 h-40'}`}>
                {/* Aura Layers */}
                <div className={`absolute -inset-4 rounded-full ${bgColor} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-1000 ${featured ? 'animate-pulse' : ''}`}></div>
                <div className={`absolute -inset-1 rounded-full border ${featured ? 'border-red-600/30' : 'border-white/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                <Avatar
                    src={warrior.profilePic}
                    username={warrior.username}
                    className={`w-full h-full rounded-full ${featured ? 'border-4 border-red-600' : 'border-2'} z-10 shadow-2xl group-hover:rotate-3 group-hover:scale-105`}
                    size="lg"
                />

                {/* Rank Badge */}
                <div className={`absolute -bottom-2 right-4 w-12 h-12 rounded-full bg-[var(--saga-background)] border-2 ${featured ? 'border-red-600 shadow-neon-red' : 'border-[var(--saga-border)] shadow-xl'} flex items-center justify-center font-black ${color} z-20 text-xl group-hover:scale-110 transition-transform`}>
                    {rank}
                </div>
            </div>

            <div className="text-center relative z-10">
                <h3 className={`font-outline-sm font-black text-2xl md:text-3xl uppercase tracking-tighter ${featured ? 'text-red-500 scale-110' : 'text-[var(--saga-text)]'} group-hover:scale-105 transition-all duration-500`}>
                    {warrior.username}
                </h3>
                <div className={`text-[12px] font-black uppercase tracking-widest ${color} opacity-80 mt-2 text-glow`}>
                    {warrior.spiritPower.toLocaleString()} <span className="opacity-40">PW.</span>
                </div>

                <div className="flex gap-8 mt-6 px-6 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest opacity-60">Chapters</span>
                        <span className="text-lg font-black text-[var(--saga-text)] leading-none mt-1">{warrior.episodesWatched}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10 self-center"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest opacity-60">Mastery</span>
                        <span className="text-lg font-black text-red-500 leading-none mt-1 italic">{warrior.titlesMastered}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function LeaderboardRow({ warrior, rank }) {
    return (
        <Link
            to={`/profile/${warrior.username}`}
            className="grid grid-cols-12 gap-4 px-10 py-5 items-center hover:bg-red-600/[0.04] transition-all duration-500 group relative border-l-4 border-transparent hover:border-red-600"
        >
            <div className="col-span-1 font-black text-[var(--saga-text-dim)] group-hover:text-red-500 transition-colors italic text-lg opacity-40 group-hover:opacity-100">
                #{rank}
            </div>

            <div className="col-span-5 md:col-span-4 flex items-center gap-6">
                <Avatar
                    src={warrior.profilePic}
                    username={warrior.username}
                    className="w-12 h-12 rounded-xl group-hover:rotate-3 group-hover:scale-110 transition-all duration-500"
                />
                <span className="font-black uppercase text-base tracking-tight text-[var(--saga-text)] group-hover:text-red-600 transition-all duration-300">
                    {warrior.username}
                </span>
            </div>

            <div className="col-span-3 text-center">
                <span className="text-red-600 font-black font-mono text-xl text-glow-red">
                    {warrior.spiritPower.toLocaleString()}
                </span>
            </div>

            <div className="col-span-3 md:col-span-2 text-center text-[var(--saga-text-dim)] font-black text-sm tracking-widest">
                {warrior.episodesWatched} <span className="text-[9px] opacity-30">CH.</span>
            </div>

            <div className="col-span-2 text-right hidden md:block">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--saga-border)] text-[9px] font-black uppercase text-[var(--saga-text-dim)] group-hover:border-red-600/40 group-hover:text-[var(--saga-text)] group-hover:bg-red-600/5 transition-all duration-500">
                    {warrior.titlesMastered} LVL
                    <span className="w-3 h-3 rounded-full bg-red-600/20 flex items-center justify-center text-[7px] group-hover:animate-spin">⚔️</span>
                </div>
            </div>
        </Link>
    );
}
