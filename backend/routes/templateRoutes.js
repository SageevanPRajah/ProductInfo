import express from "express";
import { createTemplate, getTemplateWithFields, getAllTemplatesWithFields, updateTemplate , deleteTemplate } from "../controllers/templateController.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTemplate);
router.get("/:id", protect, getTemplateWithFields);
router.get("/", protect, getAllTemplatesWithFields);
router.put("/:id", protect, updateTemplate);
router.delete("/:id", protect, deleteTemplate);

export default router;
