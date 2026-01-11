import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getNotifications, markAsRead, markAllAsRead as apiMarkAllAsRead, deleteNotification as apiDeleteNotification, clearNotifications as apiClearNotifications } from "../services/notificationService";
import { useAuth } from "./AuthContext";
import { useWatchlist } from "./WatchlistContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    // Safely consume useWatchlist - check if it exists (in case of different provider order in future)
    let watchlist = [];
    try {
        const watchlistCtx = useWatchlist();
        if (watchlistCtx) watchlist = watchlistCtx.watchlist;
    } catch (e) {
        // Ignore if outside provider
    }

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const isChecking = useRef(false);

    // We need to access watchlist to check for reminders, but we can't import useWatchlist here 
    // if NotificationContext is outside of WatchlistProvider.
    // Assuming App structure: Auth -> Notification -> Watchlist. 
    // Actually, usually Notification is global. 
    // Let's implement a separate function we can export, or handle it inside a component.
    // Better: Add a method checkReminders that can be called from App.jsx or MainLayout.

    const refreshNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await getNotifications();
            // Sort: Unread first, then by date descending
            const sorted = [...res.data].sort((a, b) => {
                if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setNotifications(sorted);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error("Failed to fetch notifications", err);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    const checkEpisodeReminders = useCallback(async (watchlist) => {
        if (!watchlist || watchlist.length === 0 || isChecking.current) return;

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const lastCheckKey = `reminders_checked_${new Date().toDateString()}`;

        if (localStorage.getItem(lastCheckKey)) return; // Already checked today

        // Prevent concurrent checks
        isChecking.current = true;
        // Lock immediately to prevent other triggers while this one is in flight
        localStorage.setItem(lastCheckKey, 'true');

        try {
            // Get today's schedule
            const { getAnimeSchedule } = await import("../services/animeService");
            const { createNotification } = await import("../services/notificationService");

            const schedule = await getAnimeSchedule(today);
            const airingToday = new Set(schedule.map(a => a.mal_id));

            const watching = watchlist.filter(a => a.status === 'Watching');

            let newNotifications = 0;

            for (const anime of watching) {
                if (airingToday.has(anime.mal_id)) {
                    // Double check if we already have a notification for this anime today
                    const alreadyExists = notifications.some(n =>
                        n.type === 'episode' &&
                        n.message.includes(anime.title) &&
                        new Date(n.createdAt).toDateString() === new Date().toDateString()
                    );

                    if (!alreadyExists) {
                        try {
                            // Create notification
                            await createNotification({
                                type: 'episode',
                                message: `New Episode of ${anime.title} airs today!`,
                                link: `/anime/${anime.mal_id}`,
                                animeId: anime.mal_id
                            });
                            newNotifications++;
                        } catch (err) {
                            // Ignore duplication error from server if it happens
                            if (err.response?.status !== 400) throw err;
                        }
                    }
                }
            }

            if (newNotifications > 0) {
                refreshNotifications();
            }
        } catch (error) {
            console.error("Reminder check failed", error);
            // If failed, we might want to allow another check later, 
            // but for safety we usually keep it locked to avoid loops.
        } finally {
            isChecking.current = false;
        }
    }, [refreshNotifications, notifications]);

    useEffect(() => {
        if (user) {
            refreshNotifications();
            const interval = setInterval(refreshNotifications, 60000); // 1 min polling
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, refreshNotifications]);

    // Check for episode reminders when watchlist loads/changes
    useEffect(() => {
        if (user && watchlist.length > 0) {
            checkEpisodeReminders(watchlist);
        }
    }, [user, watchlist, checkEpisodeReminders]);

    const markSingleAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => {
                const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
                return updated.sort((a, b) => {
                    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            });
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };
    const markAllRead = async () => {
        try {
            await apiMarkAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const removeNotification = async (id) => {
        try {
            await apiDeleteNotification(id);
            const wasUnread = notifications.find(n => n._id === id && !n.isRead);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const clearAllNotifications = async () => {
        try {
            await apiClearNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refreshNotifications,
            markSingleAsRead,
            markAllRead,
            removeNotification,
            clearAllNotifications,
            checkEpisodeReminders
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
