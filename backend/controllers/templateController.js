// controllers/templateController.js
import { Template } from "../models/templateModel.js";
import { TemplateField } from "../models/templateFieldModel.js";
import { FixedField } from "../models/fixedFieldModel.js"; // Import FixedField model
import { TemplateData } from "../models/templateDataModel.js"; 

// Create a new template
export const createTemplate = async (req, res) => {
  try {
    const { name, parentTemplate, fields } = req.body;

    if (await Template.findOne({ name })) {
      return res.status(400).json({ message: "Template name must be unique" });
    }

    // 2) Load and inherit from parent if any
    let inheritedDynamic = [], inheritedFixed = [], parent = null;
    if (parentTemplate) {
      parent = await Template.findById(parentTemplate);
      if (!parent) return res.status(404).json({ message: "Parent template not found" });

      inheritedDynamic = await TemplateField.find({ templateID: parent._id });
      inheritedFixed   = await FixedField.find({ templateID: parent._id });
    }

    // 3) Create the Template record
    const newTemplate = await Template.create({
      name,
      parentTemplate: parent ? parent._id : null,
      childTemplates: []
    });

    // 4) Link as child
    if (parent) {
      parent.childTemplates.push(newTemplate._id);
      await parent.save();
    }

    // 5) Build field docs
    const dynamicFields = [];
    const fixedFields   = [];

    //  └─ inherited dynamic
    inheritedDynamic.forEach(f => {
      dynamicFields.push({
        templateID:       newTemplate._id,
        fieldName:        f.fieldName,
        fieldType:        f.fieldType,
        fieldDescription: f.fieldDescription,
        fixed:            f.fixed,
        inherited:        true,
        columns:          f.columns    // propagate existing columns
      });
    });

    //  └─ inherited fixed
    inheritedFixed.forEach(f => {
      fixedFields.push({
        templateID: newTemplate._id,
        name:       f.name,
        type:       f.type,
        description:f.description,
        value:      f.value,
        inherited:  true,
        // ← add columns if they existed
        ...(Array.isArray(f.columns) && { columns: f.columns })
      });
    });

    //  └─ fresh fields from request
    fields.forEach(f => {
      if (f.fixed) {
        fixedFields.push({
          templateID:  newTemplate._id,
          name:        f.fieldName,
          type:        f.selectType,
          description: f.description,
          value:       f.value ?? null, 
          ...(f.selectType === "Table" && { columns: f.columns })
        });
      } else {
        dynamicFields.push({
          templateID:       newTemplate._id,
          fieldName:        f.fieldName,
          fieldType:        f.selectType,
          fieldDescription: f.description,
          fixed:            false,
          // only include columns if this is a Table
          ...(f.selectType === "Table" && { columns: f.columns })
        });
      }
    });

    // 6) Persist
    if (dynamicFields.length) await TemplateField.insertMany(dynamicFields);
    if (fixedFields.length)   await FixedField.insertMany(fixedFields);

    // 7) Respond
    res.status(201).json({
      message:    "Template created successfully",
      templateId: newTemplate._id
    });
  }
  catch (error) {
    console.error("Template creation failed:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get template with fields
export const getTemplateWithFields = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    // Fetch dynamic fields (from TemplateField)
    const dynamicFields = await TemplateField.find({ templateID: template._id });
    // Fetch fixed fields (from FixedField)
    const fixedFields = await FixedField.find({ templateID: template._id });

    // Map dynamic fields to a consistent format, preserving the 'inherited' flag if it exists.
    const mappedDynamicFields = dynamicFields.map(field => ({
      name: field.fieldName,
      type: field.fieldType,
      description: field.fieldDescription,
      fixed: field.fixed || false,
      inherited: field.inherited || false,  // include inherited flag
      columns:     field.columns    || [],
      _id: field._id
    }));

    // Map fixed fields to the same format, preserving the 'inherited' flag.
    const mappedFixedFields = fixedFields.map(field => ({
      name:        field.name,
      type:        field.type,
      description: field.description,
      fixed:       true,
      inherited:   field.inherited || false,
      value:       field.value,
      columns:     field.columns || [],
      _id:         field._id
    }));

    // Combine the two arrays
    const combinedFields = [...mappedDynamicFields, ...mappedFixedFields];

    res.json({ template, fields: combinedFields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all templates with their fields
export const getAllTemplatesWithFields = async (req, res) => {
  try {
    // Fetch all templates
    const templates = await Template.find();
    
    // Get all TemplateField documents for these templates
    const templateIds = templates.map((t) => t._id);
    const fields = await TemplateField.find({ templateID: { $in: templateIds } });
    
    // Group fields by their templateID
    const groupedFields = fields.reduce((acc, field) => {
      const key = field.templateID.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(field);
      return acc;
    }, {});
    
    // Attach corresponding fields to each template
    const templatesWithFields = templates.map((t) => ({
      template: t,
      fields: groupedFields[t._id.toString()] || [],
    }));
    
    res.json(templatesWithFields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update template name
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await Template.findOne({ name });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "Template name must be unique" });
    }

    const template = await Template.findByIdAndUpdate(id, { name }, { new: true });
    if (!template) return res.status(404).json({ message: "Template not found" });

    res.json({ message: "Template updated", template });
  } catch (err) {
    res.status(500).json({ message: "Error updating template", error: err.message });
  }
};


// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    // Check for existing data for this template
    const dataCount = await TemplateData.countDocuments({ templateID: template._id });
    if (dataCount > 0) {
      return res.status(400).json({ message: "Cannot delete template with data" });
    }

    // Prevent deletion if the template has child templates
    if (template.childTemplates.length > 0) {
      return res.status(400).json({ message: "Delete child templates first" });
    }

    // If this template is a child, remove its ID from the parent's childTemplates array
    if (template.parentTemplate) {
      await Template.findByIdAndUpdate(template.parentTemplate, {
        $pull: { childTemplates: template._id },
      });
    }

    // Delete all associated template fields
    await TemplateField.deleteMany({ templateID: template._id });
    // Delete the template itself
    await Template.findByIdAndDelete(template._id);

    res.json({ message: "Template deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const propagateFieldToChildren = async (templateId, field) => {
    const children = await Template.find({ parentTemplate: templateId });
    for (let child of children) {
      await TemplateField.create({
        templateID: child._id,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        fieldDescription: field.fieldDescription,
        fixed: field.fixed,
      });
      await propagateFieldToChildren(child._id, field); // recursive
    }
  };
  