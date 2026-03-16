import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout'; 
import { 
  FileSearch, AlertTriangle, CheckCircle, ShieldAlert, 
  Globe, Download, Search 
} from 'lucide-react';

const CAGDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // --- FETCH ALL GLOBAL ASSETS ---
  useEffect(() => {
    const fetchGlobalAssets = async () => {
      try {
        // Updated to match your @GetMapping in AssetController
        const response = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching global assets:", error);
        // Updated mock data to perfectly match your Asset.java fields
        setAssets([
          { id: 1, assetId: 'GOV-2026-001', category: 'Hardware', assetName: 'Dell XPS 15', department: 'Ministry of Health', cost: 85000, status: 'PENDING_AUDIT' },
          { id: 2, assetId: 'GOV-2026-002', category: 'Vehicle', assetName: 'Mahindra Bolero', department: 'Ministry of Defence', cost: 950000, status: 'AVAILABLE' },
          { id: 3, assetId: 'GOV-2026-003', category: 'Furniture', assetName: 'Conference Table', department: 'SOFTWARE FORCE', cost: 45000, status: 'MISSING' }
        ]);
        setIsLoading(false);
      }
    };

    if (token) fetchGlobalAssets();
  }, [token]);

  return (
    <DashboardLayout role="CAG_AUDITOR">
      <div className="p-2">
        
        {/* --- AUDITOR HEADER --- */}
        <div className="bg-[#1f2937] p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden border-l-4 border-red-500">
          <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={20} className="text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">National Audit Oversight</span>
               </div>
               <h1 className="text-3xl font-bold tracking-tight">CAG Verification Portal</h1>
               <p className="text-gray-400 mt-1 text-sm italic">Logged in as: {user?.username || 'Senior Auditor'}</p>
            </div>
            <div className="flex gap-3">
               <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all">
                  <Download size={18}/> Export CAG Report
               </button>
            </div>
          </div>
        </div>

        {/* --- AUDIT STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-1 h-full bg-blue-500"></div>
             <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileSearch size={20}/></div>
             </div>
             <div>
                <h3 className="text-2xl font-bold text-gray-800">{assets.length}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Registered Assets</p>
             </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-1 h-full bg-green-500"></div>
             <div className="flex justify-between items-start">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
             </div>
             <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ASSIGNED' || a.status === 'IN_USE').length}
                </h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Verified & Compliant</p>
             </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden bg-red-50/30">
             <div className="absolute right-0 top-0 w-1 h-full bg-red-500"></div>
             <div className="flex justify-between items-start">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg"><AlertTriangle size={20}/></div>
             </div>
             <div>
                <h3 className="text-2xl font-bold text-red-700">
                  {assets.filter(a => a.status === 'MISSING' || a.status === 'PENDING_AUDIT').length}
                </h3>
                <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Flagged / Pending</p>
             </div>
          </div>
        </div>

        {/* --- GLOBAL ASSET REGISTRY TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div>
               <h3 className="font-bold text-gray-800 flex items-center gap-2"><Globe size={18}/> Master Asset Ledger</h3>
               <p className="text-xs text-gray-500">Verify cross-departmental physical assets</p>
             </div>
             <div className="relative">
               <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
               <input type="text" placeholder="Search Asset ID or Dept..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-red-500"/>
             </div>
          </div>

          <table className="w-full text-sm text-left">
             <thead className="bg-gray-100 text-gray-600">
               <tr>
                 <th className="px-6 py-4 font-semibold">Asset ID & Name</th>
                 <th className="px-6 py-4 font-semibold">Category</th>
                 <th className="px-6 py-4 font-semibold">Assigned Department</th>
                 <th className="px-6 py-4 font-semibold">Purchase Cost</th>
                 <th className="px-6 py-4 font-semibold">Audit Status</th>
                 <th className="px-6 py-4 text-right font-semibold">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {assets.map((asset) => (
                 <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                          {asset.assetName}
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {asset.assetId || `AST-${asset.id}`}</p>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-gray-500">{asset.category}</td>
                   <td className="px-6 py-4 font-medium text-[#0b1e3c]">{asset.department}</td>
                   <td className="px-6 py-4 font-mono text-gray-600">₹ {asset.cost?.toLocaleString() || '0'}</td>
                   
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider
                        ${(asset.status === 'AVAILABLE' || asset.status === 'ASSIGNED') ? 'bg-green-50 text-green-700 border-green-200' : 
                          asset.status === 'MISSING' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                      >
                          {asset.status?.replace('_', ' ')}
                      </span>
                   </td>
                   
                   <td className="px-6 py-4 text-right flex justify-end gap-2">
                     <button className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded transition-colors">
                       Verify
                     </button>
                     <button className="text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition-colors">
                       Flag Issue
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

export default CAGDashboard;