import express from "express";
import Notification from "../models/Notification.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a notification (e.g. for reminders)
router.post("/", protect, async (req, res) => {
    try {
        const { type, message, link, animeId } = req.body;

        // Check for duplicate reminder if animeId is provided
        if (type === 'reminder' && animeId) {
            const existing = await Notification.findOne({
                user: req.user.id,
                type: 'reminder',
                animeId: animeId
            });

            if (existing) {
                return res.status(400).json({
                    message: "Reminder already exists for this anime",
                    exists: true
                });
            }
        }

        const notification = await Notification.create({
            user: req.user.id,
            type,
            message,
            link,
            animeId
        });
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET all notifications for user
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Mark as read
router.put("/:id/read", protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true }
        );
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Check if reminder exists for anime
router.get("/check/:animeId", protect, async (req, res) => {
    try {
        const reminder = await Notification.findOne({
            user: req.user.id,
            type: 'reminder',
            animeId: req.params.animeId
        });
        res.json({ exists: !!reminder, reminder });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete reminder by animeId
router.delete("/reminder/:animeId", protect, async (req, res) => {
    try {
        await Notification.deleteMany({
            user: req.user.id,
            type: 'reminder',
            animeId: req.params.animeId
        });
        res.json({ message: "Reminder removed" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Clear all
router.delete("/", protect, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.json({ message: "Notifications cleared" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
