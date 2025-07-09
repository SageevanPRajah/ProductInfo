import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import TableField from '../../components/TableField';
import ArrayField from '../../components/ArrayField';
import { AiOutlineArrowLeft, AiOutlineSave } from 'react-icons/ai';
import ImageCropper from '../../components/ImageCropper'; 
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from "../../utils/logActivity"; 
import { TemplateEndPoint, TemplateDataEndPoint } from "../../utils/ApiRequest";

export default function EditProduct() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [templateData, setTemplateData] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    description: '',
    data: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image cropping states
  const [imageFile, setImageFile] = useState(null);          
  const [previewImage, setPreviewImage] = useState('');      
  const [cropping, setCropping] = useState(false);           
  const [selectedImageSrc, setSelectedImageSrc] = useState(null); 

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the template data entry
        const { data: entryJson } = await axios.get(`${TemplateDataEndPoint}/entry/${id}`);

        // Fetch the template structure
        const { data: tempJson } = await axios.get(`${TemplateEndPoint}/${entryJson.templateID}`);

        setFields(tempJson.fields);
        setTemplateData(tempJson.template);

        // Parse the data field if it's a string
        let parsedData = entryJson.data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch (err) {
            console.error('Error parsing data:', err);
            parsedData = {};
          }
        }

        // Initialize form data with all fields
        setFormData({
          productName: entryJson.productName || '',
          price: entryJson.price || '',
          description: entryJson.description || '',
          data: {
            ...parsedData,
            productName: entryJson.productName || '',
            price: entryJson.price || '',
            description: entryJson.description || '',
            ...(parsedData || {})
          }
        });

        setPreviewImage(entryJson.image || '');
      } catch (err) {
        console.error('Load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      data: {
        ...prev.data,
        [name]: value
      }
    }));
  };

  const handleDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('data', JSON.stringify(formData.data));
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const { data: result } = await axios.put(`${TemplateDataEndPoint}/${id}`, formDataToSend);
      logActivity(
        "Product Updated",
        `Edit Product "${formData.data.productName}"`
      );
      navigate(-1);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="p-6">
          <p>Loading...</p>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <div className="p-6">
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            Error: {error}
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 flex items-center"
          >
            <AiOutlineArrowLeft className="mr-2" /> Back
          </button>
        </div>
      </Dashboard>
    );
  }

  if (!templateData) {
    return (
      <Dashboard>
        <div className="p-6">
          <p>Template data not found</p>
          <button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 flex items-center mt-4"
          >
            <AiOutlineArrowLeft className="mr-2" /> Back
          </button>
        </div>
      </Dashboard>
    );
  }

  const fixedFields = fields.filter(f => f.fixed);
  const dynamicFields = fields.filter(f => !f.fixed);

  return (
    <Dashboard>
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 text-blue-600 flex items-center"
        >
          <AiOutlineArrowLeft className="mr-2" /> Back
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Edit Item in {templateData.name}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Image</label>
              
              {!cropping ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                  />
                  {previewImage && (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="mt-2 h-32 object-contain border rounded"
                    />
                  )}
                </>
              ) : (
                <ImageCropper 
                  imageSrc={selectedImageSrc} 
                  onCropComplete={handleCropComplete} 
                />
              )}
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
                  const kind = field.selectType ?? field.type;
                  // make tables *and* arrays span 2 cols
                  const wrapperClasses = (kind === 'Table' || kind === 'Array')
                    ? 'md:col-span-2'
                    : '';

                  // ─── Handle Array fields ───
                  if (kind === 'Array') {
                    return (
                      <div
                        key={field._id}
                        className={`${wrapperClasses} border p-3 rounded bg-white`}
                      >
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

                  // ① Handle Table fields first
                  if (kind === 'Table') {
                    return (
                      <div
                        key={field._id}
                        className={`${wrapperClasses} border p-3 rounded bg-white`}
                      >
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

                  // ② Fallback: your existing input logic
                  const htmlType =
                    kind === 'Number'   ? 'number' :
                    kind === 'Date'     ? 'date'   :
                    kind === 'Currency' ? 'number' :
                                          'text';
                  const step = kind === 'Currency' ? '0.01' : undefined;
                  const val = kind === 'Date' && formData.data[field.name]
                    ? new Date(formData.data[field.name]).toISOString().slice(0,10)
                    : formData.data[field.name] || '';

                  return (
                    <div key={field._id} className="relative border p-3 rounded bg-white">
                      <p><strong>{field.name}</strong> ({field.type})</p>
                      <p className="text-sm mb-2">{field.description}</p>

                      {kind === 'Currency' && (
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <span className="text-gray-600 text-sm">Rs.</span>
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-blue-400"
            >
              <AiOutlineSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Dashboard>
  );
}