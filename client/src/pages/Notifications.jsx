import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import SagaButton from "../components/common/SagaButton";

export default function Notifications() {
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const { notifications, loading, markSingleAsRead, removeNotification, clearAllNotifications, unreadCount } = useNotifications();
    const [filter, setFilter] = useState("all"); // all, reminder, episode, system

    const handleRead = async (id) => {
        try {
            await markSingleAsRead(id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm("Permanently purge this signal from the stream?", "DELETE SIGNAL");
        if (!isConfirmed) return;

        try {
            await removeNotification(id);
            showToast("Signal purged successfully", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to purge signal", "error");
        }
    };

    const handleClear = async () => {
        const isConfirmed = await confirm("Purge all alerts from the Neural Link?", "ARCHIVE PURGE");
        if (!isConfirmed) return;
        try {
            await clearAllNotifications();
            showToast("Alert Archives Purged", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to purge archives", "error");
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        return n.type === filter;
    });

    if (loading) return (
        <div className="min-h-screen saga-cosmic-bg flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen saga-cosmic-bg text-[var(--saga-text)] pb-20 pt-24 md:pt-32 transition-colors duration-500">
            <div className="layout-shell max-w-5xl section-stack">
                {/* HEADER */}
                <div className="mb-12 md:mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Tactical Alerts</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-shonen-bold text-4xl md:text-7xl tracking-tight uppercase leading-none mb-2">
                                NEURAL <span className="text-red-600">STREAM</span>
                            </h1>
                            <p className="text-gray-500 font-medium italic text-sm md:text-base">
                                {unreadCount > 0 ? `${unreadCount} unread signal${unreadCount > 1 ? 's' : ''} detected` : "All signals processed"}
                            </p>
                        </div>
                        {notifications.length > 0 && (
                            <SagaButton variant="ghost" size="sm" onClick={handleClear}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Purge All
                            </SagaButton>
                        )}
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex gap-3 mb-8 md:mb-12 overflow-x-auto pb-2 no-scrollbar">
                    {[
                        { id: "all", label: "All Signals", icon: "📡" },
                        { id: "reminder", label: "Reminders", icon: "🔔" },
                        { id: "episode", label: "Episodes", icon: "📺" },
                        { id: "system", label: "System", icon: "⚙️" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-3 md:px-6 md:py-3 rounded-xl border font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${filter === tab.id
                                ? "bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(255,0,60,0.3)]"
                                : "bg-white/5 border-white/10 text-gray-500 hover:border-red-600/30"
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* NOTIFICATIONS LIST */}
                {filteredNotifications.length === 0 ? (
                    <div className="saga-glass border border-white/10 p-10 md:p-20 rounded-[2rem] md:rounded-[3rem] text-center">
                        <div className="text-6xl md:text-8xl mb-6 md:mb-8 opacity-20 grayscale">📭</div>
                        <h2 className="text-shonen-bold text-2xl md:text-3xl mb-4 uppercase">Neural Silence</h2>
                        <p className="text-gray-500 max-w-md mx-auto italic text-sm md:text-base">
                            "The stream is quiet. We'll alert you when new chronicles emerge from the void."
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map(n => (
                            <div
                                key={n._id}
                                className={`saga-glass border rounded-2xl p-4 md:p-6 transition-all duration-300 group relative overflow-hidden ${n.isRead
                                    ? 'border-white/5 opacity-60'
                                    : 'border-red-600/20 shadow-[0_0_30px_rgba(255,0,60,0.1)]'
                                    }`}
                            >
                                {/* Glow Effect for Unread */}
                                {!n.isRead && (
                                    <div className="absolute inset-0 bg-red-600/5 blur-xl pointer-events-none"></div>
                                )}

                                <div className="relative z-10 flex items-start gap-4 md:gap-6">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl transition-transform group-hover:scale-110 flex-shrink-0 ${n.type === 'reminder' ? 'bg-orange-600/20' :
                                        n.type === 'episode' ? 'bg-red-600/20' :
                                            'bg-blue-600/20'
                                        }`}>
                                        {n.type === 'reminder' ? '🔔' : n.type === 'episode' ? '📺' : '⚙️'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${n.type === 'reminder' ? 'text-orange-500' :
                                                    n.type === 'episode' ? 'text-red-500' :
                                                        'text-blue-500'
                                                    }`}>
                                                    {n.type === 'reminder' ? 'Tactical Reminder' : n.type === 'episode' ? 'Episode Alert' : 'System Sync'}
                                                </span>
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                            )}
                                        </div>

                                        <p className={`text-base mb-4 leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-white font-medium'
                                            }`}>
                                            {n.message}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                                                {new Date(n.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>

                                            {n.link && (
                                                <Link
                                                    to={n.link}
                                                    onClick={() => !n.isRead && handleRead(n._id)}
                                                    className="text-[9px] text-red-500 uppercase font-black tracking-widest hover:text-red-400 transition-colors"
                                                >
                                                    View Content →
                                                </Link>
                                            )}

                                            {!n.isRead && (
                                                <button
                                                    onClick={() => handleRead(n._id)}
                                                    className="text-[9px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors"
                                                >
                                                    Mark Read
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(n._id)}
                                                className="text-[9px] text-gray-500 hover:text-red-500 uppercase font-black tracking-widest transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                                title="Delete Signal"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
