import express from "express";
import Watchlist from "../models/Watchlist.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/watchlist
 * @desc    Get all watchlist entries for the current user
 */
router.get("/", protect, async (req, res) => {
  try {
    const data = await Watchlist.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve archive" });
  }
});

/**
 * @route   GET /api/watchlist/:id
 * @desc    Get a single watchlist entry by ID
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const anime = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!anime) return res.status(404).json({ message: "Saga not found in archives" });
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Failed to access saga records" });
  }
});

/**
 * @route   GET /api/watchlist/check/:malId
 * @desc    Check if an anime exists in the user's watchlist by MAL ID
 */
router.get("/check/:malId", protect, async (req, res) => {
  try {
    const exists = await Watchlist.findOne({
      user: req.user.id,
      mal_id: Number(req.params.malId)
    });
    res.json(exists);
  } catch (error) {
    res.status(500).json({ message: "Neural link parity error" });
  }
});

/**
 * @route   POST /api/watchlist
 * @desc    Add a new anime to the watchlist
 */
router.post("/", protect, async (req, res) => {
  try {
    const { title, image, totalSeasons, episodesPerSeason, genres, score, mal_id } = req.body;

    // Check for existing chronicle
    const exists = await Watchlist.findOne({ user: req.user.id, mal_id });
    if (exists) {
      return res.status(400).json({ message: "Saga already exists in your chronicles" });
    }

    // Initialize seasons
    const seasons = [];
    const sCount = Number(totalSeasons) || 1;
    const eCount = Number(episodesPerSeason) || 12;

    for (let i = 1; i <= sCount; i++) {
      seasons.push({
        seasonNumber: i,
        totalEpisodes: eCount,
        watchedEpisodes: [],
      });
    }

    const anime = await Watchlist.create({
      user: req.user.id,
      title,
      image,
      mal_id,
      genres,
      score: score || 0,
      seasons,
      status: "Watching",
    });

    res.status(201).json(anime);
  } catch (error) {
    console.error("ADD ERROR:", error);
    res.status(500).json({ message: "Failed to scribe new saga" });
  }
});

/**
 * @route   PUT /api/watchlist/:id
 * @desc    Update saga status and/or score
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { status, score } = req.body;
    const anime = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });

    if (!anime) return res.status(404).json({ message: "Saga not found" });

    if (status) {
      anime.status = status;
      // Tactical Auto-Fill: If completed, mark all episodes as watched
      if (status === "Completed") {
        anime.seasons.forEach(s => {
          const allEps = Array.from({ length: s.totalEpisodes }, (_, i) => i + 1);
          s.watchedEpisodes = allEps;
        });
      }
    }

    if (score !== undefined) {
      anime.score = score;
    }

    await anime.save();
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Failed to update record" });
  }
});

/**
 * @route   PUT /api/watchlist/:id/details
 * @desc    Reconfigure total seasons and episodes
 */
router.put("/:id/details", protect, async (req, res) => {
  try {
    const { totalSeasons, episodesPerSeason } = req.body;
    const anime = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!anime) return res.status(404).json({ message: "Saga not found" });

    const sLimit = Number(totalSeasons);
    const eLimit = Number(episodesPerSeason);

    // Adjust seasons dimensionality
    if (sLimit > anime.seasons.length) {
      for (let i = anime.seasons.length + 1; i <= sLimit; i++) {
        anime.seasons.push({
          seasonNumber: i,
          totalEpisodes: eLimit,
          watchedEpisodes: []
        });
      }
    } else if (sLimit < anime.seasons.length) {
      anime.seasons = anime.seasons.slice(0, sLimit);
    }

    // Update episode counts and prune watching overflow
    anime.seasons.forEach(s => {
      s.totalEpisodes = eLimit;
      s.watchedEpisodes = s.watchedEpisodes.filter(ep => ep <= eLimit);
    });

    await anime.save();
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Failed to reconfigure saga" });
  }
});

/**
 * @route   PUT /api/watchlist/:id/episode
 * @desc    Toggle watched status of a specific chapter (episode)
 */
router.put("/:id/episode", protect, async (req, res) => {
  try {
    const { season, episode } = req.body;
    const epNum = Number(episode);
    const seaNum = Number(season);

    const anime = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!anime) return res.status(404).json({ message: "Saga not found" });

    const s = anime.seasons.find((x) => x.seasonNumber === seaNum);
    if (!s) return res.status(404).json({ message: "Season not found" });

    const index = s.watchedEpisodes.indexOf(epNum);
    if (index === -1) {
      if (epNum <= s.totalEpisodes) s.watchedEpisodes.push(epNum);
    } else {
      s.watchedEpisodes.splice(index, 1);
    }

    // NEURAL STATUS AUTO-SYNC
    let anyStarted = false;
    let allFinished = true;

    for (const sea of anime.seasons) {
      if (sea.watchedEpisodes.length > 0) anyStarted = true;
      if (sea.watchedEpisodes.length < sea.totalEpisodes) allFinished = false;
    }

    if (allFinished) {
      anime.status = "Completed";
    } else if (anyStarted && (anime.status === "Plan to Watch" || anime.status === "Completed")) {
      anime.status = "Watching";
    }

    await anime.save();
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle chapter" });
  }
});

/**
 * @route   PUT /api/watchlist/:id/reset
 * @desc    Purge all progress for a saga
 */
router.put("/:id/reset", protect, async (req, res) => {
  try {
    const anime = await Watchlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!anime) return res.status(404).json({ message: "Saga not found" });

    anime.seasons.forEach(s => {
      s.watchedEpisodes = [];
    });

    if (anime.status === "Completed") {
      anime.status = "Watching";
    }

    await anime.save();
    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: "Failed to purge progress" });
  }
});

/**
 * @route   DELETE /api/watchlist/:id
 * @desc    Permanently delete a chronicle
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Watchlist.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Saga records unreachable" });
    res.json({ success: true, message: "Saga purged from archives" });
  } catch (error) {
    res.status(500).json({ message: "Purge failed" });
  }
});

export default router;