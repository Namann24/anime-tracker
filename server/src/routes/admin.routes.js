import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import User from "../models/User.js";

const router = express.Router();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
router.patch("/users/:id/ban", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent banning other admins
        if (user.role === 'admin') {
            return res.status(400).json({ message: "Cannot ban an admin" });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({
            message: user.isBanned ? "User banned" : "User unbanned",
            isBanned: user.isBanned
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete("/users/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: "Cannot delete an admin" });
        }

        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

import Review from "../models/Review.js";
import Discussion from "../models/Discussion.js";
import Club from "../models/Club.js";
import Feedback from "../models/feedback.js";

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get("/stats", protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalDiscussions = await Discussion.countDocuments();
        const totalClubs = await Club.countDocuments();
        const totalFeedbacks = await Feedback.countDocuments();
        const bannedUsers = await User.countDocuments({ isBanned: true });

        res.json({
            users: totalUsers,
            reviews: totalReviews,
            discussions: totalDiscussions,
            clubs: totalClubs,
            feedbacks: totalFeedbacks,
            bannedUsers
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get user registration trends (last 7 days)
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
router.get("/analytics/users", protect, admin, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const users = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get all discussions for moderation
// @route   GET /api/admin/discussions
// @access  Private/Admin
router.get("/discussions", protect, admin, async (req, res) => {
    try {
        const discussions = await Discussion.find({})
            .populate("author", "username profilePic")
            .populate("club", "name")
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;

// @desc    Delete discussion (Content Moderation)
// @route   DELETE /api/admin/discussions/:id
// @access  Private/Admin
router.delete("/discussions/:id", protect, admin, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        await discussion.deleteOne();
        res.json({ message: "Discussion removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


// @desc    Toggle NSFW status for discussion
// @route   PATCH /api/admin/discussions/:id/nsfw
// @access  Private/Admin
router.patch("/discussions/:id/nsfw", protect, admin, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: "Discussion not found" });

        discussion.isNSFW = !discussion.isNSFW;
        await discussion.save();

        res.json({ message: `Discussion marked as ${discussion.isNSFW ? '18+' : 'Safe'}`, isNSFW: discussion.isNSFW });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Toggle NSFW status for club
// @route   PATCH /api/admin/clubs/:id/nsfw
// @access  Private/Admin
router.patch("/clubs/:id/nsfw", protect, admin, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: "Club not found" });

        club.isNSFW = !club.isNSFW;
        await club.save();

        res.json({ message: `Club marked as ${club.isNSFW ? '18+' : 'Safe'}`, isNSFW: club.isNSFW });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get all clubs for moderation
// @route   GET /api/admin/clubs
// @access  Private/Admin
router.get("/clubs", protect, admin, async (req, res) => {
    try {
        const clubs = await Club.find({})
            .populate("admin", "username profilePic")
            .populate("members", "username") // Optional, removed if too heavy
            .sort({ createdAt: -1 });
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Delete club (Community Moderation)
// @route   DELETE /api/admin/clubs/:id
// @access  Private/Admin
router.delete("/clubs/:id", protect, admin, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: "Club not found" });
        }

        await club.deleteOne();
        res.json({ message: "Club removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private/Admin
router.get("/reviews", protect, admin, async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("user", "username profilePic")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
router.delete("/reviews/:id", protect, admin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        await review.deleteOne();
        res.json({ message: "Review removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
