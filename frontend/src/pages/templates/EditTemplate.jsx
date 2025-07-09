// src/pages/templates/EditTemplate.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineClose,
  AiOutlineEdit,
  AiOutlineDelete
} from 'react-icons/ai';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dashboard from '../../components/Dashboard';
import ArrayField from "../../components/ArrayField";
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from "../../utils/logActivity"; 
import { TemplateEndPoint, TemplateFieldEndPoint, FixedFieldEndPoint } from '../../utils/ApiRequest';

export default function EditTemplate() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // --- template & fields state ---
  const [template, setTemplate] = useState(null);
  const [inheritedFields, setInheritedFields] = useState([]);
  const [ownFields, setOwnFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentTemplateName, setParentTemplateName] = useState('None');
  const [saveLoading, setSaveLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // --- delete-confirm state ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);

  // --- "New Field" modal state ---
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [description, setDescription] = useState('');
  const [hasFixedValue, setHasFixedValue] = useState(false);
  const [fieldDefaultValue, setFieldDefaultValue] = useState('');
  const [defaultRow, setDefaultRow] = useState({});
  const [tableColumns, setTableColumns] = useState([]);
  const [arrayDefaultValues, setArrayDefaultValues] = useState([]);

  // --- "Edit Field" modal state ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFixed, setEditFixed] = useState(false);
  const [editFieldDefaultValue, setEditFieldDefaultValue] = useState('');
  const [editDefaultRow, setEditDefaultRow] = useState({});
  const [editTableCols, setEditTableCols] = useState([]);
  const [editArrayDefaultValues, setEditArrayDefaultValues] = useState([]);

  // fetch template + fields
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchTemplate() {
      try {
        setLoading(true);
        const { data: { template, fields } } = await axios.get(`${TemplateEndPoint}/${id}`);
        setTemplate({ ...template, originalName: template.name });
        setInheritedFields(fields.filter(f => f.inherited));
        setOwnFields(fields.filter(f => !f.inherited));
        if (template.parentTemplate) {
          const { data: { template: parent } } = await axios.get(
            `${TemplateEndPoint}/${template.parentTemplate}`
          );
          setParentTemplateName(parent.name);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [id, isAuthenticated]);

  // Save template + own fields
  const handleSaveChanges = async () => {
    try {
      setSaveLoading(true);
      // 1) update template name if changed
      if (template.name !== template.originalName) {
        await axios.put(`${TemplateEndPoint}/${id}`, { name: template.name });
      //   logActivity(
      //   "Template Updated",
      //   `Updated template name to "${template.name}"`
      // );
      }

      // 2) update or create fields
      for (const f of ownFields) {
        const isNew = f._id.toString().startsWith('new');
        const common = f.fixed
          ? {
              name:        f.name,
              type:        f.type,
              description: f.description,
              value:       f.type === 'Table'
                             ? Array.isArray(f.value)
                                ? f.value
                                : [f.value || {}]
                             : f.value || null,
              ...(f.type === 'Table' && Array.isArray(f.columns) && { columns: f.columns })
            }
          : {
              fieldName:        f.name,
              fieldType:        f.type,
              fieldDescription: f.description,
              fixed:            false,
              ...(f.type === 'Table' && Array.isArray(f.columns) && { columns: f.columns })
            };

        // choose endpoint and method
        const endpoint = isNew
          ? (f.fixed 
            ? FixedFieldEndPoint 
            : TemplateFieldEndPoint)
          : (f.fixed
            ? `${FixedFieldEndPoint}/${f._id}`
            : `${TemplateFieldEndPoint}/${f._id}`);
        if (isNew) {
          await axios.post(endpoint, { templateID: id, ...common });
          // logActivity(
          //   "Template Updated",
          //   `Added field "${f.name}" to template "${template.name}"`
          // );
        } else {
          await axios.put(endpoint, common);
          //   logActivity(
          //   "Template Updated",
          //   `Edited field "${f.name}" in template "${template.name}"`
          // );
        }
      }

      // 3) show success modal
      const tmpl = template?.name || "<unknown>";
      logActivity(
        "Template Updated",
        `Saved changes to template "${tmpl}" (${ownFields.length} field(s) total)`
      );
      setSuccessDialogOpen(true);
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete a single own field
  const handleDeleteField = async f => {
    try {
      if (!f._id.toString().startsWith('new')) {
        const endpoint = f.fixed
          ? `${FixedFieldEndPoint}/${f._id}`
          : `${TemplateFieldEndPoint}/${f._id}`;
        await axios.delete(endpoint);
      }
      setOwnFields(ofs => ofs.filter(x => x._id !== f._id));
      const tmpl = template?.name || "<unknown>";
      logActivity(
        "Template Updated",
        `Deleted field "${f.name}" from template "${tmpl}"`
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // New Field modal helpers
  const addNewColumn = () =>
    setTableColumns(cols => [...cols, { name: '', type: 'String' }]);
  const handleColumnChange = (idx, key, val) =>
    setTableColumns(cols => {
      const copy = [...cols];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  const handleAddField = () => {
    if (!fieldName || !fieldType) return;
    const nf = {
      _id:    'new_' + Date.now(),
      name:   fieldName,
      type:   fieldType,
      description,
      fixed:  hasFixedValue,
       ...(hasFixedValue && fieldType !== 'Table' && fieldType !== 'Array' && { value: fieldDefaultValue }),
      ...(hasFixedValue && fieldType === 'Array' && { value: arrayDefaultValues }),
      ...(hasFixedValue && fieldType === 'Table'   && { value: [ defaultRow ] }),
      ...(fieldType === 'Table'                    && { columns: tableColumns })
    };
    setOwnFields(ofs => [...ofs, nf]);
    setFieldName(''); setFieldType(''); setDescription('');
    setHasFixedValue(false); setFieldDefaultValue('');
    setTableColumns([]); setDefaultRow({});
    setArrayDefaultValues([]);
    setShowNewFieldModal(false);
  };

  // Edit Field modal helpers
  const openEditFieldModal = f => {
    setFieldBeingEdited(f);
    setEditName(f.name);
    setEditType(f.type);
    setEditDescription(f.description);
    setEditFixed(!!f.fixed);
    setEditFieldDefaultValue(f.value && f.type!=='Table' ? f.value : '');
    setEditTableCols(f.columns?.slice() || []);
    setEditDefaultRow(Array.isArray(f.value) && f.value[0] ? f.value[0] : {});
    setEditArrayDefaultValues(Array.isArray(f.value) && f.type==='Array' ? f.value : []);
    setEditDialogOpen(true);
  };
  const handleEditColChange = (idx, key, val) =>
    setEditTableCols(cols => {
      const copy = [...cols];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  const addEditColumn = () =>
    setEditTableCols(cols => [...cols, { name: '', type: 'String' }]);
  const handleSaveFieldEdit = () => {
    setOwnFields(ofs =>
      ofs.map(f => {
        if (f._id !== fieldBeingEdited._id) return f;
        const updated = {
          ...f,
          name:        editName,
          type:        editType,
          description: editDescription,
          fixed:       editFixed,
          columns:     editType === 'Table' ? editTableCols : []
        };
        if (editFixed) {
          updated.value = editType === 'Table'
            ? [ editDefaultRow ]
            : editFieldDefaultValue;
        }
          if (editFixed) {
          if (editType === 'Table') {
            updated.value = [ editDefaultRow ];
          } else if (editType === 'Array') {
            updated.value = editArrayDefaultValues;
          } else {
            updated.value = editFieldDefaultValue;
          }
        }
        return updated;
      })
    );
    setEditDialogOpen(false);
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </Dashboard>
    );
  }
  if (error) {
    return (
      <Dashboard>
        <div className="p-6 text-red-600">Error: {error}</div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded"
          >
            <AiOutlineArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Edit Template</h1>
        </div>

        {/* Name & Parent */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <label className="block mb-2">Template Name</label>
          <input
            className="w-full p-2 border rounded"
            value={template.name}
            onChange={e =>
              setTemplate(t => ({ ...t, name: e.target.value }))
            }
          />
          <label className="block mt-4 mb-2">Parent Template</label>
          <input
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
            value={parentTemplateName}
          />
        </div>

        {/* Inherited Fields */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-semibold mb-4">Inherited Fields</h2>
          {inheritedFields.length === 0 ? (
            <p className="text-gray-500">No inherited fields.</p>
          ) : (
            <ul className="space-y-2">
              {inheritedFields.map(f => {
                const row = f.fixed && f.type==='Table'
                  ? (Array.isArray(f.value) && f.value[0]) || {}
                  : {};
                return (
                  <li
                    key={f._id}
                    className="relative border p-3 rounded bg-gray-50"
                  >
                    <p><strong>{f.name}</strong> ({f.type})</p>
                    <p className="text-sm mb-2">{f.description}</p>

                    {/* ── Array type display ── */}
                      {f.type === 'Array' && Array.isArray(f.value) && (
                        <ul className="list-disc pl-5 mt-2">
                          {f.value.map((item, idx) => (
                            <li key={idx} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      )}

                    {f.fixed && f.type !== 'Table' && f.type !== 'Array' && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium mb-1">Default:</label>
                        <input
                          readOnly
                          value={f.value || ''}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100 text-sm"
                        />
                      </div>
                    )}

                    {f.type === 'Table' && (
                      <table className="min-w-full border mt-2">
                        <thead className="bg-gray-100">
                          <tr>
                            {f.columns.map((c, i) => (
                              <th
                                key={i}
                                className="px-2 py-1 text-left text-xs font-semibold"
                              >
                                {c.name} ({c.type})
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {f.fixed && (
                            <tr className="border-t">
                              {f.columns.map((c, i) => (
                                <td key={i} className="px-2 py-1">
                                  <input
                                    readOnly
                                    value={row[c.name] ?? ''}
                                    className="w-full p-1 border border-gray-300 rounded bg-gray-100 text-sm"
                                  />
                                </td>
                              ))}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    <span
                      className={`absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full ${
                        f.fixed ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {f.fixed ? 'Fixed' : 'Dynamic'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Own Fields */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Your Fields</h2>
            <button
              onClick={e => {
                e.currentTarget.blur();
                setShowNewFieldModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              New Field
            </button>
          </div>
          {ownFields.length === 0 ? (
            <p className="text-gray-500">No fields yet.</p>
          ) : (
            <ul className="space-y-2">
              {ownFields.map(f => {
                const row = f.fixed && f.type==='Table'
                  ? (Array.isArray(f.value) && f.value[0]) || {}
                  : {};
                return (
                  <li
                    key={f._id}
                    className="relative border p-3 rounded bg-white flex justify-between items-start min-h-24"
                  >
                    <div className="w-full pr-20">
                      <p><strong>{f.name}</strong> ({f.type})</p>
                      <p className="text-sm mb-2">{f.description}</p>

                      {/* ── Array type display ── */}
                      {f.type === 'Array' && Array.isArray(f.value) && (
                        <ul className="list-disc pl-5 mt-2">
                          {f.value.map((item, idx) => (
                            <li key={idx} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      )}

                      {f.fixed && f.type !== 'Table' && f.type !== 'Array' && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium mb-1">Default:</label>
                          <input
                            readOnly
                            value={f.value || ''}
                            className="w-full p-1 border border-gray-300 rounded bg-gray-100 text-sm"
                          />
                        </div>
                      )}

                      {f.type === 'Table' && (
                        <table className="min-w-full border mt-2">
                          <thead className="bg-gray-100">
                            <tr>
                              {f.columns.map((c, i) => (
                                <th
                                  key={i}
                                  className="px-2 py-1 text-left text-xs font-semibold"
                                >
                                  {c.name} ({c.type})
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {f.fixed && (
                              <tr className="border-t">
                                {f.columns.map((c, i) => (
                                  <td key={i} className="px-2 py-1">
                                    <input
                                      readOnly
                                      value={row[c.name] ?? ''}
                                      className="w-full p-1 border border-gray-300 rounded bg-gray-100 text-sm"
                                    />
                                  </td>
                                ))}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AiOutlineEdit
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        size={18}
                        onClick={() => openEditFieldModal(f)}
                      />
                      <AiOutlineDelete
                        className="cursor-pointer text-red-600 hover:text-red-800"
                        size={18}
                        onClick={() => {
                          setFieldToDelete(f);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </div>
                    <span
                      className={`absolute bottom-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full ${
                        f.fixed ? 'bg-red-600' : 'bg-green-600'
                      }`}
                    >
                      {f.fixed ? 'Fixed' : 'Dynamic'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={saveLoading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            <AiOutlineSave className="inline mr-1" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Success Confirmation */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          navigate('/');
        }}
      >
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Template updated successfully!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/');
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Field?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fieldToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteField(fieldToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Field Modal */}
      <Dialog
        open={showNewFieldModal}
        onClose={() => setShowNewFieldModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Field
          <AiOutlineClose
            className="cursor-pointer float-right"
            onClick={() => setShowNewFieldModal(false)}
          />
        </DialogTitle>
        <DialogContent>
          <label className="block mt-2">Field Name</label>
          <input
            autoFocus
            className="w-full p-2 border rounded"
            value={fieldName}
            onChange={e => setFieldName(e.target.value)}
          />
          <label className="block mt-4">Type</label>
          <select
            className="w-full p-2 border rounded"
            value={fieldType}
            onChange={e => setFieldType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="String">String</option>
            <option value="Number">Number</option>
            <option value="Array">Array</option>
            <option value="Table">Table</option>
            <option value="Date">Date</option>
            <option value="Currency">Currency</option>
          </select>
          <label className="block mt-4">Description</label>
          <input
            className="w-full p-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={hasFixedValue}
                onChange={e => setHasFixedValue(e.target.checked)}
              />
              <span className="ml-2">Fixed?</span>
            </label>
          </div>
          {hasFixedValue && fieldType !== "Table" && fieldType !== "Array" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Default value
              </label>
              <input
                type={fieldType === "Number" ? "number" : "text"}
                placeholder="Enter default…"
                value={fieldDefaultValue}
                onChange={e => setFieldDefaultValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />
            </div>
          )}
          {/* 2b) Array default */}
          {hasFixedValue && fieldType === "Array" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Default Items
              </label>
              <ArrayField
                field={{ name: fieldName }}
                value={arrayDefaultValues}
                onChange={setArrayDefaultValues}
              />
            </div>
          )}
          {fieldType === 'Table' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Configure Columns</h4>
              {tableColumns.map((col, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Column name"
                    value={col.name}
                    onChange={e =>
                      handleColumnChange(i, "name", e.target.value)
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <select
                    value={col.type}
                    onChange={e =>
                      handleColumnChange(i, "type", e.target.value)
                    }
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
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"                >
                + Add Column
              </button>
            </div>
          )}
          {hasFixedValue && fieldType === "Table" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Default Row Values</h4>
              {tableColumns.map((col, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <label className="w-1/3 text-gray-700">{col.name}</label>
                  <input
                    type={col.type === "Number" ? "number" : "text"}
                    placeholder={`Default for ${col.name}`}
                    value={defaultRow[col.name] || ""}
                    onChange={e =>
                      setDefaultRow(r => ({
                        ...r,
                        [col.name]:
                          col.type === "Number"
                            ? +e.target.value
                            : e.target.value
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFieldModal(false)}>Cancel</Button>
          <Button onClick={handleAddField} color="primary">
            Add Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Field Modal */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Field
          <AiOutlineClose
            className="cursor-pointer float-right"
            onClick={() => setEditDialogOpen(false)}
          />
        </DialogTitle>
        <DialogContent>
          <label className="block mt-2">Field Name</label>
          <input
            autoFocus
            className="w-full p-2 border rounded"
            value={editName}
            onChange={e => setEditName(e.target.value)}
          />
          <label className="block mt-4">Type</label>
          <select
            className="w-full p-2 border rounded"
            value={editType}
            onChange={e => setEditType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="String">String</option>
            <option value="Number">Number</option>
            <option value="Array">Array</option>
            <option value="Table">Table</option>
            <option value="Date">Date</option>
            <option value="Currency">Currency</option>
          </select>
          <label className="block mt-4">Description</label>
          <input
            className="w-full p-2 border rounded"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
          />
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={editFixed}
                onChange={e => setEditFixed(e.target.checked)}
              />
              <span className="ml-2">Fixed?</span>
            </label>
          </div>
          {editFixed && editType !== "Table" && editType !== 'Array' &&(
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Default value
              </label>
              <input
                type={editType === "Number" ? "number" : "text"}
                placeholder="Enter default…"
                value={editFieldDefaultValue}
                onChange={e => setEditFieldDefaultValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />
            </div>
          )}

          {/* 2b) Array default */}
          {editFixed && editType === "Array" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-800 mb-2">
              Default Items
            </label>
            <ArrayField
              field={{ name: editName }}
              value={editArrayDefaultValues}
              onChange={setEditArrayDefaultValues}
            />
            </div>
          )}
          {editType === 'Table' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Configure Columns</h4>
              {editTableCols.map((col, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Column name"
                    value={col.name}
                    onChange={e => handleEditColChange(i, "name", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
                  />
                  <select
                    value={col.type}
                    onChange={e => handleEditColChange(i, "type", e.target.value)}
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
                onClick={addEditColumn}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                + Add Column
              </button>
            </div>
          )}
          {editFixed && editType === "Table" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Default Row Values</h4>
              {editTableCols.map((col, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <label className="w-1/3 text-gray-700">{col.name}</label>
                  <input
                    type={col.type === "Number" ? "number" : "text"}
                    placeholder={`Default for ${col.name}`}
                    value={editDefaultRow[col.name] || ""}
                    onChange={e =>
                      setEditDefaultRow(r => ({
                        ...r,
                        [col.name]:
                          col.type === "Number"
                            ? +e.target.value
                            : e.target.value
                      }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFieldEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Dashboard>
  );
}
