import axios from "axios";

const API = "http://localhost:5001/api/auth";

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
