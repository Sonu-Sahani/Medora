import mongoose from "mongoose";
import dotenv from "dotenv";
import Specialty from "../models/Specialty.model.js";

dotenv.config({ path: "./.env" });

const specialties = [
  {
    name: "Gynecology",
    slug: "gynecology",
    description: "Women's reproductive health and wellness care.",
    icon: "Flower2",
  },
  {
    name: "Radiology",
    slug: "radiology",
    description: "Diagnostic imaging including X-rays, CT, and MRI scans.",
    icon: "ScanLine",
  },
  {
    name: "Dentistry",
    slug: "dentistry",
    description: "Oral health, dental care, and cosmetic dentistry.",
    icon: "Smile",
  },
  {
    name: "General Medicine",
    slug: "general-medicine",
    description: "Primary care for general health concerns.",
    icon: "Stethoscope",
  },
  {
    name: "ENT",
    slug: "ent",
    description: "Ear, nose, and throat specialist care.",
    icon: "Ear",
  },
  {
    name: "Cardiology",
    slug: "cardiology",
    description: "Heart health, diagnosis and treatment of cardiac conditions.",
    icon: "HeartPulse",
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    description: "Skin, hair, and nail health treatments.",
    icon: "Sparkles",
  },
  {
    name: "Orthopedics",
    slug: "orthopedics",
    description: "Bone, joint, and musculoskeletal care.",
    icon: "Bone",
  },
  {
    name: "Pediatrics",
    slug: "pediatrics",
    description: "Medical care for infants, children, and adolescents.",
    icon: "Baby",
  },
  {
    name: "Psychiatry",
    slug: "psychiatry",
    description: "Mental health diagnosis and treatment.",
    icon: "Brain",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding");

    await Specialty.deleteMany({}); // clear existing
    await Specialty.insertMany(specialties);

    console.log("✅ Specialties seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();