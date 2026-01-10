import { useState } from 'react';

export default function SagaImage({ src, alt, className = '', containerClassName = '' }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-saga-surface ${containerClassName}`}>
            {/* Skeleton Pulse */}
            {!loaded && !error && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-saga-surface-hover to-transparent -translate-x-full animate-shimmer" />
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-saga-surface text-saga-text-dim">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Lost</span>
                </div>
            )}

            {/* The Image */}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`
                    w-full h-full object-cover transition-all duration-700
                    ${loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-lg scale-110'}
                    ${className}
                `}
            />

            {/* Gloss Overlay (Optional Premium Touch) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
}
