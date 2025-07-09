// models/fixedFieldModel.js
import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["String", "Number", "Array","Date", "Currency"], default: "String" }
}, { _id: false });

const fixedFieldSchema = new mongoose.Schema({
  templateID:  { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  name:        String,
  // allow either a primitive or, for tables, an array of row-objects
  value:       { type: mongoose.Schema.Types.Mixed, default: null },
  type:        { type: String, enum: ["String","Number","Array","Table","Date", "Currency"], default: "String" },
  description: String,
  inherited:   { type: Boolean, default: false },
  columns:     [ columnSchema ]
}, {
  timestamps: true
});

export const FixedField = mongoose.model("FixedField", fixedFieldSchema);
