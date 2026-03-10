export default function PageHeader({ title, subtitle, actions = null, className = "" }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 ${className}`}>
      <div>
        {subtitle && (
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--saga-text-dim)] mb-2">
            {subtitle}
          </p>
        )}
        <h1 className="font-shonen text-[clamp(32px,4vw,48px)] md:text-[clamp(36px,4vw,52px)] leading-tight text-[var(--saga-text)] uppercase tracking-tight">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2 md:gap-3">{actions}</div>}
    </div>
  );
}
