import "dotenv/config";

import connectDB from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

// Optional: Log only in development
if (process.env.NODE_ENV === "development") {
  console.log("✅ Environment Variables Loaded");
  console.log({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI_EXISTS: !!process.env.MONGO_URI,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
    RAZORPAY_KEY_ID_EXISTS: !!process.env.RAZORPAY_KEY_ID,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  });
}

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION");
  console.error(err);
  process.exit(1);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed");
    console.error(err);
    process.exit(1);
  });