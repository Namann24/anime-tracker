import { useEffect, useState } from "react";
import { getNotifications, markAsRead, clearNotifications, deleteReminder } from "../services/notificationService";
import { Link } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import SagaButton from "../components/common/SagaButton";

export default function Notifications() {
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, reminder, episode, system

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteReminder = async (notification) => {
        const isConfirmed = await confirm(`Remove reminder for this anime?`, "REMOVE REMINDER");
        if (!isConfirmed) return;

        try {
            if (notification.animeId) {
                await deleteReminder(notification.animeId);
            }
            setNotifications(prev => prev.filter(n => n._id !== notification._id));
            showToast("Reminder removed successfully", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to remove reminder", "error");
        }
    };

    const handleClear = async () => {
        const isConfirmed = await confirm("Purge all alerts from the Neural Link?", "ARCHIVE PURGE");
        if (!isConfirmed) return;
        try {
            await clearNotifications();
            setNotifications([]);
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return (
        <div className="min-h-screen saga-cosmic-bg flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen saga-cosmic-bg text-[var(--saga-text)] pb-24 pt-32 px-6 transition-colors duration-500">
            <div className="max-w-5xl mx-auto">
                {/* HEADER */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Tactical Alerts</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-shonen-bold text-5xl md:text-7xl tracking-tight uppercase leading-none mb-2">
                                NEURAL <span className="text-red-600">STREAM</span>
                            </h1>
                            <p className="text-gray-500 font-medium italic">
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
                <div className="flex gap-3 mb-12 overflow-x-auto pb-2 no-scrollbar">
                    {[
                        { id: "all", label: "All Signals", icon: "📡" },
                        { id: "reminder", label: "Reminders", icon: "🔔" },
                        { id: "episode", label: "Episodes", icon: "📺" },
                        { id: "system", label: "System", icon: "⚙️" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab.id
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
                    <div className="saga-glass border border-white/10 p-20 rounded-[3rem] text-center">
                        <div className="text-8xl mb-8 opacity-20 grayscale">📭</div>
                        <h2 className="text-shonen-bold text-3xl mb-4 uppercase">Neural Silence</h2>
                        <p className="text-gray-500 max-w-md mx-auto italic">
                            "The stream is quiet. We'll alert you when new chronicles emerge from the void."
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map(n => (
                            <div
                                key={n._id}
                                className={`saga-glass border rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden ${n.isRead
                                    ? 'border-white/5 opacity-60'
                                    : 'border-red-600/20 shadow-[0_0_30px_rgba(255,0,60,0.1)]'
                                    }`}
                            >
                                {/* Glow Effect for Unread */}
                                {!n.isRead && (
                                    <div className="absolute inset-0 bg-red-600/5 blur-xl pointer-events-none"></div>
                                )}

                                <div className="relative z-10 flex items-start gap-6">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${n.type === 'reminder' ? 'bg-orange-600/20' :
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

                                            {n.type === 'reminder' && (
                                                <button
                                                    onClick={() => handleDeleteReminder(n)}
                                                    className="text-[9px] text-gray-500 hover:text-red-500 uppercase font-black tracking-widest transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            )}
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
