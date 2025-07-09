import mongoose from "mongoose";

const templateDataSchema = new mongoose.Schema(
  {
    productName: { type: String },
    price: { type: String },
    image: { type: String },
    description: { type: String },
    templateID: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
    data: mongoose.Schema.Types.Mixed,
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },


  },{
    timestamps: true,
  }
);



templateDataSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);


export const TemplateData = mongoose.model("TemplateData", templateDataSchema);
