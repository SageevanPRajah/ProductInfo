// controllers/templateFieldController.js
import { Template } from "../models/templateModel.js";
import { TemplateField } from "../models/templateFieldModel.js";

// Create a new dynamic (non-fixed) field
export const createTemplateField = async (req, res) => {
  try {
    const { templateID, fieldName, fieldType, fieldDescription, fixed, columns } = req.body;
    const newField = new TemplateField({
      templateID,
      fieldName,
      fieldType,
      fieldDescription,
      fixed,
      inherited: false,
      ...(Array.isArray(columns) && { columns })
    });
    await newField.save();
    
    // clone this field into all existing child templates
    await propagateNewFieldToChildren(templateID, {
      fieldName,
      fieldType,
      fieldDescription,
      fixed,
      ...(Array.isArray(columns) && { columns })
    });
    res.status(201).json(newField);
  } catch (err) {
    res.status(500).json({ message: "Failed to create field", error: err.message });
  }
};


//  Update a field and propagate to child templates
export const updateTemplateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, fieldType, fieldDescription, fixed, columns } = req.body;

    // 1) Load the existing field so we know its templateID and original name
    const existingField = await TemplateField.findById(id);
    if (!existingField) {
      return res.status(404).json({ message: "Field not found" });
    }
    const originalFieldName = existingField.fieldName;
    const parentTemplateID   = existingField.templateID;

    // 2) Build update payload
    const updatePayload = { fieldName, fieldType, fieldDescription, fixed };
    if (Array.isArray(columns)) {
      updatePayload.columns = columns;
    }

    // 3) Update the field itself
    const updatedField = await TemplateField.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    // 4) Propagate that change down the tree using the *template* ID!
    await propagateFieldUpdateToChildren(
      parentTemplateID,
      originalFieldName,
      updatePayload
    );

    return res.json({ message: "Field updated", field: updatedField });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update field", error: err.message });
  }
};



//  Propagate updated field to all children that inherited it
const propagateFieldUpdateToChildren = async (templateID, originalFieldName, updatedData) => {
  const children = await Template.find({ parentTemplate: templateID });

  for (const child of children) {
    const inheritedField = await TemplateField.findOne({
      templateID: child._id,
      fieldName: originalFieldName,
    });

    if (inheritedField) {
      await TemplateField.findByIdAndUpdate(inheritedField._id, updatedData);
    }

    await propagateFieldUpdateToChildren(child._id, originalFieldName, updatedData);
  }
};

// Delete a template field
export const deleteTemplateField = async (req, res) => {
  try {
    const { id } = req.params;
    await TemplateField.findByIdAndDelete(id);
    res.json({ message: "Field deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete field", error: err.message });
  }
};

// Walk the child‐template tree and create an inherited copy in each one
const propagateNewFieldToChildren = async (templateID, field) => {
  const children = await Template.find({ parentTemplate: templateID });
  for (const child of children) {
    await TemplateField.create({
      templateID:        child._id,
      fieldName:         field.fieldName,
      fieldType:         field.fieldType,
      fieldDescription:  field.fieldDescription,
      fixed:             field.fixed,
      inherited:         true,
      ...(Array.isArray(field.columns) && { columns: field.columns })
    });
    await propagateNewFieldToChildren(child._id, field);
  }
};
