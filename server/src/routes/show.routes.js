import express from "express";
import Anime from "../models/Anime.js";

const router = express.Router();

// get all anime
router.get("/", async (req, res) => {
  const list = await Anime.find();
  res.json(list);
});

// add anime
router.post("/", async (req, res) => {
  const anime = await Anime.create(req.body);
  res.json(anime);
});

// update progress
router.put("/:id", async (req, res) => {
  const updated = await Anime.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// delete
router.delete("/:id", async (req, res) => {
  await Anime.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
