import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // URL to cover image
    isNSFW: { type: Boolean, default: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Club", ClubSchema);
