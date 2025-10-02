import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Signup from "./Signup";
import Login from "./Login";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [historyData, setHistoryData] = useState(sampleHistory());

  useEffect(() => {
    fetchPredictions();
  }, []);

  async function fetchPredictions() {
    setLoading(true);
    try {
      const res = await axios.get("/api/predict");
      setPredictions(res.data);
      if (res.data && res.data.timeseries) setHistoryData(res.data.timeseries);
    } catch (err) {
      console.error("Failed to fetch predictions, using demo data", err);
      setPredictions(demoPrediction());
    } finally {
      setLoading(false);
    }
  }

  return (
    <Router>
      <div className="app">
        <Header />

        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <HomePage
                loading={loading}
                predictions={predictions}
                historyData={historyData}
                fetchPredictions={fetchPredictions}
              />
            }
          />

          {/* Sign Up Page */}
          <Route path="/signup" element={<Signup />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />
        </Routes>

        <footer className="footer">
          © 2025 Disaster Impact AI Dashboard — All Rights Reserved
        </footer>
      </div>
    </Router>
  );
}

// -------------------- Header --------------------
function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>Disaster Impact — AI</h1>
          <p>Prediction · Visualization · Alerts</p>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            className="MAN"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Menu
          </button>

          {isDropdownOpen && (
            <div className="menu11">
              <Link to="/" className="tag" onClick={() => setIsDropdownOpen(false)}>Home</Link>
              <Link to="/signup" className="tag" onClick={() => setIsDropdownOpen(false)}>Sign Up</Link>
              <Link to="/login" className="tag" onClick={() => setIsDropdownOpen(false)}>Login</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// -------------------- HomePage Wrapper --------------------
function HomePage({ loading, predictions, historyData, fetchPredictions }) {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Control Panel</h3>
        <button onClick={fetchPredictions} className="refresh-btn">
          {loading ? (
            <>
              <div className="spinner"></div> Refreshing...
            </>
          ) : (
            "🔄 Refresh Predictions"
          )}
        </button>

        <div className="sidebar-section">
          <h4>Model</h4>
          <p>Hybrid CNN + LSTM</p>
        </div>

        <div className="mt-4">
          <h4 className="text-sm text-slate-500">Regions</h4>
          <ul className="text-sm space-y-1">
            <li><button className="region-btn">District A</button></li>
            <li><button className="region-btn">District B</button></li>
            <li><button className="region-btn">District C</button></li>
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Impact cards */}
        <section className="cards">
          <ImpactCard title="Severity" value={predictions?.severity ?? "Unknown"} />
          <ImpactCard title="Estimated People Affected" value={predictions?.peopleAffected ?? "—"} />
          <ImpactCard title="Estimated Economic Loss" value={predictions?.economicLoss ?? "—"} />
        </section>

        {/* Map + Chart */}
        <section className="charts">
          <div className="map-card">
            <h3>Impact Map</h3>
            <div className="map-container">
              <MapView points={predictions?.affected ?? []} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Predicted Trend</h3>
            <div className="chart-container">
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

        {/* Alerts */}
        <section className="alerts">
          <div className="alert-box">
            🚨 <strong>Severe Flood Risk Detected:</strong> Maharashtra region.
            Immediate evacuation protocols recommended.
          </div>
        </section>
      </main>
    </div>
  );
}

// -------------------- Impact Card --------------------
function ImpactCard({ title, value }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <div className="card-value">{value}</div>
    </div>
  );
}

// -------------------- Map View --------------------
function MapView({ points = [] }) {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]}>
          <Popup>
            {p.name ?? "Affected"} — Severity: {p.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// -------------------- Sample Data --------------------
function sampleHistory() {
  return [
    { time: "T-5", value: 10 },
    { time: "T-4", value: 30 },
    { time: "T-3", value: 60 },
    { time: "T-2", value: 80 },
    { time: "T-1", value: 95 },
    { time: "Now", value: 100 },
  ];
}

function demoPrediction() {
  return {
    severity: "High",
    peopleAffected: "~12,300",
    economicLoss: "₹45M",
    affected: [
      { lat: 19.076, lng: 72.8777, severity: "High", name: "Location A" },
      { lat: 18.5204, lng: 73.8567, severity: "Medium", name: "Location B" },
    ],
    timeseries: sampleHistory(),
  };
}
