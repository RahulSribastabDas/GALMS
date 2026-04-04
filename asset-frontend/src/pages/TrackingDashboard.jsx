import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout';
import { MapPin, Bell, Activity, RefreshCw } from 'lucide-react';

const TrackingDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState(null);

  const defaultCenter = [28.6139, 77.2090];

  return (
    <DashboardLayout role="CAG_AUDITOR">
      <div className="p-4 md:p-6 max-w-full mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl text-white">
          <h1 className="text-2xl font-bold">AI-Powered Asset Tracking</h1>
        </div>

        <div className="flex gap-2 border-b border-gray-200 pb-px">
          <button onClick={() => setActiveTab('live')} className="px-6 py-3 font-bold text-sm bg-white text-purple-900 border-t-2 border-purple-900">
            <MapPin size={16} className="inline mr-2"/> Live Map
          </button>
        </div>

        {activeTab === 'live' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-[500px] relative">
              <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} ref={setMap}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Markers and Geofences will be plotted next */}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackingDashboard;