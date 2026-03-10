export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-[var(--saga-text)]">
      <div className="w-12 h-12 border-4 border-red-500/50 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--saga-text-dim)]">{label}</div>
    </div>
  );
}
