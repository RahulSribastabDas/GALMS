import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { 
  ShoppingCart, Package, Clock, Plus, 
  ExternalLink, FileText, ChevronRight, Search, UserPlus, 
  ClipboardList, ArrowRight, CheckCircle, X, DollarSign, Building 
} from 'lucide-react';

const ProcurementDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [assets, setAssets] = useState([]); // Real Inventory
  const [demands, setDemands] = useState([]); // Employee Requests (The Bridge)
  const [myIndents, setMyIndents] = useState([]); // Indents sent to Priya
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, value: 0 });

  // Modal State for Converting Ticket -> Indent
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [indentForm, setIndentForm] = useState({ vendorName: '', estimatedCost: '' });

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'amit_po' };

  // --- 1. FETCH ALL DATA ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // A. Inventory (Existing)
      const assetRes = await axios.get('http://localhost:8080/api/assets');
      setAssets(assetRes.data);
      const totalValue = assetRes.data.reduce((acc, curr) => acc + (curr.cost || 0), 0);
      setStats({ total: assetRes.data.length, value: totalValue });

      // B. Pending Demands (New Bridge)
      const demandsRes = await axios.get('http://localhost:8080/api/workflow/pending-demands');
      setDemands(demandsRes.data);

      // C. Active Indents (Waiting for Dept Head)
      const indentsRes = await axios.get('http://localhost:8080/api/workflow/pending/DEPT_HEAD');
      setMyIndents(indentsRes.data);

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard", error);
      setLoading(false);
    }
  };

  // --- 2. ACTIONS ---

  // Action A: Assign Asset to User (Existing)
  const handleAssign = async (assetId, assetName) => {
    const username = window.prompt(`Assign '${assetName}' to which Employee ID?`, "rahul");
    if (!username) return;

    try {
      await axios.put(`http://localhost:8080/api/assets/${assetId}/assign/${username}`);
      alert(`✅ Asset successfully issued to ${username}!`);
      fetchDashboardData(); 
    } catch (error) {
      alert("❌ Failed to assign. User ID might not exist.");
    }
  };

  // Action B: Convert Ticket -> Indent (New)
  const openIndentModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if(!selectedTicket) return;

    try {
      await axios.post(`http://localhost:8080/api/workflow/convert-to-indent/${selectedTicket.id}?username=${user.username}`, {
        vendorName: indentForm.vendorName,
        estimatedCost: parseFloat(indentForm.estimatedCost)
      });

      alert("✅ Indent Created & Sent to Dept Head!");
      setShowModal(false);
      setIndentForm({ vendorName: '', estimatedCost: '' });
      fetchDashboardData(); // Refresh all tables
    } catch (err) {
      alert("Error creating indent. Check console.");
    }
  };

  return (
    <DashboardLayout role="PROCUREMENT_OFFICER">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center text-[11px] text-gray-600 mb-6 border-b border-gray-200 pb-2">
         <div className="flex items-center gap-1">
            <span className="hover:underline cursor-pointer">Home</span> <ChevronRight size={10}/> 
            <span className="font-bold text-[#0b1e3c]">Procurement Officer Dashboard</span>
         </div>
         <div className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            FY: 2025-2026
         </div>
      </div>

      {/* --- QUICK STATS RIBBON --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         {/* Card 1: New Indent */}
         <div className="bg-gradient-to-r from-[#0b1e3c] to-[#162e52] text-white p-5 rounded-sm shadow-md flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
               <h2 className="text-lg font-bold">New Indent</h2>
               <p className="text-xs text-blue-200 mb-3">Form GFR-101</p>
               <button onClick={() => navigate('/procurement/add')} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded shadow flex items-center gap-2">
                  <Plus size={14}/> Manual Indent
               </button>
            </div>
            <ShoppingCart size={48} className="text-white/10 absolute right-[-10px] bottom-[-10px]"/>
         </div>

         {/* Card 2: Inventory Value */}
         <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-sm flex flex-col justify-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Total Inventory Value</h3>
            <div className="flex items-end gap-2">
               <span className="text-3xl font-bold text-green-700">₹ {stats.value.toLocaleString()}</span>
            </div>
            <div className="mt-3 text-[10px] text-gray-500">Items in Stock: <span className="font-bold text-black">{stats.total}</span></div>
         </div>

         {/* Card 3: GeM Link */}
         <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-sm relative">
            <div className="absolute top-2 right-2"><span className="text-[10px] font-bold text-gray-400">External</span></div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Direct Purchase</h3>
            <p className="text-xs text-gray-600 leading-tight mb-3">GeM Procurement up to ₹ 25,000.</p>
            <button className="text-[10px] font-bold text-white bg-green-600 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-green-700">
               Visit GeM Portal <ExternalLink size={10}/>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* --- SECTION 1: PENDING DEMANDS (THE BRIDGE) --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
           <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
               <h2 className="font-bold text-orange-800 flex items-center gap-2">
                  <ClipboardList size={18}/> Employee Requisitions
               </h2>
               <span className="bg-orange-200 text-orange-900 text-xs px-2 py-1 rounded font-bold">{demands.length} Pending</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-bold text-xs uppercase">
                   <tr>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {demands.length === 0 ? <tr><td colSpan="2" className="p-4 text-center text-gray-400 text-xs">No pending requests.</td></tr> : demands.map(ticket => (
                     <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                            <p className="font-bold text-[#0b1e3c] text-xs">REQ-{ticket.id}: {ticket.description}</p>
                            <p className="text-[10px] text-gray-500">
                               By: <span className="font-bold">{ticket.employee ? ticket.employee.username : 'Unknown'}</span>
                            </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                           <button onClick={() => openIndentModal(ticket)} className="bg-[#0b1e3c] hover:bg-blue-900 text-white px-3 py-1.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                              Create Indent <ArrowRight size={10}/>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* --- SECTION 2: MY ACTIVE INDENTS --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
           <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-[#0b1e3c] flex items-center gap-2">
               <ShoppingCart size={18}/> Indents in Pipeline
           </div>
           <div className="p-4 space-y-3 h-64 overflow-y-auto">
               {myIndents.length === 0 ? <p className="text-gray-400 text-xs italic text-center mt-10">No active indents.</p> : myIndents.map(indent => (
                  <div key={indent.id} className="border border-gray-200 p-3 rounded hover:shadow-sm flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-sm text-gray-800">{indent.itemName}</h3>
                          <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Building size={10}/> {indent.vendorName}</span>
                              <span className="flex items-center gap-1"><DollarSign size={10}/> {indent.estimatedCost}</span>
                          </div>
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                         Pending Approval
                      </span>
                  </div>
               ))}
           </div>
        </div>
      </div>

      {/* --- SECTION 3: STOCK REGISTER (INVENTORY) --- */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-6">
         <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h3 className="font-bold text-[#0b1e3c] flex items-center gap-2"><Package size={18}/> Central Stock Register</h3>
             <div className="relative">
                 <Search className="absolute left-2 top-2 text-gray-400" size={14}/>
                 <input type="text" placeholder="Search Assets..." className="pl-8 pr-2 py-1 text-xs border border-gray-300 rounded outline-none"/>
             </div>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-xs text-left">
                 <thead className="bg-[#0b1e3c] text-white uppercase">
                     <tr>
                         <th className="px-4 py-3">Asset ID</th>
                         <th className="px-4 py-3">Description</th>
                         <th className="px-4 py-3">Status</th>
                         <th className="px-4 py-3">Current Holder</th>
                         <th className="px-4 py-3 text-center">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                     {assets.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-gray-400">Stock Register Empty.</td></tr> : assets.map((item) => (
                         <tr key={item.id} className="hover:bg-blue-50">
                             <td className="px-4 py-3 font-mono font-bold text-blue-800">{item.assetId}</td>
                             <td className="px-4 py-3 font-medium text-gray-700">
                                 {item.assetName}
                                 <div className="text-[10px] text-gray-400 font-normal">₹ {item.cost} | {item.supplier}</div>
                             </td>
                             <td className="px-4 py-3">
                                 <span className={`px-2 py-1 rounded font-bold border ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                     {item.status}
                                 </span>
                             </td>
                             <td className="px-4 py-3 text-gray-600 font-bold">
                                 {item.assignedTo ? <span className="flex items-center gap-1 text-[#0b1e3c]"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {item.assignedTo.username}</span> : <span className="text-gray-400 italic font-normal">In Store</span>}
                             </td>
                             <td className="px-4 py-3 text-center">
                                 {item.status === 'AVAILABLE' && (
                                     <button onClick={() => handleAssign(item.id, item.assetName)} className="bg-[#0b1e3c] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-900 flex items-center gap-1 mx-auto shadow-sm">
                                         <UserPlus size={12}/> Issue
                                     </button>
                                 )}
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>

      {/* --- MODAL: CREATE INDENT --- */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="bg-[#0b1e3c] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                 <div>
                    <h3 className="font-bold">Create Indent</h3>
                    <p className="text-xs text-blue-200">For Request: REQ-{selectedTicket.id}</p>
                 </div>
                 <button onClick={() => setShowModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleConvertSubmit} className="p-6 space-y-4">
                 <div className="bg-gray-50 p-3 rounded text-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Item Requested</p>
                    <p className="font-bold text-[#0b1e3c] text-lg">{selectedTicket.description}</p>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vendor</label>
                    <input type="text" className="w-full border p-2 rounded text-sm" placeholder="e.g. Dell India" value={indentForm.vendorName} onChange={e => setIndentForm({...indentForm, vendorName: e.target.value})} required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estimated Cost</label>
                    <input type="number" className="w-full border p-2 rounded text-sm" placeholder="e.g. 50000" value={indentForm.estimatedCost} onChange={e => setIndentForm({...indentForm, estimatedCost: e.target.value})} required />
                 </div>
                 <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-sm mt-2 flex justify-center items-center gap-2">
                    <CheckCircle size={18}/> Send for Approval
                 </button>
              </form>
           </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ProcurementDashboard;