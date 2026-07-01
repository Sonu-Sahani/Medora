import { body } from "express-validator";

const registerPatientValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const createDoctorValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("specialty").notEmpty().withMessage("Specialty is required"),
  body("consultationFee")
    .isNumeric()
    .withMessage("Consultation fee must be a number"),
];

export { registerPatientValidator, loginValidator, createDoctorValidator };