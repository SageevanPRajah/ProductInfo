import express from "express";
import { createTemplateField, updateTemplateField, deleteTemplateField } from "../../controllers/templateFieldController.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTemplateField);
router.patch("/:id", protect, updateTemplateField);
router.delete("/:id", protect, deleteTemplateField);

export default router;

