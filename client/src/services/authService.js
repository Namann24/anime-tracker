import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKED_URL ||
  "http://localhost:5001";

const API = `${API_BASE_URL}/api/auth`;

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
};

export const getProfile = async (username) => {
  const res = await axios.get(`${API}/profile/${username}`);
  return res.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API}/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updatePersonalization = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API}/personalization`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getLeaderboard = async () => {
  const res = await axios.get(`${API}/leaderboard`);
  return res.data;
};
