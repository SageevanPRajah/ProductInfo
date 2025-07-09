import express from 'express';
import {
  addTemplateData,
  getTemplateData,
  updateTemplateData,
  deleteTemplateData,
  getAllTemplateData,
  getTemplateDataById,
  restoreTemplateData,
  getBackTemplateData,
} from "../controllers/templateDataController.js";
import { upload } from "../helper/fileUploadMiddleware.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// create and update
router.post('/', protect, upload.single('image'), addTemplateData);
router.put("/:id", protect, upload.single("image"), updateTemplateData);
router.delete("/:id", protect, deleteTemplateData);
router.patch("/restore/:id", protect, restoreTemplateData);

router.get("/all", protect, getAllTemplateData);      
router.get("/entry/:id", protect, getTemplateDataById);
router.get("/backup", protect, getBackTemplateData);     

router.get("/:templateID", protect, getTemplateData);

export default router;
