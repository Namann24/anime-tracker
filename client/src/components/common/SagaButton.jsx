import React from 'react';

const SagaButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    full = false,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none group overflow-hidden";

    const variants = {
        primary: "bg-saga-accent text-white shadow-neon-red hover:bg-saga-accent/90",
        secondary: "bg-saga-surface text-saga-text border border-saga-border hover:bg-saga-surface-hover backdrop-blur-md",
        outline: "bg-transparent text-saga-text border-2 border-saga-border hover:border-saga-accent/50 hover:bg-saga-accent/10",
        ghost: "bg-transparent text-saga-text-dim hover:text-saga-text hover:bg-saga-surface-hover",
        impact: "bg-saga-text text-saga-bg shadow-impact hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neon-red active:translate-x-0 active:translate-y-0 active:shadow-none"
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px] rounded-md",
        md: "px-6 py-3 text-xs rounded-lg",
        lg: "px-8 py-4 text-sm rounded-xl",
        xl: "px-10 py-5 text-base rounded-2xl"
    };

    const handleClick = (e) => {
        if (navigator.vibrate) {
            try { navigator.vibrate(10); } catch (err) { /* ignore */ }
        }
        if (props.onClick) props.onClick(e);
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
            onClick={handleClick}
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
