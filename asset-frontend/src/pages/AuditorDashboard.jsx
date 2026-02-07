import React, { useState } from 'react';

const AuditorDashboard = () => {
  // MOCK DATA: Anomalies fetched from Spring Boot
  // API Endpoint: /api/anomalies/pending
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

  // Filter only OPEN issues for the main alert
  const openIssues = anomalies.filter(a => a.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* --- HEADER --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border-l-4 border-purple-600 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit & Oversight Console</h1>
          <p className="text-gray-500">Welcome, CAG Auditor | Role: INDEPENDENT_OBSERVER</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Pending Flags</div>
          <div className={`text-3xl font-bold ${openIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {openIssues}
          </div>
        </div>
      </div>

      {/* --- ANOMALY TABLE --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Detected Anomalies Log</h2>
          <button className="text-sm text-purple-600 font-semibold hover:underline">Download Audit Report</button>
        </div>

        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
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
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.id}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{item.type.replace('_', ' ')}</td>
                
                {/* Severity Badge */}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                      item.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.severity}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.detectedAt}</td>
                
                {/* Status Badge */}
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${item.status === 'OPEN' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-semibold">
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditorDashboard;