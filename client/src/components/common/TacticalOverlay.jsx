export default function TacticalOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9000] overflow-hidden select-none mix-blend-screen">

            {/* MINIMAL GRAIN & VIGNETTE */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-50"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>

            {/* SUBTLE CORNER MARKERS (Minimal) */}
            {/* CORNER MARKERS REMOVED */}

        </div>
    );
}
