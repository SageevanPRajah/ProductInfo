import express from "express";
import {
  createTemplate,
  getTemplateWithFields,
  getAllTemplatesWithFields,
  updateTemplate,
  deleteTemplate
} from "../../controllers/templateController.js";
import { protect, superAdminOnly, adminOrSuperAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// POST   /api/v1/templates
router.post("/", createTemplate);

// GET    /api/v1/templates/:id
router.get("/:id", getTemplateWithFields);

// GET    /api/v1/templates
router.get("/", getAllTemplatesWithFields);

// PATCH  /api/v1/templates/:id   ← changed from PUT
router.patch("/:id", updateTemplate);

// DELETE /api/v1/templates/:id
router.delete("/:id", deleteTemplate);

export default router;
