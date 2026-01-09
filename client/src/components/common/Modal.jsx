import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A reusable Modal component with premium styling.
 * 
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {function} onClose - Function to call when closing the modal.
 * @param {string} title - The modal title.
 * @param {string} message - The main warning message.
 * @param {function} onConfirm - Function to call when confirming the action.
 * @param {string} confirmText - Text for the confirm button (default: "Confirm").
 * @param {boolean} isDestructive - Whether the action is destructive (renders red button).
 */
export default function Modal({ isOpen, onClose, title, message, onConfirm, confirmText = "Confirm", isDestructive = false }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#111419] rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-white/10 transform transition-all scale-100 p-6">
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                        {isDestructive ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all transform active:scale-95 ${isDestructive
                                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/30'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/30'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
