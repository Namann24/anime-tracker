import mongoose from "mongoose";

const connectDB = async () => {
  const primary = process.env.MONGO_URI;
  const fallback = process.env.MONGO_URI_FALLBACK || "mongodb://127.0.0.1:27017/saga";

  try {
    await mongoose.connect(primary);
    console.log("MongoDB Connected (primary)");
    return;
  } catch (error) {
    console.error("DB Error (primary):", error.message);
  }

  // Fallback to local dev instance to avoid hard crashes during UI work
  try {
    await mongoose.connect(fallback);
    console.log("MongoDB Connected (fallback/local)");
  } catch (err) {
    console.error("DB Error (fallback):", err.message);
    process.exit(1);
  }
};

export default connectDB;
