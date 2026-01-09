import api from './api';

export const submitFeedback = async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
};

export const getAllFeedback = async () => {
    const response = await api.get('/feedback/all');
    return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
    const response = await api.put(`/feedback/${id}/status`, { status });
    return response.data;
};

export const deleteFeedback = async (id) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
};
