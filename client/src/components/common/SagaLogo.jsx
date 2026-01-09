import React from 'react';

const SagaLogo = ({ className = "h-8", showText = true }) => {
    return (
        <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
            <div className="relative">
                <svg
                    viewBox="0 0 100 100"
                    className="w-10 h-10 transform transition-transform duration-500 group-hover:rotate-12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Outer Ring */}
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" className="opacity-20" />

                    {/* Dragon/Brush Tail - S Shape */}
                    <path
                        d="M70 25C70 25 30 10 20 40C10 70 50 90 80 75C80 75 95 65 75 55C55 45 30 60 30 60"
                        stroke="var(--saga-accent)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,0,60,0.5)] transition-all duration-300 group-hover:stroke-[10px]"
                    />

                    {/* Inner Accent */}
                    <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-pulse" />
                </svg>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {showText && (
                <span className="text-2xl font-black tracking-widest text-shonen-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-900 to-red-600 dark:from-white dark:via-white dark:to-red-500">
                    SAGA
                </span>
            )}
        </div>
    );
};

export default SagaLogo;
