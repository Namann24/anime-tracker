import express from "express";
import Review from "../models/Review.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// @desc    Get latest global reviews
// @route   GET /api/reviews
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("user", "username profilePic")
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Neural linkage failed" });
    }
});

// @desc    Get all reviews for an anime
// @route   GET /api/reviews/:animeId
router.get("/:animeId", async (req, res) => {
    try {
        const reviews = await Review.find({ animeId: req.params.animeId })
            .populate("user", "username")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Create or update a review
// @route   POST /api/reviews/:animeId
router.post("/:animeId", protect, async (req, res) => {
    try {
        const { rating, content } = req.body;
        const animeId = req.params.animeId;
        const user = req.user._id;

        // Upsert review (Update if exists, else create)
        const review = await Review.findOneAndUpdate(
            { animeId, user },
            { rating, content },
            { new: true, upsert: true, runValidators: true }
        ).populate("user", "username");

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
