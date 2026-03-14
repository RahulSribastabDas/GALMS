import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout'; // Import your layout

const AuditorDashboard = () => {
  // --- NEW: GRAB REAL USER DATA ---
  const user = JSON.parse(localStorage.getItem('user'));

  const [anomalies, setAnomalies] = useState([
    {
      id: 'ANM-901',
      assetId: 'AST-2024-001',
      type: 'GEOSPATIAL_BREACH',
      severity: 'CRITICAL',
      location: 'Outside Delhi HQ (25km away)',
      detectedAt: '2024-03-15 10:30 AM',
      status: 'OPEN'
    },
    {
      id: 'ANM-902',
      assetId: 'AST-2023-889',
      type: 'INTEGRITY_MISMATCH',
      severity: 'HIGH',
      location: 'Inventory DB',
      detectedAt: '2024-03-14 02:15 PM',
      status: 'OPEN'
    },
    {
      id: 'ANM-905',
      assetId: 'AST-2024-112',
      type: 'PREDICTIVE_FAILURE',
      severity: 'MEDIUM',
      location: 'Server Room B',
      detectedAt: '2024-03-10 09:00 AM',
      status: 'RESOLVED'
    }
  ]);

  const openIssues = anomalies.filter(a => a.status === 'OPEN').length;

  return (
    // Wrap the entire component in DashboardLayout
    <DashboardLayout role="CAG_AUDITOR">
      <div className="p-2">
        {/* --- HEADER --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border-l-4 border-purple-600 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Audit & Oversight Console</h1>
            {/* DYNAMIC WELCOME MESSAGE */}
            <p className="text-gray-500 font-medium">
                Welcome, {user?.username || 'Observer'} | Role: CAG_AUDITOR
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pending Flags</div>
            <div className={`text-3xl font-bold ${openIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {openIssues}
            </div>
          </div>
        </div>

        {/* --- ANOMALY TABLE --- */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Detected Anomalies Log</h2>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm">
                Download Audit Report
            </button>
          </div>

          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-3">Anomaly ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Detected At</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {anomalies.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{item.type.replace('_', ' ')}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase
                      ${item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                        item.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.severity}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.location}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-bold">{item.detectedAt}</td>
                  
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black 
                      ${item.status === 'OPEN' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button className="text-purple-600 hover:text-purple-900 text-xs font-black uppercase tracking-tighter hover:underline">
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditorDashboard;