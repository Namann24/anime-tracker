import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function DynamicBackground() {
    const { theme } = useTheme();
    // Static Position - Center Screen
    const mousePos = { x: 50, y: 50 };

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[var(--saga-bg)] transition-colors duration-700">
            {/* 1. Base Gradient Mesh - Deep Space with Lighter Bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--saga-bg)] via-[var(--saga-bg)] to-[#1a0505] transition-colors duration-700"></div>

            {/* 2. ATMOSPHERIC NEBULA (Subtle & Elegant) */}
            {/* Orb 1: Primary Red - Reduced Opacity */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-red-600/10 rounded-full blur-[80px] animate-float mix-blend-screen transition-colors duration-700"
            ></div>

            {/* Orb 2: Amber - Reduced Opacity */}
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-amber-600/05 rounded-full blur-[100px] animate-float-delayed mix-blend-screen transition-colors duration-700"
            ></div>

            {/* Orb 3: Center Pulse - Very Subtle */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/05 rounded-full blur-[60px] mix-blend-screen pointer-events-none animate-pulse-slow"
            ></div>

            {/* 3. Texture Layers - Reduced Density */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10"></div>

            {/* 4. Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--saga-bg)] via-transparent to-transparent opacity-80"></div>
        </div>
    );
}
