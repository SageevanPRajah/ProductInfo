import mongoose from "mongoose";

const templateFieldValueSchema = new mongoose.Schema({
  fieldID: { type: mongoose.Schema.Types.ObjectId, ref: "TemplateField" },
  fieldValue: String,
  groupID: String,
}, {
  timestamps: true
});

export const TemplateFieldValue = mongoose.model("TemplateFieldValue", templateFieldValueSchema);

