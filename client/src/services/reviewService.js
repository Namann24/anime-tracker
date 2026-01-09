import axios from "axios";

const API_URL = "http://localhost:5001/api/reviews";

// Helper to get auth header with token
const authHeader = () => {
    const token = localStorage.getItem("token");
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

export const getReviews = async (animeId) => {
    return await axios.get(`${API_URL}/${animeId}`);
};

export const getGlobalReviews = async () => {
    return await axios.get(API_URL);
};

export const postReview = async (animeId, reviewData) => {
    return await axios.post(`${API_URL}/${animeId}`, reviewData, { headers: authHeader() });
};
