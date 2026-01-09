import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    title: String,
    type: { type: String, enum: ["Anime", "TV"] },
    totalEpisodes: Number,
    genres: [String],
    releaseYear: Number,
    streamingLinks: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Show", showSchema);
