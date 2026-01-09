import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["like", "comment", "system", "episode", "reminder"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // Path to redirect user (e.g., /clubs/67724.../discuss/...)
    },
    animeId: {
        type: String, // MAL ID for anime reminders
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
