import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl p-0 min-w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] saga-animate-in relative overflow-hidden group"
                    >
                        {/* Glowing Side Accent */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${toast.type === 'error' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}></div>

                        <div className="flex items-center gap-4 p-4 pl-5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-600/10 text-red-500'}`}>
                                {toast.type === 'error' ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <div>
                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${toast.type === 'error' ? 'text-orange-500' : 'text-red-500'}`}>
                                    {toast.type === 'error' ? 'System Failure' : 'Operation Complete'}
                                </div>
                                <p className="text-xs font-bold text-white leading-tight">{toast.message}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className={`absolute bottom-0 left-0 h-[2px] w-full ${toast.type === 'error' ? 'bg-orange-500/20' : 'bg-red-600/20'}`}>
                            <div
                                className={`h-full transition-all linear ${toast.type === 'error' ? 'bg-orange-500' : 'bg-red-600'}`}
                                style={{
                                    animation: 'toast-progress 4s linear forwards'
                                }}
                            ></div>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-2 right-2 p-1 text-white/20 hover:text-white transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
