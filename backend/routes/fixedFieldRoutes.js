// routes/fixedFieldRoutes.js
import express from "express";
import { addFixedField, getFixedFields, updateFixedField, deleteFixedField } from "../controllers/fixedFieldController.js";
import { protect,superAdminOnly, adminOrSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addFixedField);
router.get("/:templateID", protect, getFixedFields);
router.put("/:id", protect, updateFixedField);
router.delete("/:id", protect, deleteFixedField);

export default router;
