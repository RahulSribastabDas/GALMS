import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout'; 
import { 
  Building2, Users, MonitorSmartphone, CheckCircle, 
  Send, UserPlus, AlertCircle 
} from 'lucide-react';

const DeptDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [targetUsername, setTargetUsername] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userDept = user?.department || 'SOFTWARE FORCE'; // Fallback for testing

  // --- 1. FETCH DEPARTMENT ASSETS ---
  useEffect(() => {
    const fetchDeptAssets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter: Only show assets for THIS department that are sitting in the warehouse (AVAILABLE)
        const myDeptAssets = response.data.filter(
            asset => asset.department === userDept && asset.status === 'AVAILABLE'
        );
        
        setAssets(myDeptAssets);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching department assets:", error);
        setIsLoading(false);
      }
    };

    if (token) fetchDeptAssets();
  }, [token, userDept]);

  // --- 2. ASSIGN ASSET TO EMPLOYEE ---
  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !targetUsername) return;

    try {
      // Calls the exact PUT mapping you wrote in AssetController.java
      await axios.put(`http://localhost:8080/api/assets/${selectedAsset.id}/assign/${targetUsername}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Asset successfully allocated to ${targetUsername}. Waiting for their acceptance.`);
      
      // Remove the assigned asset from the "Available" list
      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      
      // Close and reset modal
      setShowAssignModal(false);
      setSelectedAsset(null);
      setTargetUsername('');
      
    } catch (error) {
      console.error("Error assigning asset:", error);
      alert(error.response?.data || "Failed to assign asset. Please check if the username is correct.");
    }
  };

  const openModal = (asset) => {
      setSelectedAsset(asset);
      setShowAssignModal(true);
  };

  return (
    <DashboardLayout role="DEPT_HEAD">
      <div className="p-2">
        
        {/* --- DEPT HEAD HEADER --- */}
        <div className="bg-[#1e3a8a] p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <Building2 size={20} className="text-blue-200" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Department Administration</span>
               </div>
               <h1 className="text-3xl font-bold tracking-tight">{userDept} Allocations</h1>
               <p className="text-blue-100 mt-1 text-sm italic">Logged in as: Joint Secretary {user?.username}</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-white/10 border border-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{assets.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-blue-200">Unassigned Assets</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- AVAILABLE INVENTORY TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div>
               <h3 className="font-bold text-gray-800 flex items-center gap-2"><MonitorSmartphone size={18}/> Available Department Stock</h3>
               <p className="text-xs text-gray-500">Assets ready to be issued to employees</p>
             </div>
          </div>

          <table className="w-full text-sm text-left">
             <thead className="bg-gray-100 text-gray-600">
               <tr>
                 <th className="px-6 py-4 font-semibold">Asset ID</th>
                 <th className="px-6 py-4 font-semibold">Name & Model</th>
                 <th className="px-6 py-4 font-semibold">Category</th>
                 <th className="px-6 py-4 font-semibold">Purchase Value</th>
                 <th className="px-6 py-4 text-right font-semibold">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {isLoading ? (
                   <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">Loading inventory...</td></tr>
               ) : assets.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium flex flex-col items-center justify-center">
                     <AlertCircle size={32} className="text-gray-300 mb-2"/>
                     No unassigned assets currently in the {userDept} warehouse.
                   </td>
                 </tr>
               ) : (
                 assets.map((asset) => (
                   <tr key={asset.id} className="hover:bg-blue-50/50 transition-colors">
                     <td className="px-6 py-4 font-mono font-bold text-blue-800">{asset.assetId || `AST-${asset.id}`}</td>
                     <td className="px-6 py-4 font-bold text-gray-800">{asset.assetName}</td>
                     <td className="px-6 py-4 text-gray-500">{asset.category}</td>
                     <td className="px-6 py-4 font-mono text-gray-800">₹ {asset.cost?.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => openModal(asset)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-2 ml-auto"
                        >
                            <UserPlus size={14}/> Allocate to Staff
                        </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>

        {/* --- MODAL: ASSIGN ASSET --- */}
        {showAssignModal && selectedAsset && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#1e3a8a] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Send size={18}/> Initiate Handover</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-white/70 hover:text-white font-bold text-xl">✕</button>
              </div>
              
              <form onSubmit={handleAssignAsset} className="p-6 space-y-5">
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Selected Asset</p>
                    <p className="text-lg font-bold text-blue-900">{selectedAsset.assetName}</p>
                    <p className="text-xs font-mono text-blue-700 mt-1">ID: {selectedAsset.assetId}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Target Employee Username</label>
                  <div className="relative">
                      <Users size={16} className="absolute left-3 top-3 text-gray-400"/>
                      <input 
                        type="text" required 
                        value={targetUsername} 
                        onChange={(e) => setTargetUsername(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                        placeholder="e.g. rahul" 
                      />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                      The asset will be marked as "Assignment Pending" until the employee logs in and accepts custody.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowAssignModal(false)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="w-2/3 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2">
                        <CheckCircle size={16}/> Confirm Allocation
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DeptDashboard;