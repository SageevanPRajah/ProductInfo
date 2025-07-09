import express from "express";
import { registerUser, loginUser, getUserProfile, uploadProfilePicture, updateUser, updateUserRole, getUsers, deleteUser, AddUser } from "../../controllers/userController.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../../middleware/authMiddleware.js";
import { upload } from "../../helper/cloudinarySetUp.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
//AddUser
router.post("/adduser", AddUser);

// Protected Routes
router.get("/",protect,superAdminOnly, getUsers); 
router.patch('/:id/role',protect,superAdminOnly, updateUserRole);
router.get("/profile", protect, getUserProfile);
router.patch("/update", protect, updateUser);
router.delete("/:id",protect,superAdminOnly, deleteUser);

// Upload Profile Picture Route
router.post("/upload-profile", protect, upload.single("profilePicture"), uploadProfilePicture);

export default router;
