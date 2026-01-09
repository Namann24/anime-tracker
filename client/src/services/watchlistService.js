import api from "./api";

export const getWatchlist = () => api.get("/watchlist");

export const addWatchlist = (data) =>
  api.post("/watchlist", data);

export const deleteWatchlist = (id) =>
  api.delete(`/watchlist/${id}`);

export const updateWatchStatus = (id, status) =>
  api.put(`/watchlist/${id}`, { status });

export const updateWatchlistDetails = (id, data) =>
  api.put(`/watchlist/${id}/details`, data);

export const resetWatchlist = (id) =>
  api.put(`/watchlist/${id}/reset`);

export const toggleEpisode = (id, season, episode) =>
  api.put(`/watchlist/${id}/episode`, {
    season,
    episode,
  });
