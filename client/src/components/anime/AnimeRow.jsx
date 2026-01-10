import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";
import SagaImage from "../common/SagaImage";

export default function AnimeRow({ title, items, icon }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { showNSFW } = useWatchlist();

    const checkScroll = () => {
        const { current } = scrollRef;
        if (current) {
            const { scrollLeft, scrollWidth, clientWidth } = current;
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [items]);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.8 : current.offsetWidth * 0.8;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScroll, 500);
        }
    };

    if (!items || items.length === 0) return null;

    const uniqueItems = [...new Map(items.map(item => [item.mal_id, item])).values()];

    return (
        <div className="mb-20 group/row">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(255,0,60,0.5)]"></div>
                    <h2 className="font-shonen text-3xl md:text-4xl text-saga-text uppercase tracking-wider flex items-center gap-4">
                        {icon && <span className="flex items-center justify-center">{icon}</span>}
                        {title}
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border border-saga-border transition-all duration-300 active:scale-90 ${canScrollLeft
                            ? "bg-saga-surface text-saga-text hover:bg-saga-accent hover:text-white hover:border-saga-accent hover:shadow-neon-red"
                            : "bg-saga-surface text-saga-text-dim opacity-20 cursor-not-allowed"
                            }`}
                        aria-label="Scroll left"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border border-saga-border transition-all duration-300 active:scale-90 ${canScrollRight
                            ? "bg-saga-surface text-saga-text hover:bg-saga-accent hover:text-white hover:border-saga-accent hover:shadow-neon-red"
                            : "bg-saga-surface text-saga-text-dim opacity-20 cursor-not-allowed"
                            }`}
                        aria-label="Scroll right"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-8 overflow-x-auto pb-10 pt-4 scrollbar-hide snap-x no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {uniqueItems.map((anime) => {
                    const isNSFW = anime.rating?.includes('Rx') || (anime.rating?.includes('R+') && !anime.rating?.includes('mild'));
                    // Jikan Rx is Hentai, R+ is Mild Nudity. 
                    const isHidden = isNSFW && !showNSFW;

                    return (
                        <Link
                            to={`/anime/${anime.mal_id}`}
                            key={anime.mal_id}
                            className="min-w-[240px] md:min-w-[280px] snap-start group relative rounded-2xl bg-saga-surface border border-saga-border overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl"
                        >
                            {/* Halftone Overlay on Hover */}
                            <div className="absolute inset-0 halftone opacity-0 group-hover:opacity-10 pointer-events-none z-30 transition-opacity"></div>

                            {/* Speed Lines on Hover */}
                            <div className="absolute inset-0 speed-lines opacity-0 group-hover:opacity-5 pointer-events-none z-30 transition-opacity"></div>

                            <div className="aspect-[3/4.5] relative overflow-hidden">
                                {/* NSFW Shield */}
                                {isHidden && (
                                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
                                        <div className="text-4xl mb-4 opacity-50">🔞</div>
                                        <div className="bg-red-600/20 px-4 py-2 rounded border border-red-600/50 text-red-500 font-black text-xs uppercase tracking-widest shadow-lg">
                                            Content Hidden
                                        </div>
                                        <div className="mt-2 text-[8px] font-bold text-gray-500 uppercase tracking-widest">Enable 18+ in Navbar</div>
                                    </div>
                                )}

                                <img
                                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                                    alt={anime.title}
                                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ${isHidden ? 'opacity-20 blur-sm' : ''}`}
                                    loading="lazy"
                                />

                                {/* Tags */}
                                <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-widest">
                                        ★ {anime.score || 'N/A'}
                                    </span>
                                </div>

                                {/* Impact Border Overlay */}
                                <div className="absolute inset-0 border-2 border-red-600/0 group-hover:border-red-600/50 rounded-2xl z-40 transition-all duration-500"></div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity opacity-80 group-hover:opacity-100"></div>

                                {/* Content */}
                                <div className={`absolute inset-x-0 bottom-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ${isHidden ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">
                                        {anime.type} • {anime.status}
                                    </div>
                                    <h3 className="text-white font-black text-xl leading-tight line-clamp-2 transition-colors drop-shadow-xl group-hover:text-saga-accent">
                                        {anime.title}
                                    </h3>
                                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <div className="h-0.5 w-6 bg-red-600"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">View Saga</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
