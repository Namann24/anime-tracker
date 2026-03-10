import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function DynamicBackground() {
    const { theme } = useTheme();
    const glowRef = useRef(null);
    const starsRef = useRef(null);

    useEffect(() => {
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (prefersReduced) return;
        let frame;
        const handlePointer = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (glowRef.current) {
                    glowRef.current.style.setProperty('--px', `${x}px`);
                    glowRef.current.style.setProperty('--py', `${y}px`);
                }
                if (starsRef.current) {
                    starsRef.current.style.setProperty('--px', `${x * 0.2}px`);
                    starsRef.current.style.setProperty('--py', `${y * 0.2}px`);
                }
            });
        };
        window.addEventListener('pointermove', handlePointer, { passive: true });
        return () => {
            window.removeEventListener('pointermove', handlePointer);
            cancelAnimationFrame(frame);
        };
    }, []);

    // Palette per theme
    const baseGradientDark = 'linear-gradient(180deg, #06070c 0%, #0b0c12 45%, #11131a 100%)';
    const baseGradientLight = 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 40%, #f0f0f3 100%)';
    const accentGlow = 'radial-gradient(60% 60% at 40% 40%, rgba(255,70,70,0.18), rgba(255,70,70,0))';

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700" style={{ background: theme === 'light' ? '#ffffff' : '#0b0b0f' }}>
            {/* 1. Base Gradient */}
            <div className="absolute inset-0 transition-opacity duration-700" style={{ background: theme === 'light' ? baseGradientLight : baseGradientDark }}></div>

            {/* 2. Accent Radial Glow */}
            <div
                className="absolute inset-0 will-change-transform"
                style={{
                    backgroundImage: accentGlow,
                    transform: 'translate3d(calc(var(--px, 0px) * 0.4), calc(var(--py, 0px) * 0.4), 0)',
                }}
                ref={glowRef}
            ></div>

            {/* 3. Starfield / particles */}
            <div
                ref={starsRef}
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.08), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.05), transparent), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.06), transparent)',
                    backgroundSize: '320px 320px, 420px 420px, 520px 520px',
                    animation: 'starsFloat 60s linear infinite',
                    opacity: 0.35,
                    transform: 'translate3d(calc(var(--px, 0px) * 0.2), calc(var(--py, 0px) * 0.2), 0)',
                    willChange: 'transform',
                }}
            ></div>

            {/* 4. Light rays */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 30%), linear-gradient(135deg, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0) 40%)',
                    backgroundSize: '140% 140%',
                    opacity: 0.4,
                    animation: 'raysDrift 28s ease-in-out infinite alternate',
                }}
            ></div>

            {/* Subtle Noise */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-soft-light"></div>
        </div>
    );
}
