import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKED_URL}/api/clubs`;

// Get token helper
const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getClubs = async () => {
    return await axios.get(API_URL);
};

export const getClubDetails = async (id) => {
    return await axios.get(`${API_URL}/${id}`);
};

export const createClub = async (data) => {
    return await axios.post(API_URL, data, { headers: authHeader() });
};

export const joinClub = async (id) => {
    return await axios.post(`${API_URL}/${id}/join`, {}, { headers: authHeader() });
};

export const getClubDiscussions = async (id) => {
    return await axios.get(`${API_URL}/${id}/discuss`);
};

export const createDiscussion = async (id, data) => {
    return await axios.post(`${API_URL}/${id}/discuss`, data, { headers: authHeader() });
};

export const likeDiscussion = async (clubId, discussionId) => {
    return await axios.put(`${API_URL}/${clubId}/discuss/${discussionId}/like`, {}, { headers: authHeader() });
};

export const addComment = async (clubId, discussionId, content) => {
    return await axios.post(`${API_URL}/${clubId}/discuss/${discussionId}/comment`, { content }, { headers: authHeader() });
};
export const voteInPoll = async (clubId, discussionId, optionIndex) => {
    return await axios.put(`${API_URL}/${clubId}/discuss/${discussionId}/vote`, { optionIndex }, { headers: authHeader() });
};

export const leaveClub = async (id) => {
    return await axios.post(`${API_URL}/${id}/leave`, {}, { headers: authHeader() });
};
