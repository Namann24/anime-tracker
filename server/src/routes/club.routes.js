import express from "express";
import protect from "../middleware/auth.middleware.js";
import Club from "../models/Club.js";
import Discussion from "../models/Discussion.js";
import Notification from "../models/Notification.js";

const router = express.Router();
// ... (rest of imports and router setup)

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
router.get("/", async (req, res) => {
    try {
        const clubs = await Club.find().populate("admin", "username").sort({ createdAt: -1 });
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        console.log("API: Fetching club details for ID:", req.params.id);
        const club = await Club.findById(req.params.id).populate("admin", "username");
        if (!club) {
            console.log("API: Club not found in DB");
            return res.status(404).json({ message: "Club not found" });
        }
        res.json(club);
    } catch (error) {
        console.error("API: Error fetching club:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        const { name, description, image } = req.body;

        const exists = await Club.findOne({ name });
        if (exists) return res.status(400).json({ message: "Club name already taken" });

        const club = await Club.create({
            name,
            description,
            image,
            admin: req.user._id,
            members: [req.user._id], // Admin is first member
        });

        res.status(201).json(club);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Join a club
// @route   POST /api/clubs/:id/join
// @access  Private
router.post("/:id/join", protect, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: "Club not found" });

        if (club.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already a member" });
        }

        club.members.push(req.user._id);
        await club.save();

        res.json(club);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Create a discussion
// @route   POST /api/clubs/:id/discuss
// @access  Private
router.post("/:id/discuss", protect, async (req, res) => {
    try {
        const { title, content, poll } = req.body;
        const club = await Club.findById(req.params.id);

        if (!club) return res.status(404).json({ message: "Club not found" });
        if (!club.members.includes(req.user._id)) {
            return res.status(403).json({ message: "Must be a member to post" });
        }

        const discussion = await Discussion.create({
            club: club._id,
            title,
            content,
            author: req.user._id,
            poll: poll ? {
                question: poll.question,
                options: poll.options.map(opt => ({ text: opt, votes: [] }))
            } : undefined
        });

        res.status(201).json(discussion);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Get discussions for a club
// @route   GET /api/clubs/:id/discuss
// @access  Public
router.get("/:id/discuss", async (req, res) => {
    try {
        const discussions = await Discussion.find({ club: req.params.id })
            .populate("author", "username")
            .populate("comments.author", "username")
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Like/Unlike a discussion
// @route   PUT /api/clubs/:id/discuss/:discussionId/like
// @access  Private
router.put("/:id/discuss/:discussionId/like", protect, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.discussionId);
        if (!discussion) return res.status(404).json({ message: "Discussion not found" });

        // Check if already liked
        if (discussion.likes.includes(req.user._id)) {
            // Unlike
            discussion.likes = discussion.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            // Like
            discussion.likes.push(req.user._id);

            // Notify author if not self
            if (discussion.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: discussion.author,
                    type: "like",
                    message: `${req.user.username} liked your discussion: "${discussion.title}"`,
                    link: `/clubs/${req.params.id}`
                }).catch(err => console.error("Notification failed", err));
            }
        }

        await discussion.save();
        res.json(discussion.likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Add a comment to a discussion
// @route   POST /api/clubs/:id/discuss/:discussionId/comment
// @access  Private
router.post("/:id/discuss/:discussionId/comment", protect, async (req, res) => {
    try {
        const { content } = req.body;
        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) return res.status(404).json({ message: "Discussion not found" });

        const comment = {
            author: req.user._id,
            content,
            createdAt: new Date(),
        };

        discussion.comments.push(comment);
        await discussion.save();

        // Notify author if not self
        if (discussion.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: discussion.author,
                type: "comment",
                message: `${req.user.username} commented on your discussion: "${discussion.title}"`,
                link: `/clubs/${req.params.id}`
            }).catch(err => console.error("Notification failed", err));
        }

        // Populate the author of the new comment
        const updatedDiscussion = await Discussion.findById(req.params.discussionId)
            .populate("author", "username")
            .populate("comments.author", "username");

        res.status(201).json(updatedDiscussion.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Vote in a poll
// @route   PUT /api/clubs/:id/discuss/:discussionId/vote
// @access  Private
router.put("/:id/discuss/:discussionId/vote", protect, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const discussion = await Discussion.findById(req.params.discussionId);

        if (!discussion) return res.status(404).json({ message: "Discussion not found" });
        if (!discussion.poll) return res.status(400).json({ message: "This discussion has no poll" });

        const userId = req.user._id;

        // Check if user already voted in ANY option
        const existingOptionIndex = discussion.poll.options.findIndex(opt =>
            opt.votes.some(id => id.toString() === userId.toString())
        );

        if (existingOptionIndex !== -1) {
            // Remove previous vote
            discussion.poll.options[existingOptionIndex].votes =
                discussion.poll.options[existingOptionIndex].votes.filter(id => id.toString() !== userId.toString());

            // If they clicked the same option, we just unvoted. 
            // If they clicked a different one, we will add the new vote below.
            if (existingOptionIndex === optionIndex) {
                await discussion.save();
                return res.json(discussion.poll);
            }
        }

        // Add new vote
        if (optionIndex >= 0 && optionIndex < discussion.poll.options.length) {
            discussion.poll.options[optionIndex].votes.push(userId);
        }

        await discussion.save();
        res.json(discussion.poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Leave a club
// @route   POST /api/clubs/:id/leave
// @access  Private
router.post("/:id/leave", protect, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: "Club not found" });

        club.members = club.members.filter(
            (id) => id.toString() !== req.user._id.toString()
        );
        await club.save();

        res.json({ message: "Left club successfully", club });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
