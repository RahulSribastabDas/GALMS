import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout';
import {
  MapPin, AlertTriangle, Shield, Clock, RefreshCw,
  CheckCircle, XCircle, Eye, Filter, Layers,
  Navigation, Zap, Activity, Radio, Bell
} from 'lucide-react';

const TrackingDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [isLoading, setIsLoading] = useState(true);
  const [assetLocations, setAssetLocations] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // ADDED: State to hold the map instance safely
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const defaultCenter = [28.6139, 77.2090];

  useEffect(() => {
    // 1. Pass 'true' so the spinner shows on the very first load
    fetchAllData(true); 
    
    if (autoRefresh) {
      // 2. Pass 'false' so background refreshes update data silently without destroying the map
      const interval = setInterval(() => fetchAllData(false), 30000); 
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 3. Add 'isInitialLoad' parameter
  const fetchAllData = async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true); // Only show spinner if it's the first time
    try {
      await Promise.all([
        fetchAssetLocations(),
        fetchGeofences(),
        fetchAnomalies(),
        fetchHighRiskAlerts(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      if (isInitialLoad) setIsLoading(false); // Hide spinner when done
    }
  };

  const fetchAssetLocations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tracking/assets/all-locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssetLocations(response.data);
    } catch (error) {
      console.error('Error fetching asset locations:', error);
      setAssetLocations([]);
    }
  };

  const fetchGeofences = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tracking/geofences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeofences(response.data);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      setGeofences([]);
    }
  };
  
const fetchAnomalies = async () => {
    try {
      // 🚨 POINTING DIRECTLY TO THE PYTHON AI BRAIN 🚨
      const response = await axios.get('http://localhost:8000/alerts');
      // Python returns an object { alerts: [...] }, so we extract the array
      setAnomalies(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching anomalies from AI:', error);
      setAnomalies([]);
    }
  };

  const fetchHighRiskAlerts = async () => {
    try {
      // 🚨 POINTING DIRECTLY TO THE PYTHON AI BRAIN 🚨
      const response = await axios.get('http://localhost:8000/alerts/high-risk');
      // Python returns an object { alerts: [...] }, so we extract the array
      setHighRiskAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching high-risk alerts from AI:', error);
      setHighRiskAlerts([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tracking/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResolveAnomaly = async (anomalyId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/tracking/anomaly/${anomalyId}/resolve`,
        { resolvedBy: user?.username, notes: 'Resolved via dashboard' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Anomaly resolved successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      alert('Failed to resolve anomaly');
    }
  };

  const getMarkerColor = (riskScore, isWithinGeofence) => {
    if (!isWithinGeofence || riskScore >= 60) return 'red';
    if (riskScore >= 30) return 'orange';
    return 'green';
  };

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-black',
      LOW: 'bg-blue-500 text-white',
      INFO: 'bg-gray-500 text-white'
    };
    return colors[severity] || colors.INFO;
  };

  const getRiskBadge = (score) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = highRiskAlerts.filter(alert => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity === filterSeverity;
  });

  return (
    <DashboardLayout role="CAG_AUDITOR">
      <div className="p-4 md:p-6 max-w-full mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} className="text-purple-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Real-Time Tracking</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI-Powered Asset Tracking</h1>
              <p className="text-purple-200 mt-1 text-sm">Geofencing & Anomaly Detection System</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  autoRefresh ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}
              >
                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => fetchAllData(true)}
                className="bg-white text-purple-900 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-purple-600">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tracked Assets</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalTrackedAssets || assetLocations.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-blue-600">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Zones</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeGeofences || geofences.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-orange-600">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Alerts</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingAnomalies || anomalies.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-red-600">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Critical Alerts</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.criticalAnomalies || highRiskAlerts.filter(a => a.severity === 'CRITICAL').length}</h3>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 pb-px">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'live' ? 'bg-white text-purple-900 border-t-2 border-l border-r border-purple-900' : 'text-gray-500 hover:bg-gray-50 border-t-2 border-transparent'
            }`}
          >
            <MapPin size={16} /> Live Map
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'alerts' ? 'bg-white text-purple-900 border-t-2 border-l border-r border-purple-900' : 'text-gray-500 hover:bg-gray-50 border-t-2 border-transparent'
            }`}
          >
            <Bell size={16} /> Anomaly Alerts
            {highRiskAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {highRiskAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'assets' ? 'bg-white text-purple-900 border-t-2 border-l border-r border-purple-900' : 'text-gray-500 hover:bg-gray-50 border-t-2 border-transparent'
            }`}
          >
            <Activity size={16} /> Asset Status
          </button>
        </div>

        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Navigation size={18} className="text-purple-600" /> Live Asset Map
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Real-time GPS tracking with geofence boundaries</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Normal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Warning
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Critical
                  </span>
                </div>
              </div>

              {/* MODIFIED SECTION: Overlay instead of conditionally unmounting */}
              <div className="h-[500px] relative">
                {isLoading && (
                  <div className="absolute inset-0 z-[1000] bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-700 font-bold">Loading map data...</p>
                    </div>
                  </div>
                )}
                
                <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
                  <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={setMap}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {geofences.map((zone) => (
                      <Circle
                        key={zone.id}
                        center={[zone.centerLatitude, zone.centerLongitude]}
                        radius={zone.radiusMeters}
                        pathOptions={{
                          color: zone.zoneColor || '#3B82F6',
                          fillColor: zone.zoneColor || '#3B82F6',
                          fillOpacity: 0.15,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold">{zone.zoneName}</h3>
                            <p className="text-sm text-gray-600">{zone.departmentName}</p>
                            <p className="text-xs text-gray-500">Radius: {zone.radiusMeters}m</p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                    {assetLocations.map((asset) => (
                      <Marker
                        key={asset.assetId}
                        position={[asset.latitude, asset.longitude]}
                        icon={createCustomIcon(
                          asset.riskScore >= 60 ? '#EF4444' :
                          asset.riskScore >= 30 ? '#F97316' : '#22C55E'
                        )}
                        eventHandlers={{
                          click: () => setSelectedAsset(asset)
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-lg">{asset.assetName}</h3>
                            <p className="text-sm text-gray-600 font-mono">{asset.assetIdDisplay}</p>
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs">
                                <span className="font-semibold">Risk Score:</span>{' '}
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskBadge(asset.riskScore)}`}>
                                  {asset.riskScore || 0}/100
                                </span>
                              </p>
                              <p className="text-xs mt-1">
                                <span className="font-semibold">Category:</span> {asset.category}
                              </p>
                              <p className="text-xs mt-1">
                                <span className="font-semibold">Dept:</span> {asset.department}
                              </p>
                              <p className="text-xs mt-1 text-gray-500">
                                Last Update: {formatTimestamp(asset.lastUpdate)}
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  AI Anomaly Alerts
                </h2>
                <p className="text-xs text-gray-600 mt-1">Real-time threat detection (Risk Score &gt;= 50)</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Scanning for anomalies...</p>
                  </div>
                ) : highRiskAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
                    <p className="font-bold text-gray-700">All Clear</p>
                    <p className="text-xs text-gray-500 mt-1">No critical anomalies detected</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {highRiskAlerts.slice(0, 10).map((alert, index) => (
                      <div key={alert.id || index} className="p-4 hover:bg-red-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className="font-mono text-xs text-gray-500">
                                #{alert.assetTrackingId || alert.assetId}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{alert.assetName || `Asset #${alert.assetId}`}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.description}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              <Clock size={10} className="inline mr-1" />
                              {formatTimestamp(alert.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded-lg text-lg font-black ${getRiskBadge(alert.riskScore)}`}>
                              {alert.riskScore}
                            </div>
                            {!alert.isResolved && (
                              <button
                                onClick={() => handleResolveAnomaly(alert.id)}
                                className="mt-2 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {highRiskAlerts.length > 10 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Showing 10 of {highRiskAlerts.length} alerts
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Shield size={18} className="text-purple-600" />
                  Anomaly Alert Feed
                </h2>
                <p className="text-xs text-gray-500 mt-1">AI-generated threat assessments</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <button
                  onClick={() => fetchAllData(true)}
                  className="flex items-center gap-2 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg border border-purple-200 transition-colors"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Severity</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Asset</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Risk Score</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Anomaly Type</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Description</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Location</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Time</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading alerts...</p>
                      </td>
                    </tr>
                  ) : filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center">
                        <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
                        <p className="font-bold text-gray-700">No Alerts</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((alert, index) => (
                      <tr key={alert.id || index} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-gray-800">{alert.assetName || `Asset #${alert.assetId}`}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {alert.assetTrackingId || `#${alert.assetId}`}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`px-3 py-1 rounded-lg text-center font-black ${getRiskBadge(alert.riskScore)}`}>
                            {alert.riskScore}/100
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {alert.anomalyType || 'GEOFENCE_BREACH'}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <p className="text-xs text-gray-600 truncate">{alert.description}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono text-gray-500">
                            {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {formatTimestamp(alert.timestamp)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAsset(assetLocations.find(a => a.assetId === alert.assetId))}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                              title="View on Map"
                            >
                              <Eye size={16} />
                            </button>
                            {!alert.isResolved && (
                              <button
                                onClick={() => handleResolveAnomaly(alert.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200 transition-colors"
                                title="Resolve"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Radio size={18} className="text-green-600" />
                Tracked Asset Registry
              </h2>
              <p className="text-xs text-gray-500 mt-1">All assets with GPS tracking enabled</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Asset</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Category</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Department</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Location</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Risk Score</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Geofence</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Last Update</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading assets...</p>
                      </td>
                    </tr>
                  ) : assetLocations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-bold text-gray-700">No Tracked Assets</p>
                        <p className="text-xs text-gray-500 mt-1">Enable GPS tracking on assets to see them here</p>
                      </td>
                    </tr>
                  ) : (
                    assetLocations.map((asset) => (
                      <tr key={asset.assetId} className="hover:bg-green-50/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-bold text-gray-800">{asset.assetName}</div>
                          <div className="text-xs text-gray-500 font-mono">{asset.assetIdDisplay}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {asset.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {asset.department || 'Unassigned'}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono text-gray-500">
                            {asset.latitude?.toFixed(4)}, {asset.longitude?.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`px-3 py-1 rounded-lg text-center font-black text-sm ${getRiskBadge(asset.riskScore)}`}>
                            {asset.riskScore || 0}/100
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {asset.isWithinGeofence ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                              <CheckCircle size={14} /> Within Zone
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                              <XCircle size={14} /> Outside Zone
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {formatTimestamp(asset.lastUpdate)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setActiveTab('live');
                            }}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-600">AI Detection Engine: Active</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-xs text-gray-500">
                Last sync: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              GALMS Tracking v2.0 | Powered by AI Analytics
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrackingDashboard;