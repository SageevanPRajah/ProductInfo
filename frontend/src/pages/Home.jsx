import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from '../components/Dashboard';
import ArrayField from "../components/ArrayField";
import TemplateTable from "../components/TemplateTable";
import TemplateViewTable from "../components/TemplateViewTable";
import { AiOutlineSearch, AiOutlineClose, AiOutlineExclamationCircle } from 'react-icons/ai';
import { BsPlus } from 'react-icons/bs';
import { useAuth } from "../hooks/useAuth";
import { logActivity } from "../utils/logActivity"; 
import { TemplateEndPoint } from "../utils/ApiRequest";

const Home = () => {
  const { user: me, token, isAuthenticated } = useAuth();
  // States for templates and modals
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState(true);
  const [parentTemplate, setParentTemplate] = useState(null);
  // New state to hold the parent's combined fields (fixed + dynamic)
  const [parentCombinedFields, setParentCombinedFields] = useState([]);
  const [addedFields, setAddedFields] = useState([]);
  
  // Modal states for selecting parent and adding fields
  const [showParentModal, setShowParentModal] = useState(false);
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Field form states (for new fields)
  // New fields use the unified keys: name, type, description, fixed
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [description, setDescription] = useState('');
  const [hasFixedValue, setHasFixedValue] = useState(false);
  const [fieldDefaultValue, setFieldDefaultValue] = useState("");
  const [defaultRow, setDefaultRow] = useState({});
  const [tableColumns, setTableColumns] = useState([]);
  const [arrayDefaultValues, setArrayDefaultValues] = useState([]);


  // New states for delete confirmation modal for templates
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // New states for search and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('All');


  // Choose the correct TemplateTableUse wrapper
  const TemplateTableUse = (() => {
    switch (me?.role) {
      case "Admin":
        return TemplateTable;
      case "SuperAdmin":
        return TemplateTable;
      default:
        return TemplateViewTable;
    }
  })();

  // Fetch all templates when component mounts
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get(TemplateEndPoint);
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, [isAuthenticated]);

  // When parentTemplate changes, fetch its combined fields
  useEffect(() => {
    if (parentTemplate) {
      axios.get(`${TemplateEndPoint}/${parentTemplate.template._id}`)
        .then(({ data }) => {
          setParentCombinedFields(data.fields || []);
        })
        .catch(err => console.error("Error fetching parent's combined fields:", err));
    } else {
      setParentCombinedFields([]);
    }
  }, [parentTemplate,isAuthenticated]);

  // Function to update a specific table column's value.
  const handleColumnChange = (index, key, value) => {
    const updatedColumns = [...tableColumns];
    updatedColumns[index] = {
      ...updatedColumns[index],
      [key]: value,
    };
    setTableColumns(updatedColumns);
  };

  // Function to add a new column to the table configuration.
  const addNewColumn = () => {
    setTableColumns([...tableColumns, { name: "", type: "String" }]);
  };

  // Check template name availability
  const handleTemplateNameChange = (e) => {
    const name = e.target.value;
    setTemplateName(name);
    const exists = templates.some(
      (temp) => temp.template.name.toLowerCase() === name.toLowerCase()
    );
    setIsNameAvailable(!exists);
  };

  // Add a new field with unified keys
  const handleAddField = () => {
    if (!fieldName || !fieldType) return;
  
    const newField = {
      fieldName,
      selectType: fieldType,
      description,
      fixed: hasFixedValue,
      ...(hasFixedValue && fieldType !== "Table" && fieldType !== "Array" && { value: fieldDefaultValue }),
      ...(hasFixedValue && fieldType === "Array" &&   { value: arrayDefaultValues }),
      ...(hasFixedValue && fieldType === "Table" && { value: [defaultRow] }),
      ...(fieldType === "Table" && { columns: tableColumns }),
    };
  
    setAddedFields([...addedFields, newField]);
  
    // reset inputs
    setFieldName("");
    setFieldType("");
    setDescription("");
    setHasFixedValue(false);
    setFieldDefaultValue("");
    setTableColumns([]);
    setDefaultRow({});
  
    // **close** the modal!
    setShowNewFieldModal(false);
  };
    
  

  // Save new template (calls backend POST /templates)
  const handleSaveTemplate = async () => {
    const payload = {
      name: templateName,
      parentTemplate: parentTemplate ? parentTemplate.template._id : null,
      fields: addedFields,
    };

    try {
      // 1) Create template
      await axios.post(TemplateEndPoint, payload);
      logActivity(
        "Template Added",
        `Created template "${templateName}"`
      );

      setShowModal(false);
      setTemplateName('');
      setAddedFields([]);
      setParentTemplate(null);
      setParentCombinedFields([]);

      const { data: updatedTemplates } = await axios.get(TemplateEndPoint);
      setTemplates(updatedTemplates);
      } catch (error) {
        console.error("Error saving template:", error);
      }
    };

  // Delete template handler with confirmation modal and error handling
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await axios.delete(`${TemplateEndPoint}/${templateToDelete._id}`);

      setTemplates(prev => 
        prev.filter(t => t.template._id !== templateToDelete._id)
      );

      logActivity(
        "Template Deleted",
        `Deleted template "${templateToDelete.name}"`
      );

      setTemplateToDelete(null);
      setDeleteError('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setDeleteError(msg);
      console.error('Error deleting template:', msg);
    }
  };

  // Filter templates based on search and sort criteria
  const filteredTemplates = templates.filter(item => {
    // Search filter
    if (searchTerm && !item.template.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Sort filter
    if (sortCriteria === "All") {
      return true;
    } else if (sortCriteria === "Parent Only") {
      return item.template.parentTemplate === null &&
             item.template.childTemplates &&
             item.template.childTemplates.length > 0;
    } else if (sortCriteria === "Child Only") {
      return item.template.parentTemplate !== null &&
             (!item.template.childTemplates || item.template.childTemplates.length === 0);
    } else if (sortCriteria === "Parent & Child") {
      return item.template.parentTemplate !== null &&
             item.template.childTemplates &&
             item.template.childTemplates.length > 0;
    }
    return true;
  });

  return (
    <Dashboard>
      {/* Main Content */}
      <div className="bg-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Bar and Sort Dropdown */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Template Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className="border rounded px-4 py-2"
              >
                <option value="All">All Templates</option>
                <option value="Parent Only">Parent Only</option>
                <option value="Child Only">Child Only</option>
                <option value="Parent & Child">Parent & Child</option>
              </select>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              className="bg-blue-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
              onClick={() => setShowModal(true)}
            >
              <BsPlus className="w-5 h-5" />
              <span className="whitespace-nowrap">Add new Template</span>
            </button>
          </div>
        </div>
        {/* Template Table */}
        <TemplateTableUse  
          templates={filteredTemplates.map(item => item.template)}
          allTemplates={templates}  // Pass the full array from your fetch
          onDelete={(template) => setTemplateToDelete(template)}
        />

      </div>

      {/* Add New Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>
            <div className="p-6 pt-12">
              <h2 className="text-lg font-semibold mb-3">Add New Template</h2>
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <p className="text-sm font-medium mb-1">New Template Name:</p>
                  <input
                    type="text"
                    value={templateName}
                    onChange={handleTemplateNameChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {templateName && (isNameAvailable ? (
                    <p className="text-xs text-green-500 italic mt-1 text-right">
                      *Template name available
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 italic mt-1 text-right">
                      *Template name already exists
                    </p>
                  ))}
                </div>
                {/* Parent Template */}
                <div>
                  <p className="text-sm font-medium mb-1">Parent Template:</p>
                  <input
                    type="text"
                    value={parentTemplate ? parentTemplate.template.name : ''}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="border border-blue-500 text-blue-500 bg-white px-4 py-2 rounded hover:bg-blue-50 transition-colors"
                      onClick={() => setShowParentModal(true)}
                    >
                      Select Parent
                    </button>
                    <button
                      className="border border-blue-500 text-blue-500 bg-white px-4 py-2 rounded hover:bg-blue-50 transition-colors"
                      onClick={() => setShowNewFieldModal(true)}
                    >
                      New Fields
                    </button>
                  </div>
                </div>
                                {/* Preview: Display Parent's Combined Fields and New Fields */}
                                {(parentCombinedFields.length > 0 || addedFields.length > 0) && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Template Fields</h3>
                    <table className="min-w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left font-semibold">Field Name</th>
                          <th className="p-2 text-left font-semibold">Field Type</th>
                          <th className="p-2 text-left font-semibold">Description</th>
                          <th className="p-2 text-left font-semibold">Fixed?</th>
                          <th className="p-2 text-left font-semibold">Columns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parentCombinedFields.map((field, idx) => (
                          <tr key={`parent-${idx}`} className="border-t">
                            <td className="p-2">{field.name}</td>
                            <td className="p-2">{field.type}</td>
                            <td className="p-2">{field.description}</td>
                            <td className="p-2">{field.fixed ? "Yes" : "No"}</td>
                            <td className="p-2">
                            {field.selectType === "Table" && field.columns?.length > 0
                               ? field.columns.map(c => `${c.name} (${c.type})`).join(", ")
                               : "-"}
                            </td>
                          </tr>
                        ))}
                        {addedFields.map((field, idx) => (
                          <tr key={`added-${idx}`} className="border-t">
                            <td className="p-2">{field.fieldName}</td>
                            <td className="p-2">{field.selectType}</td>
                            <td className="p-2">{field.description}</td>
                            <td className="p-2">{field.fixed ? "Yes" : "No"}</td>
                            <td className="p-2">
                              {field.selectType === "Table" && field.columns?.length
                                ? field.columns.map((col, ci) => (
                                    <div key={ci} className="text-xs">
                                      {col.name} ({col.type})
                                    </div>
                                  ))
                                : null}
                           </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
              <div className="mt-6 pt-4 flex justify-center">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={handleSaveTemplate}
                  disabled={!templateName || !isNameAvailable}
                >
                  Save data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent Template Selection Modal */}
      {showParentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-96 max-w-[80vh] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Parent Templates</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Select Parent Template</label>
                <select
                  value={parentTemplate ? parentTemplate.template.name : ''}
                  className="border rounded p-2"
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setParentTemplate(null);
                      return;
                    }
                    const selected = templates.find(
                      (temp) => temp.template.name === e.target.value
                    );
                    setParentTemplate(selected ? selected : null);
                  }}
                >
                  <option value="">Choose a template</option>
                  {templates.map((item) => (
                    <option key={item.template._id} value={item.template.name}>
                      {item.template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showDetails"
                  className="mr-2"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                />
                <label htmlFor="showDetails">Show Details</label>
              </div>
              {showDetails && parentCombinedFields.length > 0 && (
                <div className="border rounded-lg overflow-hidden min-w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left font-semibold">Field Name</th>
                        <th className="p-2 text-left font-semibold">Field Type</th>
                        <th className="p-2 text-left font-semibold">Description</th>
                        <th className="p-2 text-left font-semibold">Fixed?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentCombinedFields.map((field, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{field.name}</td>
                          <td className="p-2">{field.type}</td>
                          <td className="p-2">{field.description}</td>
                          <td className="p-2">{field.fixed ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setShowParentModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowParentModal(false)}
              >
                Submit Parent
              </button>
            </div>
          </div>
        </div>
      )}

            {/* New Field Modal */}
            {showNewFieldModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">New Template Field</h2>

              {/* 1) Name / Type / Description / Fixed */}
              <div className="grid grid-cols-12 gap-2 items-center mb-4">
                <div className="col-span-4 font-medium text-sm text-gray-700">Field Name</div>
                <div className="col-span-4 font-medium text-sm text-gray-700">Type</div>
                <div className="col-span-3 font-medium text-sm text-gray-700">Description</div>
                <div className="col-span-1 font-medium text-sm text-gray-700">Fixed?</div>

                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="fieldName"
                    value={fieldName}
                    onChange={e => setFieldName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <select
                    value={fieldType}
                    onChange={e => setFieldType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                  >
                    <option value="">Select…</option>
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Array">Array</option>
                    <option value="Table">Table</option>
                    <option value="Date">Date</option>
                    <option value="Currency">Currency</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={hasFixedValue}
                    onChange={e => setHasFixedValue(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring"
                  />
                </div>
              </div>

              {/* 2a) Primitive default */}
              {hasFixedValue && fieldType !== "Table" && fieldType !== "Array" && (
                <div className="mb-4 p-4 border rounded bg-gray-50 relative">
                  <label className="block text-sm font-medium mb-2">Default Value</label>
                  {fieldType === 'Currency' && (
                    <div className="absolute left-5 top-[54px] text-gray-600 text-sm pointer-events-none">
                      Rs.
                    </div>
                  )}
                  <input
                    type={
                      fieldType === "Number"   ? "number" :
                      fieldType === "Date"     ? "date"   :
                      fieldType === "Currency" ? "number" :
                                                "text"
                    }
                    step={fieldType === "Currency" ? "0.01" : undefined}
                    placeholder="Enter default…"
                    value={fieldDefaultValue}
                    onChange={e => setFieldDefaultValue(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldType === 'Currency' ? 'pl-10' : ''
                    }`}
                  />
                </div>
              )}

              {/* 2b) Array default */}
              {hasFixedValue && fieldType === "Array" && (
                <div className="mb-4 p-4 border rounded bg-gray-50">
                  <label className="block text-sm font-medium mb-2">Default Items</label>
                  <ArrayField
                    field={{ name: "Items" }}
                    value={arrayDefaultValues}
                    onChange={setArrayDefaultValues}
                  />
                </div>
              )}


              {/* 3) Table Columns Config */}
              {fieldType === "Table" && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-2">Configure Columns</h4>
                  {tableColumns.map((col, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={e => handleColumnChange(i, "name", e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
                      />
                      <select
                        value={col.type}
                        onChange={e => handleColumnChange(i, "type", e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none"
                      >
                        <option value="String">String</option>
                        <option value="Number">Number</option>
                        <option value="Date">Date</option>
                        <option value="Currency">Currency</option>
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addNewColumn}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    + Add Column
                  </button>
                </div>
              )}

              {/* 4) Table Default‐Row Values */}
              {hasFixedValue && fieldType === "Table" && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-2">Default Row Values</h4>
                  {tableColumns.map((col, i) => {
                    // Determine input type for each column
                    const inputType =
                      col.type === "Number" ? "number" :
                      col.type === "Date" ? "date" :
                      col.type === "Currency" ? "number" :
                      "text";

                    return (
                      <div key={i} className="flex gap-2 mb-2 items-center relative">
                        <label className="w-1/3 text-gray-700">{col.name}</label>

                        {col.type === "Currency" && (
                          <div className="absolute left-14 text-gray-600 text-sm pointer-events-none">
                            Rs.
                          </div>
                        )}

                        <input
                          type={inputType}
                          step={col.type === "Currency" ? "0.01" : undefined}
                          placeholder={`Default for ${col.name}`}
                          value={defaultRow[col.name] || ""}
                          onChange={e =>
                            setDefaultRow(r => ({
                              ...r,
                              [col.name]:
                                col.type === "Number" || col.type === "Currency"
                                  ? +e.target.value
                                  : e.target.value
                            }))
                          }
                          className={`flex-1 p-2 border border-gray-300 rounded focus:outline-none ${
                            col.type === "Currency" ? "pl-10" : ""
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddField}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Templates */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-2">
              Are you sure you want to delete{" "}
              <span className="font-bold">{templateToDelete.name}</span>?
            </p>
            <p className="mb-4 text-sm text-gray-600">This action cannot be undone.</p>
            {deleteError && (
              <div className="flex items-center text-red-600 mb-4">
                <AiOutlineExclamationCircle className="mr-2" size={20} />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setTemplateToDelete(null);
                  setDeleteError('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default Home;
