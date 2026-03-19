import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { 
  PackagePlus, ShoppingCart, Tag, Truck, CheckCircle, 
  Search, Plus, Building2, IndianRupee, Clock, AlertCircle, ChevronRight, FileText
} from 'lucide-react';

const PODashboard = () => {
  // --- STATE ---
  const [assets, setAssets] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // NEW ASSET FORM STATE
 // NEW ASSET FORM STATE
  const [newAsset, setNewAsset] = useState({
    linkedReqId: null, // <-- ADD THIS LINE
    assetId: '',
    assetName: '',
    category: 'Hardware',
    cost: '',
    supplier: '',
    department: user?.department || 'SOFTWARE FORCE'
  });

  // --- 1. FETCH ASSETS & REQUISITIONS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recently procured assets
        const assetRes = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(assetRes.data);

        // Fetch pending employee requisitions
        const reqRes = await axios.get('http://localhost:8080/api/requests/pending-requisitions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequisitions(reqRes.data);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PO data:", error);
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // --- 2. SUBMIT NEW ASSET TO BACKEND ---
// --- 2. SUBMIT NEW ASSET TO BACKEND ---
  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      // 1. Save the new asset to the database
      const response = await axios.post('http://localhost:8080/api/assets/add', {
        ...newAsset,
        cost: parseFloat(newAsset.cost),
        status: 'AVAILABLE', 
        assignmentPending: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. IF this asset was bought to fulfill a ticket, CLOSE THE TICKET!
      if (newAsset.linkedReqId) {
          await axios.put(`http://localhost:8080/api/requests/${newAsset.linkedReqId}/status?status=CLOSED`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Remove the ticket from the Inbox screen immediately
          setRequisitions(requisitions.filter(req => req.id !== newAsset.linkedReqId));
      }

      // Add the new asset to the table instantly
      setAssets([response.data, ...assets]);
      setShowAddModal(false);
      
      // Reset form
      setNewAsset({
        linkedReqId: null, assetId: '', assetName: '', category: 'Hardware', cost: '', supplier: '', department: user?.department || 'SOFTWARE FORCE'
      });
      
      alert("✅ Asset successfully procured and ticket closed!");
    } catch (error) {
      console.error("Error adding asset:", error);
      alert("Failed to process. Make sure the Asset ID is unique and backend is running!");
    }
  };

  // --- 3. HANDLE FULFILL REQUISITION ---
  // --- 3. HANDLE FULFILL REQUISITION ---
  const handleFulfill = (req) => {
      setNewAsset({
          linkedReqId: req.id, // <-- ADD THIS LINE to remember the ticket ID
          assetId: `GOV-${new Date().getFullYear()}-`, 
          assetName: `Fulfilling: ${req.description.substring(0, 20)}...`, 
          category: 'Hardware',
          cost: '',
          supplier: '',
          department: req.employee?.department?.name || 'SOFTWARE FORCE'
      });
      setShowAddModal(true);
  };
  return (
    <DashboardLayout role="PROCUREMENT_OFFICER">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* --- PO HEADER --- */}
        <div className="bg-gradient-to-r from-[#0b1e3c] to-[#1b3a6b] rounded-xl shadow-lg p-6 text-white border-l-4 border-orange-500 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
           <div className="absolute -right-10 -top-10 text-white/5">
              <ShoppingCart size={150} />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                 <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Procurement Portal
                 </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Central Purchasing Authority</h1>
              <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                 Official Logged In: <span className="font-bold text-white">{user?.username || 'Procurement Officer'}</span>
              </p>
           </div>
           
           <div className="relative z-10 mt-4 md:mt-0 flex gap-4">
              <button 
                 onClick={() => {
                     // Clear form when opening manually
                     setNewAsset({assetId: '', assetName: '', category: 'Hardware', cost: '', supplier: '', department: user?.department || 'SOFTWARE FORCE'});
                     setShowAddModal(true);
                 }}
                 className="bg-white text-[#0b1e3c] hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all"
              >
                 <PackagePlus size={18}/> Direct Purchase
              </button>
           </div>
        </div>

        {/* --- QUICK STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-orange-500">
              <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                 <FileText size={24}/>
              </div>
              <div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Requisitions</p>
                 <h3 className="text-2xl font-bold text-gray-800">{requisitions.length}</h3>
              </div>
           </div>
           
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-blue-600">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                 <CheckCircle size={24}/>
              </div>
              <div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Orders Fulfilled (MTD)</p>
                 <h3 className="text-2xl font-bold text-gray-800">{assets.length}</h3>
              </div>
           </div>

           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 border-t-4 border-t-green-500">
              <div className="bg-green-50 p-3 rounded-full text-green-600">
                 <IndianRupee size={24}/>
              </div>
              <div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Value Procured</p>
                 <h3 className="text-2xl font-bold text-gray-800">
                    ₹ {assets.reduce((sum, asset) => sum + (asset.cost || 0), 0).toLocaleString()}
                 </h3>
              </div>
           </div>
        </div>

        {/* --- THE 2-COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: REQUISITION INBOX */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
               <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-[#0b1e3c] flex items-center gap-2">
                     <Clock size={18} className="text-orange-500"/> Action Required
                  </h2>
                  <p className="text-xs text-gray-500">New Requisitions</p>
               </div>

               <div className="overflow-y-auto flex-grow">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-[#0b1e3c] text-white sticky top-0">
                        <tr>
                           <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Details</th>
                           <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                           <tr><td colSpan="2" className="p-6 text-center text-gray-500 font-medium">Loading inbox...</td></tr>
                        ) : requisitions.length === 0 ? (
                           <tr>
                              <td colSpan="2" className="p-10 text-center text-gray-500">
                                 <AlertCircle size={32} className="mx-auto text-gray-300 mb-2"/>
                                 <p className="font-medium text-gray-600">Inbox Clear</p>
                              </td>
                           </tr>
                        ) : (
                           requisitions.map((req) => (
                              <tr key={req.id} className="hover:bg-blue-50/50 transition-colors">
                                 <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono font-bold text-xs text-[#1b3a6b]">REQ-{req.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${req.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                           {req.priority}
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-800 text-sm mb-1">{req.employee?.username}</div>
                                    <p className="text-xs text-gray-600 truncate max-w-[200px] italic" title={req.description}>"{req.description}"</p>
                                 </td>
                                 <td className="px-4 py-4 text-right align-middle">
                                    <button 
                                       onClick={() => handleFulfill(req)}
                                       className="bg-[#1b3a6b] hover:bg-blue-900 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto"
                                    >
                                       Process <ChevronRight size={14}/>
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* COLUMN 2: RECENTLY PROCURED ASSETS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
               <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-[#0b1e3c] flex items-center gap-2">
                     <Tag size={18} className="text-teal-600"/> Master Inventory
                  </h2>
                  <p className="text-xs text-gray-500">Recently procured assets</p>
               </div>

               <div className="overflow-y-auto flex-grow">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-[#0f766e] text-white sticky top-0">
                        <tr>
                           <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Asset Info</th>
                           <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Value</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                           <tr><td colSpan="2" className="p-6 text-center text-gray-500 font-medium">Loading assets...</td></tr>
                        ) : assets.length === 0 ? (
                           <tr><td colSpan="2" className="p-10 text-center text-gray-500">No assets procured yet.</td></tr>
                        ) : (
                           assets.slice(0, 10).map((asset) => ( // Only show top 10 recent
                              <tr key={asset.id} className="hover:bg-teal-50/30 transition-colors">
                                 <td className="px-4 py-3">
                                    <div className="font-bold text-gray-800">{asset.assetName}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{asset.assetId} • {asset.category}</div>
                                 </td>
                                 <td className="px-4 py-3 text-right">
                                    <div className="font-bold text-[#0f766e]">₹ {asset.cost?.toLocaleString()}</div>
                                    <div className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded inline-block mt-1 uppercase">
                                        {asset.status || 'AVAILABLE'}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        {/* --- MODAL: PROCURE NEW ASSET --- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#0f766e] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><PackagePlus size={18}/> Register New Asset</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/70 hover:text-white font-bold text-xl">✕</button>
              </div>
              
              <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Asset Code / ID</label>
                    <input 
                      type="text" required value={newAsset.assetId} 
                      onChange={(e) => setNewAsset({...newAsset, assetId: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500" 
                      placeholder="e.g. GOV-2026-001" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Category</label>
                    <select 
                      value={newAsset.category} 
                      onChange={(e) => setNewAsset({...newAsset, category: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500"
                    >
                      <option value="Hardware">Hardware (Laptops, PCs)</option>
                      <option value="Vehicle">Vehicle (Cars, Trucks)</option>
                      <option value="Furniture">Furniture (Desks, Chairs)</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Asset Name & Model</label>
                  <input 
                    type="text" required value={newAsset.assetName} 
                    onChange={(e) => setNewAsset({...newAsset, assetName: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500" 
                    placeholder="e.g. Dell Latitude 5420" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase flex items-center gap-1"><IndianRupee size={12}/> Purchase Cost</label>
                    <input 
                      type="number" required value={newAsset.cost} 
                      onChange={(e) => setNewAsset({...newAsset, cost: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500" 
                      placeholder="85000" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Supplier / Vendor</label>
                    <input 
                      type="text" required value={newAsset.supplier} 
                      onChange={(e) => setNewAsset({...newAsset, supplier: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500" 
                      placeholder="e.g. Dell India Pvt Ltd" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase flex items-center gap-1"><Building2 size={12}/> Allocated Department</label>
                  <input 
                    type="text" required value={newAsset.department} 
                    onChange={(e) => setNewAsset({...newAsset, department: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-teal-500 bg-gray-50" 
                  />
                </div>

                <button type="submit" className="w-full bg-[#0f766e] hover:bg-teal-800 text-white font-bold py-3 rounded-lg shadow-md mt-6 transition-colors flex justify-center items-center gap-2">
                  <CheckCircle size={18}/> Finalize Procurement
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PODashboard;