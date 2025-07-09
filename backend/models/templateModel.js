// templateModel.js
import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parentTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "Template", default: null },
  childTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
  fields: [
    {
      fieldName: String,
      // Extend enum to include Array and Table as valid types.
      selectType: { type: String, enum: ["String", "Number", "Array", "Table","Date", "Currency"] },
      description: String,
      fixed: Boolean
    }
  ],
  lifecycleStatus:  { type: String, default: 'InDesign' },
  lastUpdate:       { type: Date,   default: Date.now }
}, {
  timestamps: true
});

templateSchema.virtual('@type').get(() => 'ProductSpecification');
templateSchema.set('toJSON', { virtuals: true });

export const Template = mongoose.model("Template", templateSchema);
