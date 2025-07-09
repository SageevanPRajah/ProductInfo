import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Dashboard from '../../components/Dashboard';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { TemplateDataEndPoint } from '../../utils/ApiRequest'; 

const ViewData = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState('/altImage.png');

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: json } = await axios.get(`${TemplateDataEndPoint}/entry/${id}`,
          { signal }
        );

        // Parse stringified data
        let parsedData = json.data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch {
            throw new Error('Invalid JSON format in data field');
          }
        }

        setTemplateData({ ...json, data: parsedData });
        setCurrentImage(json.image || '/altImage.png');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
    return () => controller.abort();
  }, [id, isAuthenticated]);

  const handleImageError = () => {
    setCurrentImage('/altImage.png');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const formatValue = (val) => {
   if (val == null || val === '') {
     return <span className="text-gray-400">empty</span>;
   }
   // Array of objects → real table
   if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
     const cols = Object.keys(val[0]);
     return (
       <table className="w-full table-auto mb-2 border">
         <thead>
           <tr>
             {cols.map(c => (
               <th key={c} className="px-2 py-1 border">{c}</th>
             ))}
           </tr>
         </thead>
         <tbody>
           {val.map((row, i) => (
             <tr key={i}>
               {cols.map(c => (
                 <td key={c} className="p-1 border">{row[c]}</td>
               ))}
             </tr>
           ))}
         </tbody>
       </table>
     );
   }

   // Array of primitives → render bullet list
   if (Array.isArray(val) && val.length > 0 && typeof val[0] !== 'object') {
     return (
       <ul className="list-disc pl-5">
         {val.map((item, i) => (
           <li key={i}>{item}</li>
         ))}
       </ul>
     );
   }

   // Plain object or array of primitives → JSON
   if (typeof val === 'object') {
     return <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(val, null, 2)}</pre>;
   }
   // String or number
   return val;
 };


  if (loading) {
    return (
      <Dashboard>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded-full hover:bg-gray-100">
              <IoArrowBack className="text-2xl text-blue-600" />
            </button>
            <h1 className="text-2xl font-bold">Loading Template Data</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600">Loading template data...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded-full hover:bg-gray-100">
              <IoArrowBack className="text-2xl text-blue-600" />
            </button>
            <h1 className="text-2xl font-bold">Error Loading Data</h1>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-10.707a1 1 0 011.414 0L10 8.586l-.707-.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading template data</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded-full hover:bg-gray-100">
            <IoArrowBack className="text-2xl text-blue-600" />
          </button>
          <h1 className="text-2xl font-bold">Template Data Details</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {templateData.data.productName || 'Unnamed Template'}
                </h2>
                {templateData.price != null && (
                  <p className="text-lg text-green-600 mt-1">RS.{templateData.price}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <AiOutlineInfoCircle className="text-blue-500 text-xl" />
                <span className="text-sm text-gray-500">ID: {id}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left */}
              <div className="md:w-1/2">
                <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentImage}
                    alt={templateData.data.productName || 'Template'}
                    onError={handleImageError}
                    className="w-full h-64 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {templateData.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="md:w-1/2">
                <h3 className="text-lg font-semibold mb-4">Template Fields</h3>
                <div className="space-y-3">
                  {Object.entries(templateData.data)
                    .filter(([key]) => key !== 'image')
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{key}</span>
                          <span>{formatValue(value)}</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default ViewData;
