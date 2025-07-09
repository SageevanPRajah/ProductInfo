// frontend/src/pages/logFile/LogViewer.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { AiOutlineInfoCircle, AiOutlineCloudDownload } from 'react-icons/ai';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TemplateEndPoint, TemplateDataEndPoint } from "../../utils/ApiRequest";

const AllDeleteProducts = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState([]);
  const [templatesMap, setTemplatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${TemplateDataEndPoint}/backup`);
        const entries = Array.isArray(res.data) ? res.data : res.data.data || [];
        // build templates map
        const ids = [...new Set(entries.map(e => e.templateID))];
        const tm = {};
        await Promise.all(ids.map(async id => {
          try {
            const { data: { template } } = await axios.get(`${TemplateEndPoint}/${id}`);
            tm[id] = template.name;
          } catch {
            tm[id] = 'Unknown';
          }
        }));
        setTemplatesMap(tm);
        setData(entries);
      } catch (err) {
        setError(err.message || 'Failed to load entries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  // filter logic
  const filtered = data
    .filter(entry => {
      const raw = entry.data;
      let d = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const name = entry.productName || d.productName || '';
      return name.toLowerCase().includes(filter.toLowerCase());
    })
    .filter(entry => {
      if (!startDate && !endDate) return true;
      const ts = entry.updatedAt ? new Date(entry.updatedAt) : null;
      if (!ts) return true;
      return (!startDate || ts >= startDate) && (!endDate || ts <= new Date(endDate).setHours(23,59,59,999));
    });

  // pagination calculations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx   = Math.min(startIdx + pageSize, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  const handleReset = () => {
    setFilter('');
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  return (
    <Dashboard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Deleted Products</h1>
          <button
            onClick={handleReset}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiRefreshCw className="text-lg mr-1" /> Reset
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Product name..."
                  className="w-full border rounded px-10 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={upd => { setDateRange(upd); setCurrentPage(1); }}
                isClearable
                className="w-full border rounded px-3 py-2"
                placeholderText="Select date range"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : total === 0 ? (
          <div className="text-gray-500 text-center py-16">No deleted products found.</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (RS)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map(entry => {
                    let d = entry.data;
                    if (typeof d === 'string') {
                      try { d = JSON.parse(d); } catch {} 
                    }
                    const name = entry.productName || d.productName || '—';
                    const template = templatesMap[entry.templateID] || '—';
                    const deletedAt = entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—';
                    const price = entry.price ?? d.price ?? '—';

                    return (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{template}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{deletedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry._id.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(
                              `/backup/${entry._id}`
                            )}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            <AiOutlineCloudDownload className="text-lg" />
                            Backup
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center py-4">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing {startIdx + 1} to {endIdx} of {total} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={
                      `px-3 py-1 border rounded ${
                        p === currentPage ? 'bg-blue-500 text-white' : 'text-gray-700'
                      }`
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <select
                className="border rounded p-1"
                value={pageSize}
                onChange={e => {
                  setPageSize(+e.target.value);
                  setCurrentPage(1);
                }}
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </Dashboard>
  );
};

export default AllDeleteProducts;
