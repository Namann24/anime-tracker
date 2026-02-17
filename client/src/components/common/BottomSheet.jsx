import { useEffect, useState } from 'react';

export default function BottomSheet({ isOpen, onClose, children, title }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setVisible(false), 300); // Wait for animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[200] flex items-end md:items-center justify-center pointer-events-none`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-700 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Sheet / Modal Panel */}
            <div className={`
                relative w-full md:w-auto md:min-w-[500px] md:max-w-2xl 
                bg-[#070707]/90 md:bg-[#0d0d0d]/95
                backdrop-blur-2xl
                border-t md:border border-white/[0.08] md:rounded-[3rem] rounded-t-[3.5rem] 
                shadow-[0_-30px_80px_rgba(0,0,0,0.9)] md:shadow-2xl
                transition-all duration-700 cubic-bezier(0.32, 0.72, 0, 1) pointer-events-auto
                flex flex-col max-h-[92vh] md:max-h-[85vh]
                ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full md:translate-y-20 opacity-0 md:scale-95'}
            `}>
                {/* Holographic Edge Glow */}
                <div className={`absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent blur-[1px] transition-all duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                {/* Drag Handle (Mobile Only) */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-5 py-3 md:p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-[var(--saga-text)]">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="hidden md:flex p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-5 py-5 md:p-8 no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
