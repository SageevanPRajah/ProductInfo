import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import TableField from '../../components/TableField';
import ArrayField from '../../components/ArrayField';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import ImageCropper from '../../components/ImageCropper'; 
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from "../../utils/logActivity"; 
import { TemplateEndPoint, TemplateDataEndPoint } from "../../utils/ApiRequest";


export default function AddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    data: {
      productName: '',
      price: 0,
      description: '',
      image: '',
      
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image cropping states
  const [imageFile, setImageFile] = useState(null);          
  const [previewImage, setPreviewImage] = useState('');      
  const [cropping, setCropping] = useState(false);           
  const [selectedImageSrc, setSelectedImageSrc] = useState(null); 

  // Fetch template and fields on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { template: templateData, fields: fieldsData } } =
          await axios.get(`${TemplateEndPoint}/${id}`);
        setTemplate(templateData);
        setFields(fieldsData);

        
        const initialData = {
          productName: '',
          price: 0,
          description: '',
          image: ''
        };

        fieldsData.forEach(field => {
          if (field.fixed) {
            initialData[field.name] = field.value;
          }
         else if (field.type === 'Table') {
           initialData[field.name] = [];   
         }
        });

        setFormData(prev => ({
          data: {
            ...initialData,
            ...prev.data
          }
        }));

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  // Handle file selection and open cropper
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageSrc(reader.result);
        setCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Receive cropped image file from cropper
  const handleCropComplete = (croppedFile) => {
    setImageFile(croppedFile);
    setCropping(false);
    const previewURL = URL.createObjectURL(croppedFile);
    setPreviewImage(previewURL);
  };

  // Handle simple input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      data: {
        ...prev.data,
        [name]: value
      }
    }));
  };

  // Handle dynamic field changes
  const handleDataChange = (fieldName, value) => {
    setFormData(prev => ({
      data: {
        ...prev.data,
        [fieldName]: value
      }
    }));
  };

  // Submit form with cropped image
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('templateID', id);
      formDataToSend.append('data', JSON.stringify(formData.data));

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await axios.post(TemplateDataEndPoint, formDataToSend);
      logActivity(
        "Product Added",
        `Create Product "${formData.data.productName}"`
      ); 

      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Dashboard>
      <p>Loading...</p>
    </Dashboard>
  );

  if (error) return (
    <Dashboard>
      <div className="p-6 bg-white rounded shadow">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 flex items-center"
        >
          <AiOutlineArrowLeft className="mr-2" />
          Back
        </button>
      </div>
    </Dashboard>
  );

  // Separate fixed and dynamic fields
  const fixedFields = fields.filter(f => f.fixed);
  const dynamicFields = fields.filter(f => !f.fixed);

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

        <h1 className="text-2xl font-bold mb-6">Add New Object to {template?.name}</h1>

        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Basic Product Info */}
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Object Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Object Name*</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.data.productName || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    Rs.
                  </span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.data.price || ""}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 p-2 border rounded text-sm"
                  />
                </div>
              </div>

              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.data.description || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Product Image</label>

                {!cropping ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded"
                    />
                    {previewImage && (
                      <div className="mt-2">
                        <img src={previewImage} alt="Preview" className="h-32 object-contain" />
                      </div>
                    )}
                  </>
                ) : (
                  <ImageCropper imageSrc={selectedImageSrc} onCropComplete={handleCropComplete} />
                )}
              </div>
            </div>
          </div>

          {/* Fixed Fields Section */}
          {fixedFields.length > 0 && (
            <div className="border p-4 rounded bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Fixed Fields</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fixedFields.map(field => {
                  // ─── Handle Array-type fixed fields ───
                  if (field.type === 'Array') {
                    const items = Array.isArray(formData.data[field.name])
                      ? formData.data[field.name]
                      : [];
                    return (
                      <div
                        key={field._id}
                        className="relative border p-3 rounded bg-gray-50 md:col-span-2"
                      >
                        <p><strong>{field.name}</strong> (Array)</p>
                        <p className="text-sm mb-2">{field.description}</p>
                        <ul className="list-disc pl-5">
                          {items.map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                        <span className="absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600">
                          Fixed
                        </span>
                      </div>
                    );
                  }
                  // ① If this fixed field is a Table, render it as a static table
                  if (field.type === 'Table') {
                    const rows = formData.data[field.name] || [];
                    const cols = field.columns || [];
                    return (
                      <div key={field._id} className="relative border p-3 rounded bg-gray-50 md:col-span-2">
                        <p><strong>{field.name}</strong> (Table)</p>
                        <p className="text-sm mb-2">{field.description}</p>
                        <div className="overflow-auto border rounded">
                          <table className="w-full table-auto mb-2">
                            <thead>
                              <tr>
                                {cols.map(col => (
                                  <th key={col.name} className="px-2 py-1 text-left border">{col.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => (
                                <tr key={i}>
                                  {cols.map(col => (
                                    <td key={col.name} className="p-1 border">{row[col.name]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <span className="absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600">
                          Fixed
                        </span>
                      </div>
                    );
                  }
                  // ② Otherwise, fall back to your existing read-only input (including Rs. prefix for Currency)
                  return (
                    <div key={field._id} className="relative border p-3 rounded bg-gray-50">
                      <p><strong>{field.name}</strong> ({field.type})</p>
                      <p className="text-sm mb-2">{field.description}</p>

                      {/* Currency prefix wrapper */}
                      <div className="relative">
                        {field.type === 'Currency' && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                            Rs.
                          </span>
                        )}
                        <input
                          readOnly
                          value={formData.data[field.name] != null ? formData.data[field.name] : ''}
                          className={`w-full p-1 border border-gray-300 rounded bg-gray-100 text-sm
                            ${field.type === 'Currency' ? 'pl-8' : ''}`}
                        />
                      </div>

                      <span className="absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600">
                        Fixed
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Fields Section */}
          {dynamicFields.length > 0 && (
            <div className="border p-4 rounded bg-white">
              <h2 className="text-xl font-semibold mb-4">Dynamic Fields</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicFields.map(field => {
                  // unify on a single source of truth
                  const kind = field.selectType ?? field.type;
                   // Full‐width for tables
                  const wrapperClasses = kind === 'Table' || kind === 'Array' ? 'md:col-span-2' : '';

                  // ─── Handle Array fields ───
                  if (kind === 'Array') {
                    return (
                      <div key={field._id} className={`${wrapperClasses} border p-3 rounded bg-white`}>
                        <p><strong>{field.name}</strong> (Array)</p>
                        <p className="text-sm mb-2">{field.description}</p>
                        <ArrayField
                          field={field}
                          value={formData.data[field.name]}
                          onChange={val => handleDataChange(field.name, val)}
                        />
                      </div>
                    );
                  }

                  // Handle tables first
                  if (kind === 'Table') {
                    return (
                      <div key={field._id} className={`${wrapperClasses} border p-3 rounded`}>
                        <p><strong>{field.name}</strong> (Table)</p>
                        <p className="text-sm mb-2">{field.description}</p>
                        <TableField
                          field={field}
                          value={formData.data[field.name]}
                          onChange={val => handleDataChange(field.name, val)}
                        />
                      </div>
                    );
                  }

                  // choose HTML input attributes
                  const htmlType =
                    kind === 'Number'   ? 'number' :
                    kind === 'Date'     ? 'date'   :
                    kind === 'Currency' ? 'number' :
                                          'text';

                  // only currency needs a decimal step
                  const step = kind === 'Currency' ? '0.01' : undefined;

                  // date pickers need yyyy-MM-dd format
                  const val =
                    kind === 'Date' && formData.data[field.name]
                      ? new Date(formData.data[field.name]).toISOString().slice(0,10)
                      : formData.data[field.name] || '';

                  return (
                    <div key={field._id} className="relative border p-3 rounded bg-white">
                      <p><strong>{field.name}</strong> ({field.type})</p>
                      <p className="text-sm mb-2">{field.description}</p>

                      {kind === 'Currency' && (
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <span className="text-gray-600 text-sm relative top-[12px]">Rs.</span>
                        </div>
                      )}

                      <input
                        type={htmlType}
                        step={step}
                        pattern={kind === 'Currency' ? '^\\d+(\\.\\d{1,2})?$' : undefined}
                        title={kind === 'Currency' ? 'Enter a valid amount' : undefined}
                        value={val}
                        onChange={e => handleDataChange(field.name, e.target.value)}
                        className={`w-full p-1 border border-gray-300 rounded text-sm ${
                          kind === 'Currency' ? 'pl-12' : ''
                        }`}
                      />

                      <span className="absolute top-2 right-2 text-white text-xs font-medium px-2 py-0.5 rounded-full bg-red-600">
                        Dynamic
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? 'Saving...' : 'Save Object'}
          </button>
        </form>
      </div>
    </Dashboard>
  );
}
