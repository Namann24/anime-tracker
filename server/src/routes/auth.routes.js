import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Watchlist from "../models/Watchlist.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get public profile
// @route   GET /api/auth/profile/:username
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch watchlist directly from DB to ensure stats are always up to date
    const watchlist = await Watchlist.find({ user: user._id });

    // Combine for frontend
    const profileWithWatchlist = {
      ...user._doc,
      watchlist: watchlist
    };

    res.json(profileWithWatchlist);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { bio, favorites, profilePic } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = bio ?? user.bio;
      user.favorites = favorites ?? user.favorites;
      user.profilePic = profilePic ?? user.profilePic;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        favorites: updatedUser.favorites,
        profilePic: updatedUser.profilePic,
        personalization: updatedUser.personalization
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update user personalization
// @route   PUT /api/auth/personalization
// @access  Private
router.put("/personalization", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.personalization = {
        ...user.personalization,
        ...req.body
      };

      const updatedUser = await user.save();
      res.json(updatedUser.personalization);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get top warriors for leaderboard
// @route   GET /api/auth/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({}).select("username profilePic bio personalization");

    // Fetch all watchlists to compute power levels
    const watchlists = await Watchlist.find({});

    const leaderboard = users.map(user => {
      const userWatchlist = watchlists.filter(w => w.user && w.user.toString() === user._id.toString());
      const finishedEps = userWatchlist.reduce((acc, item) =>
        acc + (item.seasons?.reduce((sAcc, s) => sAcc + s.watchedEpisodes.length, 0) || 0), 0
      );

      return {
        _id: user._id,
        username: user.username,
        profilePic: user.profilePic,
        personalization: user.personalization,
        spiritPower: finishedEps * 10, // 10 power per episode
        episodesWatched: finishedEps,
        titlesMastered: userWatchlist.filter(w => w.status === "Completed").length
      };
    }).sort((a, b) => b.spiritPower - a.spiritPower).slice(0, 20);

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Neural ranking failed" });
  }
});

export default router;
