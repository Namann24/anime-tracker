import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationDropdown({ onClose }) {
    const { notifications, markSingleAsRead, markAllRead, removeNotification } = useNotifications();
    const recent = notifications.slice(0, 5);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if clicking the notification bell button
            const isNotificationButton = event.target.closest('[data-notification-toggle]');
            if (isNotificationButton) return;

            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Small delay to prevent immediate close on open
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-4 w-[90vw] max-w-[360px] saga-glass border-saga rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-[100] saga-animate-in"
        >
            <div className="p-6 border-b border-[var(--saga-border)] flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    <h3 className="text-shonen-bold text-lg uppercase tracking-widest text-[var(--saga-text)]">Tactical Alerts</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            markAllRead();
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-[var(--saga-text-dim)] hover:text-white hover:border-red-600/50 hover:bg-red-600/5 transition-all uppercase tracking-[0.2em] flex items-center gap-2 group/markall"
                    >
                        <span className="w-1 h-1 rounded-full bg-gray-500 group-hover/markall:bg-red-500 transition-colors"></span>
                        Mark All Read
                    </button>
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] text-red-600 hover:text-white hover:border-red-600 transition-all"
                        title="View Archive"
                    >
                        📂
                    </Link>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {recent.length === 0 ? (
                    <div className="p-16 text-center">
                        <span className="text-5xl mb-4 block opacity-20">🎐</span>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">The abyss is silent.</p>
                    </div>
                ) : (
                    recent.map(n => (
                        <div
                            key={n._id}
                            className={`p-6 border-b border-[var(--saga-border)] hover:bg-white/5 transition-all relative group ${!n.isRead ? 'bg-red-600/5' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className="text-xl mt-0.5 grayscale group-hover:grayscale-0 transition-all">
                                    {n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'reminder' ? '🔔' : '📢'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs leading-relaxed mb-2 ${!n.isRead ? 'text-[var(--saga-text)] font-bold' : 'text-[var(--saga-text-dim)]'}`}>
                                        {n.message}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] text-red-600 font-black uppercase tracking-widest">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                        {!n.isRead && <span className="w-1 h-1 rounded-full bg-red-600 animate-ping"></span>}
                                    </div>
                                </div>
                                {!n.isRead ? (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            markSingleAsRead(n._id);
                                        }}
                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-600 transition-all border border-red-600/20 z-20 relative"
                                        title="Mark as read"
                                    >
                                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-neon-red"></div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeNotification(n._id);
                                        }}
                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-600/20 text-gray-500 hover:text-red-500 transition-all border border-white/10 z-20 relative opacity-0 group-hover:opacity-100"
                                        title="Delete alert"
                                    >
                                        <span className="text-[10px]">✕</span>
                                    </button>
                                )}
                            </div>
                            <Link
                                to={n.link || "/notifications"}
                                onClick={onClose}
                                className="absolute inset-0 z-10"
                            ></Link>
                        </div>
                    ))
                )}
            </div>

            <Link
                to="/notifications"
                onClick={onClose}
                className="block w-full py-5 bg-white/5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[var(--saga-text-dim)] hover:text-red-600 hover:bg-white/10 transition-all"
            >
                Enter Neural Center →
            </Link>
        </div>
    );
}
