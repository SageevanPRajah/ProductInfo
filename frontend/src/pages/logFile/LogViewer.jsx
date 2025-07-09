// frontend/src/pages/logFile/LogViewer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiClock,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiMail,
  FiCalendar,
  FiChevronDown,
  FiBox,
  FiFileText,
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dashboard from '../../components/Dashboard';
import { useAuth } from '../../hooks/useAuth';
import { ActivityLogEndPoint } from '../../utils/ApiRequest';
import { useNavigate } from 'react-router-dom';

const ActivityLog = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Data & filter state
  const [activities, setActivities]               = useState([]);
  const [stats, setStats]                         = useState(null);
  const [filter, setFilter]                       = useState('');
  const [selectedCategory, setSelectedCategory]   = useState('all');
  const [selectedUser, setSelectedUser]           = useState('all');
  const [dateRange, setDateRange]                 = useState([null, null]);
  const [isLoading, setIsLoading]                 = useState(false);

  // Dropdown state
  const [open, setOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  const [startDate, endDate] = dateRange;

  // 1) Fetch all activities
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(ActivityLogEndPoint);
        setActivities(data.map(act => ({
          id: act._id,
          timestamp: act.createdAt,
          user: act.userEmail,
          action: act.category.toLowerCase().replace(' ', '_'),
          details: act.description,
          category: act.category.toLowerCase().startsWith('template')
            ? 'template'
            : 'product',
        })));
      } catch (err) {
        console.error('Failed to load activities', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, [isAuthenticated]);

  // 2) Fetch stats summary
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${ActivityLogEndPoint}/stats`);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  // 3) Apply client-side filters
  const filtered = activities.filter(a => {
    const d = new Date(a.timestamp);
    const inRange =
      (!startDate || d >= startDate) &&
      (!endDate   || d <= new Date(endDate).setHours(23,59,59,999));
    const matchText = a.details.toLowerCase().includes(filter.toLowerCase());
    const matchCat  = selectedCategory === 'all' || a.category === selectedCategory;
    const matchUser = selectedUser === 'all'   || a.user === selectedUser;
    return inRange && matchText && matchCat && matchUser;
  });

  // Pagination calculations
  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx   = (currentPage - 1) * pageSize;
  const endIdx     = Math.min(startIdx + pageSize, total);
  const pageItems  = filtered.slice(startIdx, endIdx);
  const resultFrom = total ? startIdx + 1 : 0;
  const resultTo   = endIdx;

  // Helpers
  const uniqueUsers = [...new Set(activities.map(a => a.user))];
  const getActionDetails = action => {
    switch (action) {
      case 'template_add': case 'product_add':
        return { icon: <FiPlus className="text-green-500" />, bgColor: 'bg-green-50' };
      case 'template_update': case 'product_update':
        return { icon: <FiEdit className="text-blue-500" />,  bgColor: 'bg-blue-50'  };
      case 'template_delete': case 'product_delete':
        return { icon: <FiTrash2 className="text-red-500" />,  bgColor: 'bg-red-50'   };
      default:
        return { icon: null, bgColor: 'bg-gray-50' };
    }
  };
  const formatAction = act => ({
    template_add:    'Template Added',
    template_update: 'Template Updated',
    template_delete: 'Template Deleted',
    product_add:     'Product Added',
    product_update:  'Product Updated',
    product_delete:  'Product Deleted',
  }[act] || act);

  const buildPages = () => {
    if (totalPages <= 5) return Array.from({length: totalPages}, (_,i)=>i+1);
    const pages = [];
    if (currentPage <= 3)
      pages.push(1,2,3,'...',totalPages);
    else if (currentPage >= totalPages - 2)
      pages.push(1,'...',totalPages-2,totalPages-1,totalPages);
    else
      pages.push(1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages);
    return pages;
  };

  return (
    <Dashboard>
      <div className="bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">

          {/* — Header with Improved Restore UI */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Activity Log</h1>

            <div className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="
                  inline-flex items-center
                  px-4 py-2
                  bg-white border border-blue-500
                  text-blue-600 font-medium
                  rounded-lg shadow-sm
                  hover:bg-blue-50
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition
                "
              >
                Restore
                <FiChevronDown
                  className={`ml-2 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open && (
                <div className="
                    absolute right-0 mt-2 w-52
                    bg-white border border-gray-200
                    rounded-lg shadow-lg z-20
                  ">
                  <button
                    onClick={() => { navigate('/backup'); setOpen(false); }}
                    className="
                      flex items-center w-full
                      px-4 py-2
                      text-gray-700
                      hover:bg-gray-100
                      transition
                    "
                  >
                    <FiBox className="mr-2 text-gray-500" />
                    Restore Object
                  </button>
                  <button
                    onClick={() => { navigate('/backup'); setOpen(false); }}
                    className="
                      flex items-center w-full
                      px-4 py-2
                      text-gray-700
                      hover:bg-gray-100
                      transition
                    "
                  >
                    <FiFileText className="mr-2 text-gray-500" />
                    Restore Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* — Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium">Search</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Search..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium">Category</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="template">Template</option>
                  <option value="product">Product</option>
                </select>
              </div>
              {/* User */}
              <div>
                <label className="block text-sm font-medium">User</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                >
                  <option value="all">All</option>
                  {uniqueUsers.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              {/* Reset */}
              <div className="flex items-end">
                <button
                  className="w-full bg-gray-200 py-2 rounded"
                  onClick={() => {
                    setFilter('');
                    setSelectedCategory('all');
                    setSelectedUser('all');
                    setDateRange([null, null]);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Date Range</label>
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={setDateRange}
                    isClearable
                    placeholderText="Select date range"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 pt-5">
                {(!startDate && !endDate) ? 'All Dates'
                  : startDate && !endDate ? `From ${startDate.toLocaleDateString()}`
                  : !startDate && endDate ? `Until ${endDate.toLocaleDateString()}`
                  : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                }
              </div>
            </div>
          </div>

          {/* — Summary Cards */}
          {stats && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded shadow p-4">
                <h3 className="text-sm text-gray-500">Total Activities</h3>
                <p className="text-2xl font-semibold">{stats.totalActivities}</p>
              </div>
              <div className="bg-white rounded shadow p-4">
                <h3 className="text-sm text-gray-500">Template Actions</h3>
                <p className="text-2xl font-semibold">{stats.templateActions}</p>
              </div>
              <div className="bg-white rounded shadow p-4">
                <h3 className="text-sm text-gray-500">Product Actions</h3>
                <p className="text-2xl font-semibold">{stats.productActions}</p>
              </div>
              <div className="bg-white rounded shadow p-4">
                <h3 className="text-sm text-gray-500">Unique Users</h3>
                <p className="text-2xl font-semibold">{stats.uniqueUsers}</p>
              </div>
            </div>
          )}

          {/* — Activity List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full mx-auto" />
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : !pageItems.length ? (
              <div className="p-8 text-center text-gray-500">No activities found</div>
            ) : (
              <ul className="divide-y">
                {pageItems.map(act => {
                  const { icon, bgColor } = getActionDetails(act.action);
                  return (
                    <li key={act.id} className={`p-4 hover:bg-gray-50 ${bgColor}`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 flex items-center justify-center bg-white border rounded-full">
                            {icon}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{formatAction(act.action)}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiClock className="mr-1" />
                              {new Date(act.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{act.details}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <FiMail className="mr-1" />
                            {act.user}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* — Pagination Bar */}
          <div className="flex justify-center space-x-1 mt-4 mb-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ‹
            </button>

            {buildPages().map((p, i) => {
              // build a unique key for each element
              const key = p === '...' ? `ellipsis-${i}` : `page-${p}`;
              return p === '...' ? (
                <span key={key} className="px-2 text-gray-500">…</span>
              ) : (
                <button
                  key={key}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 border rounded ${
                    p === currentPage ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
          </div>

          {/* — Bottom Results & Page-Size Selector */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-600">
              Results: {resultFrom} – {resultTo} of {total}
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

        </div>
      </div>
    </Dashboard>
  );
};

export default ActivityLog;
