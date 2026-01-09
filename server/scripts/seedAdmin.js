import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const email = "admin@anitrack.com";
        const password = "adminpassword";
        const username = "Admin";

        // Check if admin exists
        let user = await User.findOne({ email });

        if (user) {
            console.log("Admin user already exists. Updating role...");
            user.role = "admin";
            await user.save();
        } else {
            console.log("Creating new admin user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                username,
                email,
                password: hashedPassword,
                role: "admin",
                bio: "System Administrator",
                profilePic: "🛡️"
            });
        }

        console.log("-----------------------------------");
        console.log("✅ Admin Access Configured");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log("-----------------------------------");

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
