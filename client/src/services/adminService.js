import api from "./api";

const adminCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds for admin data

const getCached = async (key, fetcher) => {
    const cached = adminCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    const data = await fetcher();
    adminCache.set(key, { data, timestamp: Date.now() });
    return data;
};

// Invalidate cache helper
export const clearAdminCache = (key) => {
    if (key) adminCache.delete(key);
    else adminCache.clear();
};

export const getAllUsers = () => getCached('/admin/users', async () => {
    const response = await api.get("/admin/users");
    return response.data;
});

export const toggleBanUser = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/ban`);
    clearAdminCache('/admin/users'); // Invalidate users cache
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    clearAdminCache('/admin/users');
    return response.data;
};

export const getSystemStats = () => getCached('/admin/stats', async () => {
    const response = await api.get("/admin/stats");
    return response.data;
});

export const getUserAnalytics = () => getCached('/admin/analytics/users', async () => {
    const response = await api.get("/admin/analytics/users");
    return response.data;
});

export const getAllDiscussions = () => getCached('/admin/discussions', async () => {
    const response = await api.get("/admin/discussions");
    return response.data;
});

export const deleteDiscussion = async (discussionId) => {
    const response = await api.delete(`/admin/discussions/${discussionId}`);
    clearAdminCache('/admin/discussions');
    return response.data;
};

export const getAllClubs = () => getCached('/admin/clubs', async () => {
    const response = await api.get("/admin/clubs");
    return response.data;
});

export const deleteClub = async (clubId) => {
    const response = await api.delete(`/admin/clubs/${clubId}`);
    clearAdminCache('/admin/clubs');
    return response.data;
};

export const getAllReviews = () => getCached('/admin/reviews', async () => {
    const response = await api.get("/admin/reviews");
    return response.data;
});

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    clearAdminCache('/admin/reviews');
    return response.data;
};

export const toggleDiscussionNSFW = async (id) => {
    const response = await api.patch(`/admin/discussions/${id}/nsfw`);
    clearAdminCache('/admin/discussions');
    return response.data;
};

export const toggleClubNSFW = async (id) => {
    const response = await api.patch(`/admin/clubs/${id}/nsfw`);
    clearAdminCache('/admin/clubs');
    return response.data;
};
