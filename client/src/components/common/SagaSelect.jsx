import React, { useState, useRef, useEffect } from 'react';

const SagaSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select Option",
    label,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full saga-glass border border-saga-border rounded-xl px-4 py-3 flex items-center justify-between transition-all
          group hover:border-saga-accent/50 hover:shadow-neon-red
          ${isOpen ? 'border-saga-accent/50 shadow-neon-red' : ''}
        `}
            >
                <span className={`text-sm font-bold ${selectedOption ? 'text-saga-text' : 'text-saga-text-dim'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <svg
                    className={`w-4 h-4 text-saga-text-dim transition-transform duration-300 ${isOpen ? 'rotate-180 text-saga-accent' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] w-full z-[100] bg-saga-surface/95 backdrop-blur-3xl border border-saga-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 origin-top duration-200">
                    {/* Decorative Manga Accent */}
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-600 z-20 pointer-events-none"></div>

                    <div className="absolute inset-0 halftone opacity-[0.05] pointer-events-none"></div>
                    <div className="max-h-60 overflow-y-auto no-scrollbar relative z-10 py-1">
                        {normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                  w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between
                                  hover:bg-saga-accent/10 hover:text-saga-accent
                                  ${value === option.value ? 'bg-saga-accent/20 text-saga-accent' : 'text-saga-text'}
                                `}
                            >
                                {option.label}
                                {value === option.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(255,0,60,1)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SagaSelect;
