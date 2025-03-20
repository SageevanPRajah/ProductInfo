import express from "express";
import { registerUser, loginUser, getUserProfile, uploadProfilePicture } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../helper/cloudinarySetUp.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", protect, getUserProfile);

// Upload Profile Picture
router.post("/upload-profile", protect, upload.single("profilePicture"), uploadProfilePicture);

export default router;
