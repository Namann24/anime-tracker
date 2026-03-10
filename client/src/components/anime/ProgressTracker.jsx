export default function ProgressTracker({ progress = 0, label = "Progress" }) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.25em] text-[var(--saga-text-dim)]">
        <span>{label}</span>
        <span className="text-[var(--saga-text)]">{clamped}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 transition-all"
          style={{ width: `${clamped}%` }}
        ></div>
      </div>
    </div>
  );
}
