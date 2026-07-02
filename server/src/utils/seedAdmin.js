import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.model.js";

dotenv.config({ path: "./.env" });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Admin.deleteOne({ email: "admin@medora.com" });

    const admin = await Admin.create({
      name: "Medora Admin",
      email: "admin@medora.com",
      password: "admin123",
    });

    console.log("✅ Admin created successfully!");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();