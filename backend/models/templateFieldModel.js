// models/templateFieldModel.js
import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["String", "Number", "Array","Date", "Currency"], default: "String" }
}, { _id: false });

const templateFieldSchema = new mongoose.Schema({
  templateID:    { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  fieldName:     String,
  fieldType:     { type: String, enum: ["String", "Number", "Array", "Table","Date", "Currency"], default: "String" },
  fieldDescription: String,
  fixed:         { type: Boolean, default: false },
  inherited:     { type: Boolean, default: false },
  columns:       [ columnSchema ]        // ← new
}, {
  timestamps: true
});

export const TemplateField = mongoose.model("TemplateField", templateFieldSchema);
