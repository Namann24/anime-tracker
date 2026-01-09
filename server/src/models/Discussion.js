import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const DiscussionSchema = new mongoose.Schema({
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    title: { type: String, required: true },
    isNSFW: { type: Boolean, default: false },
    content: { type: String, required: true }, // Main post body
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comments: [CommentSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    poll: {
        question: { type: String },
        options: [{
            text: { type: String },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        }]
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Discussion", DiscussionSchema);
