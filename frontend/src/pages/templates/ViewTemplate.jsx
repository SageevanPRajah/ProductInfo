// src/pages/templates/ViewTemplate.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { AiOutlineArrowLeft, AiOutlinePlus } from 'react-icons/ai';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { TemplateEndPoint } from '../../utils/ApiRequest'; 

export default function ViewTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [template, setTemplate] = useState(null);
  const [fields, setFields]     = useState([]);
  const [breadcrumb, setBreadcrumb] = useState('');

  // Fetch the template + its fields
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const { data: { template, fields } } = await axios.get(`${TemplateEndPoint}/${id}`);
        setTemplate(template);
        setFields(fields);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id, isAuthenticated]);

  // Build full breadcrumb chain
  useEffect(() => {
    if (!template || !isAuthenticated) return;

    (async () => {
      const names = [];
      let currentId = template._id;

      while (currentId) {
        try {
          const { data: { template: t } } = await axios.get(`/templates/${currentId}`);
          names.unshift(t.name);
          currentId = t.parentTemplate;
        } catch {
          break;
        }
      }
      setBreadcrumb(names.join(' > '));
    })();
  }, [template, isAuthenticated]);

  if (!template) return (
    <Dashboard>
      <p>Loading…</p>
    </Dashboard>
  );

  const inheritedFields = fields.filter(f => f.inherited);
  const ownFields       = fields.filter(f => !f.inherited);

  return (
    <Dashboard>
      <div className="p-6 bg-white rounded shadow">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 flex items-center"
        >
          <AiOutlineArrowLeft className="mr-2" />
          Back
        </button>

        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-2">Path: {breadcrumb}</p>
        <p className="text-sm text-gray-500 mb-2">Parent:{template.parentTemplateName}</p>

        <h1 className="text-2xl font-bold mb-6">{template.name}</h1>

        {/* Inherited Fields */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Inherited Fields</h2>
          {inheritedFields.length === 0 ? (
            <p className="text-gray-500">No inherited fields.</p>
          ) : (
            <ul className="space-y-4">
              {inheritedFields.map(f => {
                const row = f.fixed && f.type === 'Table'
                  ? (Array.isArray(f.value) && f.value[0]) || {}
                  : {};
                return (
                  <li
                    key={f._id}
                    className="relative border p-3 rounded bg-gray-50"
                  >
                    <p><strong>{f.name}</strong> ({f.type})</p>
                    <p className="text-sm mb-2">{f.description}</p>

                    {/* Fixed default for non-table */}
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

                    {/* Table columns & default row */}
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
                        {f.fixed && (
                          <tbody>
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
                          </tbody>
                        )}
                      </table>
                    )}

                    {/* Badge */}
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
        </section>

        {/* Own Fields */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Fields</h2>
          {ownFields.length === 0 ? (
            <p className="text-gray-500">No own fields.</p>
          ) : (
            <ul className="space-y-4">
              {ownFields.map(f => {
                const row = f.fixed && f.type === 'Table'
                  ? (Array.isArray(f.value) && f.value[0]) || {}
                  : {};
                return (
                  <li
                    key={f._id}
                    className="relative border p-3 rounded bg-white"
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

                    {/* Fixed default for non-table */}
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

                    {/* Table columns & default row */}
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
                        {f.fixed && (
                          <tbody>
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
                          </tbody>
                        )}
                      </table>
                    )}

                    {/* Badge */}
                    <span
                      className={`absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full ${
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
        </section>

        {/* Add Product Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(`/templates/${id}/add-product`)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            <AiOutlinePlus className="mr-2" />
            Add Object
          </button>
        </div>
      </div>
    </Dashboard>
  );
}
