import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout'; 
import { 
  Building2, Users, MonitorSmartphone, CheckCircle, 
  Send, UserPlus, AlertCircle, Wrench, CheckCircle2, XCircle
} from 'lucide-react';

const DeptDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [targetUsername, setTargetUsername] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userDept = user?.department || 'SOFTWARE FORCE'; 

  // --- 1. FETCH DATA (ASSETS & TICKETS) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Assets
        const assetRes = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myDeptAssets = assetRes.data.filter(
            asset => asset.department === userDept && asset.status === 'AVAILABLE'
        );
        setAssets(myDeptAssets);

        // Fetch Pending Tickets (Assuming this endpoint exists in your controller!)
        const ticketRes = await axios.get('http://localhost:8080/api/requests/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter out Requisitions (those go to the PO). Keep Maintenance & Returns.
       // Temporarily removed the strict department check so Priya can see all maintenance tickets
const myDeptTickets = ticketRes.data.filter(
    t => t.type !== 'REQUISITION'
);
        setTickets(myDeptTickets);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token, userDept]);

  // --- 2. ASSIGN ASSET TO EMPLOYEE ---
  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !targetUsername) return;

    try {
      await axios.put(`http://localhost:8080/api/assets/${selectedAsset.id}/assign/${targetUsername}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Asset successfully allocated to ${targetUsername}.`);
      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      setShowAssignModal(false);
      setSelectedAsset(null);
      setTargetUsername('');
      
    } catch (error) {
      console.error("Error assigning asset:", error);
      alert(error.response?.data || "Failed to assign asset. Please check if the username is correct.");
    }
  };

  // --- 3. HANDLE TICKET ACTION (Approve/Reject) ---
  const handleTicketAction = async (ticketId, newStatus) => {
      try {
          await axios.put(`http://localhost:8080/api/requests/${ticketId}/status?status=${newStatus}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Remove it from the inbox
          setTickets(tickets.filter(t => t.id !== ticketId));
          alert(`Ticket successfully marked as ${newStatus}.`);
      } catch (error) {
          console.error("Error updating ticket:", error);
          alert("Failed to update ticket. Check if backend endpoint exists.");
      }
  };

  const openModal = (asset) => {
      setSelectedAsset(asset);
      setShowAssignModal(true);
  };

  return (
    <DashboardLayout role="DEPT_HEAD">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* --- DEPT HEAD HEADER --- */}
        <div className="bg-[#1e3a8a] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <Building2 size={20} className="text-blue-200" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Department Administration</span>
               </div>
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{userDept} Overview</h1>
               <p className="text-blue-100 mt-1 text-sm italic">Logged in as: Joint Secretary {user?.username}</p>
            </div>
            <div className="hidden md:flex gap-4">
                <div className="bg-white/10 border border-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold">{assets.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-blue-200">Unassigned Assets</p>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/40 p-3 rounded-lg text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold text-orange-200">{tickets.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-orange-200">Pending Tickets</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- TWO COLUMN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT COLUMN: AVAILABLE INVENTORY */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div>
                   <h3 className="font-bold text-gray-800 flex items-center gap-2"><MonitorSmartphone size={18}/> Available Stock</h3>
                   <p className="text-xs text-gray-500">Assets ready to issue</p>
                 </div>
              </div>

              <div className="overflow-y-auto flex-grow">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs">Asset details</th>
                        <th className="px-4 py-3 text-right font-semibold text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                          <tr><td colSpan="2" className="p-6 text-center text-gray-500 font-medium">Loading inventory...</td></tr>
                      ) : assets.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="p-10 text-center text-gray-500 font-medium">
                            <AlertCircle size={32} className="mx-auto text-gray-300 mb-2"/>
                            No unassigned assets currently in warehouse.
                          </td>
                        </tr>
                      ) : (
                        assets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-4">
                               <div className="font-bold text-gray-800">{asset.assetName}</div>
                               <div className="text-[10px] font-mono text-blue-800 mt-0.5">{asset.assetId} • {asset.category}</div>
                            </td>
                            <td className="px-4 py-4 text-right align-middle">
                               <button 
                                   onClick={() => openModal(asset)}
                                   className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto"
                               >
                                   <UserPlus size={14}/> Assign
                               </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
              </div>
            </div>

            {/* RIGHT COLUMN: STAFF SERVICE REQUESTS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <div>
                   <h3 className="font-bold text-gray-800 flex items-center gap-2"><Wrench size={18} className="text-orange-500"/> Staff Service Requests</h3>
                   <p className="text-xs text-gray-500">Maintenance & Returns</p>
                 </div>
              </div>

              <div className="overflow-y-auto flex-grow">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs">Ticket Info</th>
                        <th className="px-4 py-3 text-right font-semibold text-xs">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                          <tr><td colSpan="2" className="p-6 text-center text-gray-500 font-medium">Loading tickets...</td></tr>
                      ) : tickets.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="p-10 text-center text-gray-500 font-medium">
                            <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2"/>
                            No pending service requests.
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-2 mb-1">
                                   <span className="font-bold text-gray-800 text-sm">{ticket.employee?.username}</span>
                                   <span className="bg-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{ticket.type}</span>
                               </div>
                               <p className="text-xs text-gray-600 truncate max-w-[200px] italic">"{ticket.description}"</p>
                            </td>
                            <td className="px-4 py-4 text-right align-middle">
                               <div className="flex justify-end gap-2">
                                   <button 
                                      onClick={() => handleTicketAction(ticket.id, 'APPROVED')}
                                      className="text-green-600 hover:bg-green-50 p-1.5 rounded border border-green-200 transition-colors" title="Approve & Close"
                                   >
                                      <CheckCircle2 size={16}/>
                                   </button>
                                   <button 
                                      onClick={() => handleTicketAction(ticket.id, 'REJECTED')}
                                      className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-red-200 transition-colors" title="Reject"
                                   >
                                      <XCircle size={16}/>
                                   </button>
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