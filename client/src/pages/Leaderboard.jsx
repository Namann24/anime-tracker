import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../services/authService";
import SagaButton from "../components/common/SagaButton";
import UserBattleCard from "../components/common/UserBattleCard";

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

    if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const topThree = warriors.slice(0, 3);
    const rest = warriors.slice(3);

    return (
        <div className="min-h-screen text-[var(--saga-text)] pb-32 overflow-x-hidden pt-32">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* HIGH-IMPACT HERO SECTION */}
                <div className="relative mb-32 group">
                    <div className="absolute inset-0 bg-red-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-all duration-1000"></div>

                    <div className="relative text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/5 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-neon-red"></span>
                            Neural Link: Ranking Mode
                        </div>

                        <h1 className="text-shonen-bold text-7xl md:text-9xl lg:text-[150px] leading-[0.8] mb-8 tracking-tighter uppercase text-[var(--saga-text)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                            SPIRIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-500 font-outline-sm text-glow">LEAGUE.</span>
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent to-red-600/50"></div>
                            <div className="flex flex-col items-center">
                                <p className="text-lg md:text-xl text-[var(--saga-text-dim)] font-medium italic max-w-2xl px-4 leading-relaxed">
                                    "The archive remembers every sequence. Only the most resonant souls ascend to these temporal heights."
                                </p>
                                <div className="mt-6 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">
                                    <span>STATUS: SYNCHRONIZING</span>
                                    <span className="w-1 h-1 rounded-full bg-red-600 animate-ping"></span>
                                    <span>REGISTRY_VOL: {warriors.length} UNITS</span>
                                </div>
                            </div>
                            <div className="h-px w-24 bg-gradient-to-l from-transparent to-red-600/50"></div>
                        </div>
                    </div>

                    {/* Decorative Scanlines or Data Tags */}
                    <div className="absolute top-0 right-0 hidden lg:block animate-in fade-in slide-in-from-right-12 duration-1000 delay-500">
                        <div className="text-[9px] font-black text-red-500/40 uppercase tracking-[0.5em] vertical-text transform rotate-180">SYNC_STATUS: RESONANT</div>
                    </div>
                </div>

                {/* PODIUM SECTION */}
                <div className="grid md:grid-cols-3 gap-8 items-end mb-32">
                    {/* Rank 2 */}
                    <PodiumPlace
                        warrior={topThree[1]}
                        rank={2}
                        height="h-64"
                        color="text-gray-400"
                        borderColor="border-gray-400/30"
                        delay="0.2s"
                    />

                    {/* Rank 1 */}
                    <PodiumPlace
                        warrior={topThree[0]}
                        rank={1}
                        height="h-80"
                        color="text-yellow-500"
                        borderColor="border-yellow-500/50"
                        glow="shadow-[0_0_100px_rgba(234,179,8,0.2)]"
                        delay="0s"
                        featured
                    />

                    {/* Rank 3 */}
                    <PodiumPlace
                        warrior={topThree[2]}
                        rank={3}
                        height="h-56"
                        color="text-orange-600"
                        borderColor="border-orange-600/30"
                        delay="0.4s"
                    />
                </div>

                {/* THE REGISTRY (THE LIST) */}
                <div className="bg-[var(--saga-surface)]/80 backdrop-blur-xl border border-[var(--saga-border)] rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 halftone opacity-[0.02] pointer-events-none"></div>

                    <div className="grid grid-cols-12 gap-4 px-12 py-8 bg-red-600/5 border-b border-[var(--saga-border)] text-[10px] font-black uppercase tracking-[0.4em] text-red-500 items-center">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-4">Warrior Registry</div>
                        <div className="col-span-3 text-center">Neural Sync</div>
                        <div className="col-span-2 text-center">Progression</div>
                        <div className="col-span-2 text-right">League Status</div>
                    </div>

                    <div className="divide-y divide-white/[0.03]">
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
                            <p className="text-gray-600 italic">"The spirits have not yet spoken..."</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PodiumPlace({ warrior, rank, height, color, borderColor, glow = "", delay = "0s", featured }) {
    if (!warrior) return (
        <div className={`p-8 bg-[var(--saga-surface)]/50 border border-dashed border-[var(--saga-border)] rounded-[3rem] ${height} flex flex-col items-center justify-center opacity-40`}>
            <span className="text-[var(--saga-text-dim)] text-5xl font-black">#{rank}</span>
            <span className="text-[10px] font-black uppercase text-[var(--saga-text-dim)] mt-4 tracking-widest">Sector Vacant</span>
        </div>
    );

    return (
        <Link
            to={`/profile/${warrior.username}`}
            className={`flex flex-col items-center group saga-animate-in relative`}
            style={{ animationDelay: delay }}
        >
            {/* AVATAR SECTOR */}
            <div className={`relative mb-12 ${featured ? 'w-56 h-56' : 'w-44 h-44'}`}>
                {/* SPIRIT AURA */}
                <div className={`absolute -inset-4 rounded-[3rem] bg-gradient-to-br ${featured ? 'from-red-600/40 via-orange-500/20 to-transparent' : 'from-gray-500/20 to-transparent'} blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000`}></div>

                {/* FRAME */}
                <div className={`absolute inset-0 rounded-[2.5rem] bg-[var(--saga-background)] border-4 ${borderColor} transition-all duration-700 group-hover:rotate-6 group-hover:scale-105 shadow-2xl relative z-10 overflow-hidden`}>
                    <div className="absolute inset-0 halftone opacity-[0.05] z-20"></div>
                    {warrior.profilePic ? (
                        <img
                            src={warrior.profilePic}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            alt={warrior.username}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-[#1a1a1a] text-[var(--saga-text)] text-3xl font-black uppercase select-none ${warrior.profilePic ? 'hidden' : 'flex'}`}>
                        {warrior.username?.charAt(0)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                </div>

                {/* RANK SHIELD */}
                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 group-hover:-translate-y-2 transition-transform duration-500`}>
                    <div className={`w-14 h-14 rounded-full bg-black border-4 ${borderColor} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] relative`}>
                        <div className={`absolute inset-0 rounded-full ${glow} opacity-60`}></div>
                        <span className={`text-xl font-black ${color} italic relative z-10`}>{rank}</span>
                    </div>
                    <div className={`h-8 w-1 bg-gradient-to-b ${borderColor.replace('border-', 'from-')} to-transparent opacity-50`}></div>
                </div>
            </div>

            {/* BASE SECTOR */}
            <div className={`w-full ${height} bg-gradient-to-t from-[var(--saga-surface)]/80 to-[var(--saga-background)]/40 backdrop-blur-xl border-x-4 border-t-4 ${borderColor} rounded-t-[4rem] p-10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(220,38,38,0.1)] group-hover:from-[var(--saga-surface)]`}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
                <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>

                <h3 className="text-3xl font-black text-[var(--saga-text)] uppercase tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{warrior.username}</h3>
                <div className={`text-[12px] font-black uppercase tracking-[0.3em] ${color} mb-10 flex items-center gap-2 text-glow-red`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-current"></span>
                    NEURAL SYNC: {warrior.spiritPower.toLocaleString()}
                </div>

                <div className="mt-auto w-full grid grid-cols-2 gap-4">
                    <div className="saga-glass-premium p-4 rounded-3xl border border-white/5 flex flex-col items-center group-hover:border-red-600/30 transition-all duration-500">
                        <span className="text-[10px] text-[var(--saga-text-dim)] uppercase font-black tracking-widest mb-1">Chapters</span>
                        <span className="text-xl font-black text-[var(--saga-text)]">{warrior.episodesWatched}</span>
                    </div>
                    <div className="saga-glass-premium p-4 rounded-3xl border border-white/5 flex flex-col items-center group-hover:border-red-600/30 transition-all duration-500">
                        <span className="text-[10px] text-[var(--saga-text-dim)] uppercase font-black tracking-widest mb-1">Mastery</span>
                        <span className="text-xl font-black text-red-500 italic">{warrior.titlesMastered} Lvl</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function LeaderboardRow({ warrior, rank }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative group/row">
            <Link
                to={`/profile/${warrior.username}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="grid grid-cols-12 gap-4 px-10 py-6 items-center hover:bg-white/[0.03] transition-all group/link border-l-4 border-transparent hover:border-red-600 relative"
            >
                <div className="col-span-1 text-xl font-black text-[var(--saga-text-dim)] group-hover/link:text-red-500 transition-colors italic relative z-10">#{rank}</div>
                {/* IDENTITY */}
                <div className="col-span-4 flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl border-2 border-[var(--saga-border)] overflow-hidden bg-[var(--saga-surface)] shrink-0 relative flex items-center justify-center group-hover/link:border-red-600/50 group-hover/link:rotate-3 transition-all">
                        {warrior.profilePic ? (
                            <img
                                src={warrior.profilePic}
                                className="w-full h-full object-cover grayscale group-hover/link:grayscale-0 transition-all duration-700"
                                alt=""
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center bg-[var(--saga-background)] text-[var(--saga-text)] font-black uppercase ${warrior.profilePic ? 'hidden' : 'flex'}`}>
                            {warrior.username?.charAt(0)}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black uppercase text-[var(--saga-text)] group-hover/link:text-red-500 transition-colors tracking-tighter">
                            {warrior.username}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[9px] text-[var(--saga-text-dim)] uppercase font-black tracking-[0.2em] opacity-60">Sequence_Sync_Active</span>
                        </div>
                    </div>
                </div>

                {/* NEURAL SYNC (POWER) */}
                <div className="col-span-3 flex flex-col items-center relative z-10">
                    <div className="text-2xl font-black text-red-600 italic group-hover/link:scale-110 group-hover/link:text-glow-red transition-all duration-500">
                        {warrior.spiritPower.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-black text-[var(--saga-text-dim)] uppercase tracking-[0.3em] mt-1 opacity-60">Resonance_Power</div>
                </div>

                {/* PROGRESSION (EPISODES) */}
                <div className="col-span-2 flex flex-col items-center relative z-10">
                    <div className="text-xl font-bold text-[var(--saga-text)] font-mono">
                        {warrior.episodesWatched} <span className="text-[10px] text-[var(--saga-text-dim)] font-black uppercase opacity-60">CH.</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden border border-white/5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-red-600/40 to-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] group-hover/link:from-red-600 group-hover/link:to-orange-500 transition-all duration-1000" style={{ width: `${Math.min(100, (warrior.episodesWatched / 500) * 100)}%` }}></div>
                    </div>
                </div>

                {/* LEAGUE STATUS (MASTERY) */}
                <div className="col-span-2 text-right relative z-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 saga-glass-premium rounded-2xl border border-white/5 group-hover/link:border-red-600/40 group-hover/link:bg-red-600/10 transition-all duration-500">
                        <span className="text-[var(--saga-text)] font-black text-[10px] uppercase tracking-widest">{warrior.titlesMastered} Rank</span>
                        <div className="w-4 h-4 rounded-full bg-red-600/20 flex items-center justify-center text-[10px]">⚔️</div>
                    </div>
                </div>
            </Link>

            {/* BATTLE-INTEL HOVER PREVIEW - Optimized for production stability */}
            {isHovered && (
                <div className="absolute left-[20%] -top-12 -translate-y-full z-[100] pointer-events-none hidden 2xl:block">
                    <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300 shadow-[0_30px_90px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden">
                        <UserBattleCard user={warrior} />
                    </div>
                    {/* Connection Line Decor */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-px bg-gradient-to-b from-red-600 to-transparent"></div>
                </div>
            )}
        </div>
    );
}
