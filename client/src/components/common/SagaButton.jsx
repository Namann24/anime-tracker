import React from 'react';

const SagaButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none group overflow-hidden";

    const variants = {
        primary: "bg-red-600 text-white shadow-[0_0_20px_rgba(255,0,60,0.3)] hover:shadow-[0_0_35px_rgba(255,0,60,0.5)] hover:bg-red-700",
        secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/30",
        outline: "bg-transparent text-white border-2 border-white/20 hover:border-red-600/50 hover:bg-red-600/10",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        impact: "bg-white text-black shadow-impact hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(255,0,60,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px] rounded-md",
        md: "px-6 py-3 text-xs rounded-lg",
        lg: "px-8 py-4 text-sm rounded-xl",
        xl: "px-10 py-5 text-base rounded-2xl"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {/* Gloss Effect for non-ghost/outline */}
            {variant !== 'ghost' && variant !== 'outline' && (
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
            )}

            {/* Speed Lines on Hover (for primary/impact) */}
            {(variant === 'primary' || variant === 'impact') && (
                <div className="absolute inset-0 speed-lines opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            )}

            <div className="relative z-10 flex items-center gap-2">
                {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
                {children}
            </div>

            {/* Impact Flash Effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-100 pointer-events-none"></div>
        </button>
    );
};

export default SagaButton;
