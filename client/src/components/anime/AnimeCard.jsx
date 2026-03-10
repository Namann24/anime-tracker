import { Link } from "react-router-dom";
import SagaButton from "../common/SagaButton";

export default function AnimeCard({ anime }) {
  if (!anime) return null;

  const cover = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const score = anime.score ? anime.score.toFixed(1) : "N/A";
  const episodes = anime.episodes || "?";

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="group block card-surface rounded-3xl overflow-hidden relative hover:-translate-y-2 transition-all duration-300 focus-ring"
      aria-label={`View ${anime.title}`}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        {cover && (
          <img
            src={cover}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 rounded-full bg-red-600/80 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-neon-red">
            ★ {score}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em]">
            {anime.type || "TV"} · {episodes} eps
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        <h3 className="text-lg font-black text-[var(--saga-text)] leading-snug line-clamp-2 group-hover:text-saga-accent transition-colors">
          {anime.title}
        </h3>
        <p className="text-[12px] text-[var(--saga-text-dim)] line-clamp-2 leading-relaxed">
          {anime.synopsis || "No synopsis available yet."}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--saga-text-dim)]">Details</span>
          <SagaButton variant="ghost" size="sm" className="hover:text-saga-accent">
            Open
          </SagaButton>
        </div>
      </div>
    </Link>
  );
}
