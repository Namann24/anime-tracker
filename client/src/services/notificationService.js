import api from "./api";

export const getNotifications = async () => {
    return api.get("/notifications");
};

export const markAsRead = async (id) => {
    return api.put(`/notifications/${id}/read`);
};

export const clearNotifications = async () => {
    return api.delete("/notifications");
};

export const markAllAsRead = async () => {
    return api.put("/notifications/read-all");
};

export const createNotification = async (data) => {
    return api.post("/notifications", data);
};

export const checkReminder = async (animeId) => {
    return api.get(`/notifications/check/${animeId}`);
};

export const deleteReminder = async (animeId) => {
    return api.delete(`/notifications/reminder/${animeId}`);
};

export const deleteNotification = async (id) => {
    return api.delete(`/notifications/${id}`);
};
