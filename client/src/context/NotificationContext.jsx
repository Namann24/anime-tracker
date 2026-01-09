import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead } from "../services/notificationService";
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

    // We need to access watchlist to check for reminders, but we can't import useWatchlist here 
    // if NotificationContext is outside of WatchlistProvider.
    // Assuming App structure: Auth -> Notification -> Watchlist. 
    // Actually, usually Notification is global. 
    // Let's implement a separate function we can export, or handle it inside a component.
    // Better: Add a method checkReminders that can be called from App.jsx or MainLayout.

    const refreshNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getNotifications();
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error("Failed to fetch notifications", err);
            }
        }
    }, [user]);

    const checkEpisodeReminders = useCallback(async (watchlist) => {
        if (!watchlist || watchlist.length === 0) return;

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const lastCheckKey = `reminders_checked_${new Date().toDateString()}`;

        if (localStorage.getItem(lastCheckKey)) return; // Already checked today

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
                    // Create notification
                    await createNotification({
                        type: 'episode',
                        message: `New Episode of ${anime.title} airs today!`,
                        link: `/anime/${anime.mal_id}`
                    });
                    newNotifications++;
                }
            }

            if (newNotifications > 0) {
                refreshNotifications();
            }

            localStorage.setItem(lastCheckKey, 'true');
        } catch (error) {
            console.error("Reminder check failed", error);
        }
    }, [refreshNotifications]);

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
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refreshNotifications,
            markSingleAsRead,
            checkEpisodeReminders
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
