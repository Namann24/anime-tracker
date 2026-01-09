import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function DynamicBackground({ variant = 'mesh', intensity = 'medium' }) {
    const { theme } = useTheme();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let rafId;
        const handleMouseMove = (e) => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                setMousePos({
                    x: (e.clientX / window.innerWidth) * 100,
                    y: (e.clientY / window.innerHeight) * 100
                });
                rafId = null;
            });
        };

        if (variant === 'interactive') {
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                if (rafId) cancelAnimationFrame(rafId);
            };
        }
    }, [variant]);

    const isLight = theme === 'light';

    // --- LIGHT MODE VARIANTS ---
    const LightMesh = (
        <div className="absolute inset-0 w-full h-full bg-[#f8f9fa]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-80"></div>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/40 rounded-full blur-[120px] animate-float mix-blend-multiply"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-400/40 rounded-full blur-[140px] animate-float-delayed mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[100px]"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
        </div>
    );

    const LightGrid = (
        <div className="absolute inset-0 w-full h-full bg-[#f0f0f0]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
    );

    // --- DARK MODE VARIANTS (FIRE & ASH THEME) ---
    const DarkMesh = (
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-mesh opacity-60"></div>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[120px] animate-float mix-blend-screen"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[140px] animate-float-delayed mix-blend-screen"></div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-neutral-900/80 rounded-full blur-[100px] animate-float-slow"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay"></div>
        </div>
    );

    const DarkGrid = (
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-grid opacity-50"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/80 to-transparent animate-pulse-slow"></div>
                <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-600/80 to-transparent animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
        </div>
    );

    // --- SELECTION ---
    const MeshVariant = isLight ? LightMesh : DarkMesh;
    const GridVariant = isLight ? LightGrid : DarkGrid;

    // For others, we just tint them lighter if needed, or keep them dark if they are specific "Space" themes (like Interactive might be fine dark, but maybe not).
    // Let's force light mode override for all.

    const UniversalLight = (
        <div className="absolute inset-0 w-full h-full bg-slate-50">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-amber-50"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
    );

    const FinalInteractive = isLight ? UniversalLight : (
        <div className="absolute inset-0 w-full h-full bg-[#030001]">
            <div
                className="absolute inset-0 bg-gradient-radial opacity-80 transition-all duration-100 ease-linear mix-blend-screen"
                style={{
                    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 60, 0, 0.3) 0%, transparent 40%)`
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        </div>
    );

    const FinalSupreme = isLight ? LightMesh : (
        <div className="absolute inset-0 w-full h-full bg-[#050505]">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0505] to-[#050505]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-amber-900/20 mix-blend-screen"></div>
            <div className="absolute inset-0 bg-particles opacity-70"></div>
        </div>
    );

    const FinalLegendary = isLight ? LightGrid : (
        <div className="absolute inset-0 w-full h-full bg-[#050505]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0505_0%,_#000_100%)] opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-amber-500/10 border-dashed animate-spin-ultra-slow opacity-60"></div>
            <div className="absolute inset-0 bg-particles opacity-50"></div>
        </div>
    );

    const FinalParticles = isLight ? LightMesh : (
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-zinc-900 opacity-80"></div>
            <div className="absolute inset-0 bg-particles opacity-60"></div>
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] animate-float-slow mix-blend-screen"></div>
        </div>
    );

    const FinalTactical = isLight ? (
        <div className="absolute inset-0 w-full h-full bg-[#f1f5f9]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#e2e8f0,transparent)]"></div>
        </div>
    ) : (
        <div className="absolute inset-0 w-full h-full bg-[#020617]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
            <div className="absolute inset-0 bg-tactical-grid opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-950/20 to-transparent"></div>
        </div>
    );

    return (
        <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-[1500ms] ${isLight ? 'bg-white' : 'bg-[#050505]'}`}>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'mesh' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {MeshVariant}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'grid' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {GridVariant}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'interactive' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {FinalInteractive}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'supreme' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {FinalSupreme}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'legendary' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {FinalLegendary}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'particles' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {FinalParticles}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${variant === 'tactical' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {FinalTactical}
            </div>
        </div>
    );
}
