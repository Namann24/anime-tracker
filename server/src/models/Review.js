import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        animeId: {
            type: Number,
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent multiple reviews from the same user for the same anime
reviewSchema.index({ animeId: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
