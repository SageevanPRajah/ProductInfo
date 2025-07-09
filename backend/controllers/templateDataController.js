import { Template } from "../models/templateModel.js";
import { TemplateField } from "../models/templateFieldModel.js";
import { TemplateData } from "../models/templateDataModel.js";
import { FixedField } from "../models/fixedFieldModel.js";
import { productImageUpload } from "../helper/productCloudinarySetUp.js";

// Add data for a template (respecting fixed fields)
export const addTemplateData = async (req, res) => {
  try {
    const { templateID } = req.body;
    let data = req.body.data;

    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    const template = await Template.findById(templateID);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const fixedFields = await FixedField.find({ templateID });

    // Check for existing fixed field values in the database
    const existingEntries = await TemplateData.find({ templateID });

    if (existingEntries.length > 0) {
      for (const field of fixedFields) {
        const fieldName = field.name;
        const existingValue = existingEntries[0]?.data?.[fieldName];
        const newValue = data[fieldName];

        // Reject if the incoming fixed field value is different from existing ones
        if (
          newValue !== undefined &&
          existingValue !== undefined &&
          newValue !== existingValue
        ) {
          return res.status(400).json({
            message: `Field "${fieldName}" is fixed and must be "${existingValue}", but received "${newValue}".`,
          });
        }
      }
    }

    // Handle image upload
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({ message: "Only .jpg, .jpeg, and .png files are allowed." });
      }

      const uploadResult = await productImageUpload(req.file.buffer);
      data.image = uploadResult.secure_url;
    }

    const newEntry = new TemplateData({
      templateID,
      data,
      productName: data.productName || '',
      price:       data.price       || 0,
      description: data.description || '',
      image:       data.image       || ''
    });

    await newEntry.save();
    res.status(201).json({ message: 'Data added successfully', entry: newEntry });

  } catch (err) {
    console.error('AddTemplateData error:', err);
    res.status(500).json({
      message: 'Error adding data',
      error: err.message,
      stack: err.stack
    });
  }
};

// Update an existing TemplateData entry.
// This update controller prevents changes to any fixed field data.
export const updateTemplateData = async (req, res) => {
  try {
    const { id } = req.params;

    // Initialize variables
    let data = {};
    let productName, price, description, image;

    // Check if this is a FormData request
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      productName = req.body.productName;
      price       = req.body.price;
      description = req.body.description;

      try {
        if (req.body.data) {
          data = JSON.parse(req.body.data);
        }
      } catch (err) {
        console.error("Error parsing data:", err);
      }
    } else {
      // Regular JSON request
      productName = req.body.productName;
      price       = req.body.price;
      description = req.body.description;
      data = req.body.data || {};
    }

    const existingData = await TemplateData.findById(id);
    if (!existingData) {
      return res.status(404).json({ message: "Template data not found" });
    }

    // Check fixed fields
    const fixedFields = await FixedField.find({
      templateID: existingData.templateID,
    });
    for (const fixedField of fixedFields) {
      const fieldName = fixedField.name;
      if (
        data[fieldName] !== undefined &&
        existingData.data?.[fieldName] !== undefined &&
        data[fieldName] !== existingData.data[fieldName]
      ) {
        return res.status(400).json({
          message: `Field "${fieldName}" is fixed and cannot be changed.`,
        });
      }
    }

    // Handle image upload if file exists
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({ message: "Only .jpg, .jpeg, and .png files are allowed." });
      }

      const uploadResult = await productImageUpload(req.file.buffer);
      image = uploadResult.secure_url;
    }

    // Merge existing data with new data
    const mergedData = {
      ...existingData.data,
      ...data,
      productName:
        productName !== undefined ? productName : existingData.data.productName,
      price: price !== undefined ? price : existingData.data.price,
      description:
        description !== undefined ? description : existingData.data.description,
    };

    // Update the document
    const updatedData = await TemplateData.findByIdAndUpdate(
      id,
      {
        productName:
          productName !== undefined ? productName : existingData.productName,
        price: price !== undefined ? parseFloat(price) : existingData.price,
        description:
          description !== undefined ? description : existingData.description,
        image: image || existingData.image,
        data: mergedData,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Template data updated successfully",
      entry: updatedData,
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      message: "Error updating template data",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Delete a TemplateData entry by its ID.
export const deleteTemplateData = async (req, res) => {
  try {
    const { id } = req.params; // the TemplateData record id
    const soft = await TemplateData.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!soft)
      return res.status(404).json({ message: "Template data not found" });

    res.status(200).json({ message: "Template data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting template data", error: err.message });
  }
};

export const getTemplateData = async (req, res) => {
  try {
    const { templateID } = req.params;
    const data = await TemplateData.find({
      templateID,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });
    //const data = await TemplateData.find({ templateID, isDeleted: false });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err.message });
  }
};

// Get all TemplateData records for all templates
export const getAllTemplateData = async (req, res) => {
  try {
    const allData = await TemplateData.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });
    //const allData = await TemplateData.find({ isDeleted: false });
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all template data", error: err.message });
  }
};

// Get all Backup TemplateData records for all templates
export const getBackTemplateData = async (req, res) => {
  try {
    const allData = await TemplateData.find({ isDeleted: true });
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all deleted template data", error: err.message });
  }
};

export const getTemplateDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await TemplateData.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "TemplateData entry not found" });
    }

    res.status(200).json(entry);
  } catch (err) {
    console.error("Error fetching TemplateData by ID:", err);
    res.status(500).json({ message: "Error fetching template data", error: err.message });
  }
};

export const restoreTemplateData = async (req, res) => {
  const { id } = req.params;
  const restored = await TemplateData.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null },
    { new: true }
  );
  if (!restored) return res.status(404).json({ message: "Not found" });
  res.status(200).json({ message: "Template data restored", data: restored });
};

