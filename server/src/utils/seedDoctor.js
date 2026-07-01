import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "../models/Doctor.model.js";
import Specialty from "../models/Specialty.model.js";

dotenv.config({ path: "./.env" });

const seedDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Pehle koi bhi specialty le lo (General Medicine prefer karenge)
    const specialty = await Specialty.findOne({ slug: "general-medicine" });
    if (!specialty) {
      console.error("❌ Specialty not found. Seed specialties first.");
      process.exit(1);
    }

    // Pehle se exist karta hai to delete karo
    await Doctor.deleteOne({ email: "doctor@medora.com" });

    const doctor = await Doctor.create({
      name: "Rajesh Kumar",
      email: "doctor@medora.com",
      password: "doctor123",
      phone: "9876543210",
      specialty: specialty._id,
      qualifications: ["MBBS", "MD - General Medicine"],
      experience: 8,
      bio: "Dr. Rajesh Kumar is a highly experienced general physician with over 8 years of practice. He specializes in preventive care, chronic disease management, and general health consultations.",
      consultationFee: 500,
      availability: [
        { day: "Mon", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Tue", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Wed", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
        { day: "Thu", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"] },
        { day: "Fri", slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"] },
        { day: "Sat", slots: ["10:00", "10:30", "11:00", "11:30"] },
      ],
      ratingsAverage: 4.7,
      ratingsCount: 124,
    });

    console.log("✅ Test doctor created successfully!");
    console.log(`   Name: Dr. ${doctor.name}`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Password: doctor123`);
    console.log(`   Specialty: ${specialty.name}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDoctor();