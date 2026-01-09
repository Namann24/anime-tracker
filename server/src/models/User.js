import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },

    theme: { type: String, default: "dark" },
    bio: { type: String, default: "" },
    favorites: [{ type: Number }], // Array of MAL IDs
    profilePic: { type: String, default: "👤" },

    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Watchlist" }],
    personalization: {
      primaryColor: { type: String, default: "#3b82f6" },
      accentColor: { type: String, default: "#6366f1" },
      bannerUrl: { type: String, default: "" },
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
