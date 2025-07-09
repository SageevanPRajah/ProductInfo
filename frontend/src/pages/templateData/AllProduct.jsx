import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { TemplateEndPoint, TemplateDataEndPoint } from "../../utils/ApiRequest";

const AllProducts = () => {
  const { isAuthenticated } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [templatesMap, setTemplatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all templateData
  useEffect(() => {
    if (!isAuthenticated) return; 
    async function load() {
      try {
        setLoading(true);

        const res = await axios.get(`${TemplateDataEndPoint}/all`);

        let allEntries = [];
        if (Array.isArray(res.data)) {
          allEntries = res.data;
        } else if (Array.isArray(res.data.data)) {
          allEntries = res.data.data;
        } else {
          console.warn('Unexpected shape for templatedata/all:', res.data);
        }

        if (!allEntries.length) {
          throw new Error('No products returned from server');
        }
        const ids = [...new Set(allEntries.map(e => e.templateID))];

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
        setProducts(allEntries);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  if (loading) return <Dashboard><p className="p-6">Loading products…</p></Dashboard>;
  if (error) return <Dashboard><p className="p-6 text-red-600">{error}</p></Dashboard>;

  return (
    <Dashboard>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">All Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(entry => {
            // parse JSON-stringified data if necessary
            let data = entry.data;
            if (typeof data === 'string') {
              try { data = JSON.parse(data); } catch {}
            }
            const name = entry.productName || data.productName || 'Unnamed';
            const price = entry.price ?? data.price ?? '–';
            const img = entry.image || data.image;

            return (
              <div key={entry._id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <img
                    src={img || '/altImage.png'}
                    alt={name}
                    onError={e => { e.currentTarget.src = '/altImage.png'; }}
                    className="object-contain h-full"
                  />
                </div>
                <div className="p-4 flex-1">
                  <h2 className="font-semibold text-lg">{name}</h2>
                  <p className="text-sm text-gray-500 mb-2">
                    Template: <span className="font-medium">{templatesMap[entry.templateID]}</span>
                  </p>
                  <p className="text-xl text-green-600">RS.{price}</p>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between text-gray-500 text-sm">
                  <span className="flex items-center">
                    <AiOutlineInfoCircle className="mr-1" /> ID: {entry._id.slice(-6)}
                  </span>
                  <button
                    onClick={() => navigate(`/viewData/${entry._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dashboard>
  );
};

export default AllProducts;