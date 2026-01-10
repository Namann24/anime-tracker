import { createContext, useContext, useState, useEffect } from "react";
import { getWatchlist, addWatchlist, deleteWatchlist } from "../services/watchlistService";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(() => {
    const saved = localStorage.getItem("showSpoilers");
    return saved === "true";
  });
  const [showNSFW, setShowNSFW] = useState(() => {
    const saved = localStorage.getItem("showNSFW");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("showSpoilers", showSpoilers);
  }, [showSpoilers]);

  useEffect(() => {
    localStorage.setItem("showNSFW", showNSFW);
  }, [showNSFW]);

  useEffect(() => {
    if (user) {
      refreshWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const refreshWatchlist = async () => {
    // Silent refresh if data exists, valid loader if empty
    if (watchlist.length === 0) setLoading(true);
    try {
      const res = await getWatchlist();
      setWatchlist(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Failed to load watchlist", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Optimistic Actions ---

  const addToWatchlist = async (anime) => {
    if (!user) {
      showToast("Login to track your saga", "error");
      return;
    }

    // 1. Optimistic Update
    const optimisticItem = {
      _id: `temp-${Date.now()}`, // Temp ID
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.image_url,
      score: 0,
      status: 'watching',
      progress: 0,
      totalEpisodes: anime.episodes || 12,
      createdAt: new Date().toISOString()
    };

    const prevWatchlist = [...watchlist];
    setWatchlist(prev => [optimisticItem, ...prev]);
    showToast("Added to Chronicles", "success");

    // 2. API Call
    try {
      await addWatchlist({
        mal_id: anime.mal_id,
        title: anime.title,
        image: anime.images?.jpg?.image_url,
        totalEpisodes: anime.episodes
      });
      // 3. Silent Refresh to get real ID
      refreshWatchlist();
    } catch (err) {
      // 4. Rollback
      setWatchlist(prevWatchlist);
      showToast("Failed to update archives", "error");
    }
  };

  const removeFromWatchlist = async (id) => {
    // 1. Snapshot
    const prevWatchlist = [...watchlist];
    const item = watchlist.find(i => i._id === id || i.mal_id === id); // Handle both DB ID and MAL ID check if needed

    // 2. Optimistic Update
    // 2. Optimistic Update
    setWatchlist(prev => prev.filter(i => i._id !== id));
    showToast("Removed from Chronicles", "success");

    // 3. API Call
    try {
      await deleteWatchlist(id);
    } catch (err) {
      // 4. Rollback
      setWatchlist(prevWatchlist);
      showToast("Failed to delete", "error");
    }
  };

  // Helper to optimistically update or reload
  const updateLocalWatchlist = (newData) => {
    // If newData is array, replace
    if (Array.isArray(newData)) {
      setWatchlist(newData);
    } else {
      // If it's a single updated item, map it
      setWatchlist(prev => prev.map(a => a._id === newData._id ? newData : a));
    }
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loading,
      showSpoilers,
      setShowSpoilers,
      showNSFW,
      setShowNSFW,
      refreshWatchlist,
      updateLocalWatchlist,
      addToWatchlist,
      removeFromWatchlist
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};
