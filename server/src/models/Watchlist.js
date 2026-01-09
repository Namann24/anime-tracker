import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema({
  seasonNumber: Number,
  totalEpisodes: Number,
  watchedEpisodes: [Number],
});

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    mal_id: Number,
    image: String,
    genres: [String],
    score: Number,
    status: {
      type: String,
      enum: ["Watching", "Completed", "On Hold", "Dropped", "Plan to Watch"],
      default: "Plan to Watch",
    },
    seasons: [seasonSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Watchlist", watchlistSchema);
