import express from 'express';
import { addTemplateData, getTemplateData, updateTemplateData, deleteTemplateData, getAllTemplateData, getTemplateDataById } from "../../controllers/templateDataController.js";
import { upload } from "../../helper/fileUploadMiddleware.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// create and update
router.post('/', protect, upload.single('image'), addTemplateData);
router.patch("/:id", protect, upload.single("image"), updateTemplateData);
router.delete("/:id", protect, deleteTemplateData);

router.get("/all", protect, getAllTemplateData);      
router.get("/entry/:id", protect, getTemplateDataById);     

router.get("/:templateID", protect, getTemplateData);

export default router;
