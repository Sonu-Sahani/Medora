import { ApiError } from "../utils/ApiError.js";

// Usage: restrictTo('admin', 'doctor')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};

export { restrictTo };