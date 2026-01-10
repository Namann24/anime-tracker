export default function TacticalOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9000] overflow-hidden select-none mix-blend-screen">

            {/* MINIMAL GRAIN & VIGNETTE */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-50"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>

            {/* SUBTLE CORNER MARKERS (Minimal) */}
            <div className="absolute top-6 left-6 w-2 h-2 border-t border-l border-[var(--saga-text-dim)]/30"></div>
            <div className="absolute top-6 right-6 w-2 h-2 border-t border-r border-[var(--saga-text-dim)]/30"></div>
            <div className="absolute bottom-6 left-6 w-2 h-2 border-b border-l border-[var(--saga-text-dim)]/30"></div>
            <div className="absolute bottom-6 right-6 w-2 h-2 border-b border-r border-[var(--saga-text-dim)]/30"></div>

        </div>
    );
}
