import React from 'react';

const SagaInput = ({
    label,
    icon,
    error,
    className = "",
    containerClassName = "",
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-saga-text-dim ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {/* Shadow Accent */}
                <div className="absolute inset-0 bg-saga-accent/0 rounded-xl blur-lg transition-all duration-300 group-focus-within:bg-saga-accent/10"></div>

                {/* Input Wrapper */}
                <div className={`
          relative flex items-center saga-glass border rounded-xl overflow-hidden transition-all duration-300
          ${error ? 'border-red-500' : 'border-saga-border group-hover:border-saga-text-dim/50 group-focus-within:border-saga-accent/50 group-focus-within:shadow-neon-red'}
        `}>
                    {icon && (
                        <div className="pl-4 text-saga-text-dim group-focus-within:text-saga-accent transition-colors">
                            {icon}
                        </div>
                    )}

                    <input
                        className={`
              w-full bg-transparent px-4 py-2.5 text-sm text-saga-text placeholder-saga-text-dim focus:outline-none focus:ring-0
              ${className}
            `}
                        {...props}
                    />

                    {/* Animated Bottom Border */}
                    <div className="absolute bottom-0 left-0 h-[2px] bg-saga-accent transition-all duration-500 translate-y-full group-focus-within:translate-y-0 w-full opacity-50"></div>
                </div>

                {error && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in slide-in-from-top-1">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SagaInput;
