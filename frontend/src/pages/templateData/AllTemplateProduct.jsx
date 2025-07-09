import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { IoArrowBack } from 'react-icons/io5';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { TemplateEndPoint, TemplateDataEndPoint } from "../../utils/ApiRequest";

export default function AllTemplateProduct() {
  const { templateID } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        setLoading(true);

        const { data: tplRes } = await axios.get(`${TemplateEndPoint}/${templateID}`);
        setTemplateName(tplRes.template.name);

        const { data: tplData } = await axios.get(`${TemplateDataEndPoint}/${templateID}`);
        setEntries(Array.isArray(tplData) ? tplData : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [templateID, isAuthenticated]);;

  if (loading) return <Dashboard><p className="p-6">Loading…</p></Dashboard>;
  if (error)   return <Dashboard><p className="p-6 text-red-600">{error}</p></Dashboard>;

  return (
    <Dashboard>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded-full hover:bg-gray-100">
            <IoArrowBack className="text-2xl text-blue-600" />
          </button>
          <h1 className="text-2xl font-bold">Objects for “{templateName}”</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {entries.map(entry => {
            let data = entry.data;
            if (typeof data === 'string') {
              try { data = JSON.parse(data); } catch {}
            }
            const name  = entry.productName  || data.productName || 'Unnamed';
            const price = entry.price        ?? data.price ?? '–';
            const img   = entry.image        || data.image;

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
                  <p className="text-xl text-green-600">Rs.{price}</p>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between text-gray-500 text-sm">
                  <span className="flex items-center">
                    <AiOutlineInfoCircle className="mr-1" /> ID: {entry._id.slice(-6)}
                  </span>
                  <button
                    onClick={() => navigate(`/inspectData/${entry._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Inspect Object
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dashboard>
  );
}
