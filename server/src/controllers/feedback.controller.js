import Feedback from '../models/feedback.js';

export const createFeedback = async (req, res) => {
    try {
        const { name, email, type, message } = req.body;
        const feedback = new Feedback({
            name,
            email,
            type,
            message,
            user: req.user ? req.user.id : null
        });
        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully", data: feedback });
    } catch (err) {
        res.status(500).json({ message: "Error submitting feedback", error: err.message });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ message: "Error fetching feedback", error: err.message });
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: "Status updated", data: feedback });
    } catch (err) {
        res.status(500).json({ message: "Error updating status", error: err.message });
    }
};

export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        await Feedback.findByIdAndDelete(id);
        res.json({ message: "Feedback deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting feedback", error: err.message });
    }
};
