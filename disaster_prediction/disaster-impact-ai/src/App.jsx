import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// If you have react-leaflet installed uncomment these imports and the MapView component below
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [historyData, setHistoryData] = useState(sampleHistory());

  useEffect(() => {
    // Example: fetch initial predictions on mount
    fetchPredictions();
  }, []);

  async function fetchPredictions() {
    setLoading(true);
    try {
      // Replace url with your backend endpoint
      const res = await axios.get('/api/predict');
      // expected: { severity: 'High', affected: [{lat, lng, severity}], timeseries: [...] }
      setPredictions(res.data);
      if (res.data && res.data.timeseries) setHistoryData(res.data.timeseries);
    } catch (err) {
      console.error('Failed to fetch predictions (demo only)', err);
      // fallback demo
      setPredictions(demoPrediction());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <div className="flex gap-4 p-6">
        <aside className="w-72 bg-white rounded-2xl shadow p-4 sticky top-6 h-[80vh]">
          <h3 className="text-xl font-semibold mb-3">Control Panel</h3>
          <button
            onClick={fetchPredictions}
            className="w-full py-2 px-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
          >
            {loading ? 'Refreshing...' : 'Refresh Predictions'}
          </button>

          <div className="mt-4">
            <h4 className="text-sm text-slate-500">Model</h4>
            <p className="text-sm">Hybrid CNN + LSTM</p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm text-slate-500">Regions</h4>
            <ul className="text-sm space-y-1">
              <li>District A</li>
              <li>District B</li>
              <li>District C</li>
            </ul>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            <strong>Notes:</strong>
            <p>Click refresh to pull latest predictions from your API. Replace demo data with real responses.</p>
          </div>
        </aside>

        <main className="flex-1 grid grid-rows-[auto_1fr] gap-4">
          <section className="grid grid-cols-3 gap-4">
            <ImpactCard title="Severity" value={predictions?.severity ?? 'Unknown'} />
            <ImpactCard title="Estimated People Affected" value={predictions?.peopleAffected ?? '—'} />
            <ImpactCard title="Estimated Economic Loss" value={predictions?.economicLoss ?? '—'} />
          </section>

          <section className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl shadow p-4 h-[60vh]">
              <h3 className="text-lg font-semibold mb-2">Impact Map</h3>
              <p className="text-xs text-slate-500 mb-3">Interactive map showing affected areas (demo).</p>
              <div className="h-full rounded-lg border-dashed border-2 border-slate-200 overflow-hidden">
                {/* MapView component: uncomment if you installed react-leaflet and configured Leaflet CSS */}
                {/* <MapView points={predictions?.affected ?? []} /> */}

                {/* Fallback placeholder if Leaflet isn't installed */}
                <div className="h-full flex items-center justify-center text-slate-400">
                  Map placeholder — install react-leaflet & leaflet and uncomment MapView.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 h-[60vh]">
              <h3 className="text-lg font-semibold mb-2">Predicted Trend</h3>
              <div className="h-[42vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="text-center py-6 text-xs text-slate-500">Disaster Impact — AI Demo Dashboard</footer>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">DI</div>
          <div>
            <h1 className="text-lg font-semibold">Disaster Impact — AI</h1>
            <p className="text-xs text-slate-400">Prediction · Visualization · Alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="py-1 px-3 text-sm rounded-md bg-slate-100">Profile</button>
          <button className="py-1 px-3 text-sm rounded-md bg-slate-100">Settings</button>
        </div>
      </div>
    </header>
  );
}

function ImpactCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-sm text-slate-500">{title}</h4>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

// Uncomment and use MapView if you have the Leaflet stack installed
/*
function MapView({ points = [] }) {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]}>
          <Popup>
            {p.name ?? 'Affected'} — Severity: {p.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
*/

// Demo data helpers
function sampleHistory() {
  return [
    { time: 'T-5', value: 10 },
    { time: 'T-4', value: 30 },
    { time: 'T-3', value: 60 },
    { time: 'T-2', value: 80 },
    { time: 'T-1', value: 95 },
    { time: 'Now', value: 100 },
  ];
}

function demoPrediction() {
  return {
    severity: 'High',
    peopleAffected: '~12,300',
    economicLoss: '₹45M',
    affected: [
      { lat: 19.0760, lng: 72.8777, severity: 'High', name: 'Location A' },
      { lat: 18.5204, lng: 73.8567, severity: 'Medium', name: 'Location B' },
    ],
    timeseries: sampleHistory(),
  };
}
