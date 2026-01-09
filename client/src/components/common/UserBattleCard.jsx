import React from 'react';
import { FaShieldAlt, FaStar, FaAward } from 'react-icons/fa';

export default function UserBattleCard({ user, className = "" }) {
    if (!user) return null;

    return (
        <div className={`w-64 bg-[var(--saga-surface)]/95 backdrop-blur-xl border border-[var(--saga-border)] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 ${className}`}>
            <div className="h-20 bg-gradient-to-br from-red-600/20 to-orange-600/20 px-4 pt-4 flex justify-between items-start relative">
                <div className="absolute inset-0 bg-grid opacity-20"></div>
                <div className="w-14 h-14 rounded-xl border-2 border-red-600/50 bg-[var(--saga-background)] flex items-center justify-center font-black text-2xl text-[var(--saga-text)] shadow-neon-red z-10 shrink-0 overflow-hidden">
                    {user.profilePic ? (
                        <img
                            src={user.profilePic}
                            className="w-full h-full object-cover"
                            alt=""
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center bg-[var(--saga-surface)] ${user.profilePic ? 'hidden' : 'flex'}`}>
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex flex-col items-end z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Reputation</span>
                    <div className="flex gap-0.5">
                        <FaStar className="text-amber-500 text-[10px]" />
                        <FaStar className="text-amber-500 text-[10px]" />
                        <FaStar className="text-amber-500 text-[10px]" />
                    </div>
                </div>
            </div>

            <div className="p-4 pt-2">
                <h3 className="text-shonen-bold text-lg text-[var(--saga-text)] uppercase tracking-tight mb-1">{user.username}</h3>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--saga-text-dim)] mb-4">Rank: Elite Operative</div>

                <div className="grid grid-cols-3 gap-2 py-4 border-y border-[var(--saga-border)] mb-4 bg-[var(--saga-background)]/40 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 halftone opacity-[0.02] pointer-events-none"></div>
                    <div className="text-center">
                        <div className="text-sm font-black text-[var(--saga-text)]">{user.episodesWatched || 0}</div>
                        <div className="text-[7px] font-black uppercase text-[var(--saga-text-dim)] tracking-tighter">Chapters</div>
                    </div>
                    <div className="text-center border-x border-[var(--saga-border)]">
                        <div className="text-sm font-black text-red-500 italic">{(user.spiritPower || 0).toLocaleString()}</div>
                        <div className="text-[7px] font-black uppercase text-[var(--saga-text-dim)] tracking-tighter">Sync %</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-black text-[var(--saga-text)]">{user.titlesMastered || 0}</div>
                        <div className="text-[7px] font-black uppercase text-[var(--saga-text-dim)] tracking-tighter">Mastery</div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[7px] font-black text-[var(--saga-text-dim)] uppercase tracking-widest">Resonance Progress</span>
                        <span className="text-[8px] font-black text-red-600">LVL {user.titlesMastered || 1}</span>
                    </div>
                    <div className="h-1.5 bg-red-600/10 rounded-full overflow-hidden border border-red-600/5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-neon-red animate-pulse" style={{ width: '65%' }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-red-600/10 py-2 px-4 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Node Sync: Online</span>
                <FaShieldAlt className="text-red-500 text-xs" />
            </div>
        </div>
    );
}
