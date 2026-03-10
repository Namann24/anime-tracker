export default function Card({ children, className = "" }) {
  return (
    <div className={`card-surface rounded-2xl border border-[var(--saga-border)] bg-[var(--saga-surface)]/90 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all ${className}`}>
      {children}
    </div>
  );
}
