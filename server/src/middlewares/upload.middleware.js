import multer from "multer";

// Memory storage - file buffer directly use karenge Cloudinary ke saath
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, PDF allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Single image upload
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files
export const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);