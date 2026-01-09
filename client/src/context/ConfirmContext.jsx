import React, { createContext, useContext, useState, useCallback } from 'react';
import SagaButton from '../components/common/SagaButton';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState(null);

    const confirm = useCallback((message, title = "TACTICAL DECISION") => {
        return new Promise((resolve) => {
            setConfig({
                message,
                title,
                resolve,
            });
        });
    }, []);

    const handleClose = (value) => {
        if (config?.resolve) {
            config.resolve(value);
        }
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {config && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[var(--saga-surface)] border-4 border-black rounded-[3rem] p-10 relative shadow-[0_0_100px_rgba(255,0,60,0.2)] overflow-hidden">
                        {/* Manga Style Deco */}
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-red-600 pointer-events-none"></div>
                        <div className="absolute inset-0 halftone opacity-[0.03] pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-2 h-2 rounded-full bg-red-600 shadow-pulse"></span>
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Neural Verification</span>
                            </div>

                            <h2 className="text-shonen-bold text-4xl md:text-5xl tracking-tighter uppercase leading-tight mb-6">
                                {config.title}
                            </h2>

                            <p className="text-[var(--saga-text-dim)] font-medium italic text-lg leading-relaxed mb-10">
                                "{config.message}"
                            </p>

                            <div className="flex gap-4">
                                <SagaButton
                                    variant="ghost"
                                    full
                                    onClick={() => handleClose(false)}
                                    className="!border-white/10"
                                >
                                    RETREAT
                                </SagaButton>
                                <SagaButton
                                    variant="primary"
                                    full
                                    onClick={() => handleClose(true)}
                                    className="shadow-impact"
                                >
                                    EXECUTE
                                </SagaButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
    return context;
};
