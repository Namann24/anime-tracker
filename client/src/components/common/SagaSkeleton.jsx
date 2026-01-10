import React from 'react';

export default function SagaSkeleton({ type = 'card', className = '' }) {
    if (type === 'card') {
        return (
            <div className={`aspect-[2/3] bg-saga-surface rounded-2xl border border-saga-border overflow-hidden relative group ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-saga-surface-hover to-transparent -translate-x-full animate-shimmer"></div>
                <div className="absolute bottom-0 inset-x-0 p-4 space-y-2">
                    <div className="h-4 bg-saga-surface-hover rounded-full w-3/4"></div>
                    <div className="h-2 bg-saga-surface-hover rounded-full w-1/2 opacity-50"></div>
                </div>
            </div>
        );
    }

    if (type === 'hero') {
        return (
            <div className={`h-[400px] w-full bg-saga-surface rounded-3xl border border-saga-border relative overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-saga-surface-hover to-transparent -translate-x-full animate-shimmer"></div>
                <div className="absolute bottom-12 left-12 space-y-4">
                    <div className="h-4 w-32 bg-saga-surface-hover rounded-full"></div>
                    <div className="h-16 w-96 bg-saga-surface-hover rounded-2xl"></div>
                    <div className="flex gap-4">
                        <div className="h-12 w-32 bg-saga-surface-hover rounded-xl"></div>
                        <div className="h-12 w-32 bg-saga-surface-hover rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'text') {
        return (
            <div className={`h-4 bg-[var(--saga-surface-hover)] rounded-full animate-shimmer ${className}`}></div>
        );
    }

    return null;
}
