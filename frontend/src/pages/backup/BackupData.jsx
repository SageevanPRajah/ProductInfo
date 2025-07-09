import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { AiOutlineReload } from 'react-icons/ai';
import Dashboard from '../../components/Dashboard';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { TemplateDataEndPoint } from '../../utils/ApiRequest';

export default function BackupData() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState('/altImage.png');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: json } = await axios.get(
          `${TemplateDataEndPoint}/entry/${id}`,
          { signal }
        );
        let parsedData = json.data;
        if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
        setTemplateData({ ...json, data: parsedData });
        setCurrentImage(json.image || '/altImage.png');
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
    return () => controller.abort();
  }, [id, isAuthenticated]);

  const handleImageError = () => setCurrentImage('/altImage.png');

  const handleRestoreClick = () => {
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    setLoading(true);
    try {
      await axios.patch(`${TemplateDataEndPoint}/restore/${id}`);
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setShowRestoreModal(false);
    }
  };

  const formatValue = (value) => {
    if (value == null || value === "") {
      return <span className="text-gray-400 italic">empty</span>;
    }
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-4 text-gray-800 text-xs">
          {value.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }
    if (typeof value === "object") {
      return (
        <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center min-h-[200px]">
          <span className="text-gray-500">Loading template data…</span>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center min-h-[200px]">
          <span className="text-red-600">
            {process.env.NODE_ENV === 'development' ? error : "Something went wrong. Please try again."}
          </span>
        </div>
      </Dashboard>
    );
  }

  // Split data fields
  const entries = Object.entries(templateData.data);
  const tableFields = entries.filter(
    ([, val]) => Array.isArray(val) && val.length > 0 && typeof val[0] === 'object'
  );
  const otherFields = entries.filter(
    ([key, val]) =>
      key !== 'image' &&
      key !== 'description' &&
      !(Array.isArray(val) && val.length > 0 && typeof val[0] === 'object')
  );

  return (
    <Dashboard>
      <div className="px-2 sm:px-4 max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <IoArrowBack className="text-2xl text-blue-600" />
          </button>
          <button
            onClick={handleRestoreClick}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Restore"
          >
            <AiOutlineReload className="text-xl sm:text-2xl text-green-600" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {templateData.data.productName || 'Unnamed Template'}
              </h2>
              {templateData.price != null && (
                <p className="text-base sm:text-lg text-green-600 mt-1">Rs. {templateData.price}</p>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
              {/* LEFT: Image & Tables */}
              <div className="md:w-1/2 w-full">
                <div className="mb-4 sm:mb-6 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentImage}
                    alt={templateData.data.productName}
                    onError={handleImageError}
                    className="w-full max-h-64 object-contain"
                    style={{ aspectRatio: '4/3', objectFit: 'contain' }}
                  />
                </div>

                {tableFields.map(([key, val]) => (
                  <div key={key} className="mt-6">
                    <h4 className="font-semibold mb-2 capitalize">{key}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs bg-white border rounded">
                        <thead>
                          <tr className="bg-blue-100">
                            {Object.keys(val[0]).map(col => (
                              <th key={col} className="border px-2 py-1 text-blue-800 font-semibold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {val.map((row, i) => (
                            <tr
                              key={i}
                              className="odd:bg-white even:bg-blue-50 hover:bg-blue-200"
                            >
                              {Object.keys(val[0]).map(col => (
                                <td key={col} className="border px-2 py-1">
                                  {typeof row[col] === 'object'
                                    ? JSON.stringify(row[col])
                                    : row[col]?.toString()}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: Other fields */}
              <div className="md:w-1/2 w-full">
                <div className="space-y-3">
                  {otherFields.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 shadow-sm"
                    >
                      <span className="min-w-[7rem] sm:w-36 font-bold text-blue-900 capitalize">
                        {key}
                      </span>
                      <span className="flex-1 text-gray-900 break-words">
                        {formatValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restore Confirmation Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4">Confirm Restore</h2>
              <p className="mb-6">
                Are you sure you want to restore this item? It will be re-activated.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
                >
                  {loading ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
}