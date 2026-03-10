export default function TagsFilter({ tags = [], active = [], onToggle }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = active.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle?.(tag)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all focus-ring ${
              selected
                ? "bg-red-600 text-white shadow-neon-red"
                : "bg-white/5 text-[var(--saga-text)] border border-white/10 hover:border-red-500/50"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
