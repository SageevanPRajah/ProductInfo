// controllers/fixedFieldController.js
import { FixedField } from "../models/fixedFieldModel.js";
import { Template } from "../models/templateModel.js";
import { TemplateData } from "../models/templateDataModel.js";

// Add a fixed field to a template
export const addFixedField = async (req, res) => {
  try {
    const { templateID, name, value, type, description, columns } = req.body;
    const newField = new FixedField({
      templateID, name, value, type, description,
      inherited: false,
      // include columns if present
      ...(Array.isArray(columns) && { columns })
    });
    await newField.save()
    //  clone this fixed field into all existing child templates
    await propagateNewFixedFieldToChildren(templateID, {
      name,
      value,
      type,
      description,
      ...(Array.isArray(columns) && { columns })
    });;
    res.status(201).json({ message: "Fixed field added", field: newField });
  } catch (err) {
    res.status(500).json({ message: "Failed to add fixed field", error: err.message });
  }
};

// Get all fixed fields for a template
export const getFixedFields = async (req, res) => {
  try {
    const { templateID } = req.params;
    const fields = await FixedField.find({ templateID });
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fixed fields", error: err.message });
  }
};

// Update a fixed field and propagate updates to inherited child templates
export const updateFixedField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, type, description, columns } = req.body;

    const fixedField = await FixedField.findById(id);
    if (!fixedField)
      return res.status(404).json({ message: "Fixed field not found" });

    const updatePayload = { name, value, type, description };
    if (Array.isArray(columns)) {
      updatePayload.columns = columns;
    }

    // Update the fixed field metadata (value is not editable on product data once set)
    const updatedField = await FixedField.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    // Propagate updates to all child templates that inherited this fixed field
    await propagateFixedFieldUpdateToChildren(
      fixedField.templateID,
      fixedField.name,
      updatePayload
    );

    // 3. Propagate the new fixed VALUE into all existing TemplateData entries
    await propagateFixedValueToTemplateData(
      fixedField.templateID,
      fixedField.name,
      value
    );

    res.json({ message: "Fixed field updated", field: updatedField });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update fixed field", error: err.message });
  }
};


// Delete a fixed field
export const deleteFixedField = async (req, res) => {
  try {
    const { id } = req.params;
    await FixedField.findByIdAndDelete(id);
    res.status(200).json({ message: "Fixed field deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete fixed field", error: err.message });
  }
};

// Recursive propagation function for fixed field metadata updates
async function propagateFixedFieldUpdateToChildren(templateID, originalFieldName, updatedData) {
  const children = await Template.find({ parentTemplate: templateID });
  for (const child of children) {
    const inheritedField = await FixedField.findOne({
      templateID: child._id,
      name: originalFieldName
    });
    if (inheritedField) {
      await FixedField.findByIdAndUpdate(inheritedField._id, updatedData);
    }
    await propagateFixedFieldUpdateToChildren(child._id, originalFieldName, updatedData);
  }
}

// Recursively create inherited fixed‐field copies in every descendant
async function propagateNewFixedFieldToChildren(templateID, field) {
  const children = await Template.find({ parentTemplate: templateID });
  for (const child of children) {
    await FixedField.create({
      templateID:  child._id,
      name:        field.name,
      value:       field.value,
      type:        field.type,
      description: field.description,
      inherited:   true,
      ...(Array.isArray(field.columns) && { columns: field.columns })
    });
    await propagateNewFixedFieldToChildren(child._id, field);
  }
}

// Walk the same template tree and update every TemplateData.data[fieldName]
async function propagateFixedValueToTemplateData(templateID, fieldName, newValue) {
  // Update entries on THIS template
  await TemplateData.updateMany(
    { templateID },
    { $set: { [`data.${fieldName}`]: newValue } }
  );

  // Recurse into children
  const children = await Template.find({ parentTemplate: templateID });
  for (const child of children) {
    await propagateFixedValueToTemplateData(child._id, fieldName, newValue);
  }
}