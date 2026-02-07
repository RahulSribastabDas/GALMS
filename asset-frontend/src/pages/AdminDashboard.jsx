import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { 
  FileCheck, Users, Printer, Download, ChevronRight, 
  AlertTriangle, FileText, Search, CheckCircle, XCircle, Clock 
} from 'lucide-react';

const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. FETCH REAL DATA ON LOAD ---
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      // Fetch only PENDING requests assigned to DEPT_HEAD
      const response = await axios.get('http://localhost:8080/api/workflow/pending/DEPT_HEAD');
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Secure Connection Failed. Ensure Backend is running.");
      setLoading(false);
    }
  };

  // --- 2. HANDLE APPROVE ACTION ---
  const handleApprove = async (id) => {
    if(!window.confirm("Confirm Sanction? This will authorize the expenditure and create the Asset.")) return;

    try {
      // Send 'adminName' for Audit Trail
      await axios.put(`http://localhost:8080/api/workflow/approve/${id}?adminName=priya_head`);
      alert("✅ Sanction Order Issued Successfully.");
      fetchPendingRequests(); // Refresh list
    } catch (err) {
      alert("❌ Error issuing sanction.");
    }
  };

  // --- 3. HANDLE REJECT ACTION ---
  const handleReject = async (id) => {
    const reason = window.prompt("Please enter remarks for returning the file:");
    if(!reason) return;

    try {
      await axios.put(`http://localhost:8080/api/workflow/reject/${id}?adminName=priya_head`);
      alert("⚠️ File Returned to Originator.");
      fetchPendingRequests();
    } catch (err) {
      alert("Error rejecting file.");
    }
  };

  return (
    <DashboardLayout role="DEPT_HEAD">
      
      {/* --- GOVT BREADCRUMB & TIME STRIP --- */}
      <div className="flex justify-between items-center text-[11px] text-gray-600 mb-4 border-b border-gray-200 pb-2">
         <div className="flex items-center gap-1">
            <span className="hover:underline cursor-pointer">Home</span> 
            <ChevronRight size={10}/> 
            <span className="hover:underline cursor-pointer">Department of Education</span> 
            <ChevronRight size={10}/> 
            <span className="font-bold text-[#0b1e3c]">Secretary Dashboard</span>
         </div>
         <div className="font-mono">
            Last Login: {new Date().toLocaleDateString()} | IP: 10.24.1.55 (Secure NIC Net)
         </div>
      </div>

      {/* --- URGENT TICKER --- */}
      <div className="bg-orange-50 border border-orange-200 p-2 mb-6 flex items-center gap-3 rounded-sm">
         <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">URGENT</span>
         <div className="text-sm text-orange-800 font-medium w-full overflow-hidden whitespace-nowrap">
            Reference Circular No. 45/2026: All Departments must submit Asset Utilization Certificates (UC) before 31st March.
         </div>
      </div>

      {/* --- EXECUTIVE HEADER --- */}
      <div className="flex justify-between items-end mb-6 bg-white p-6 border-l-4 border-[#0b1e3c] shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-[#0b1e3c] uppercase tracking-wide">Competent Authority View</h2>
           <p className="text-sm text-gray-500 mt-1">
              Welcome, <span className="font-bold text-black">Ms. Priya Sharma (Joint Secretary)</span>
           </p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200">
             <Printer size={14}/> Print Summary
           </button>
           <button className="flex items-center gap-2 bg-[#0b1e3c] text-white px-4 py-1.5 text-xs font-bold shadow-md hover:bg-blue-900">
             <Download size={14}/> Export Report (PDF)
           </button>
        </div>
      </div>

      {/* --- OFFICIAL KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Budget */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 bg-blue-100 text-blue-800 rounded-bl-lg font-bold text-xs">FY 2025-26</div>
           <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Sanctioned Grant</h3>
           <div className="text-2xl font-bold text-[#0b1e3c]">₹ 10.0 Cr</div>
           <div className="mt-2 text-xs flex justify-between items-center text-gray-600 border-t pt-2">
              <span>Utilized: ₹ 4.2 Cr</span>
              <span className="text-green-600 font-bold">42%</span>
           </div>
           <div className="w-full bg-gray-200 h-1 mt-1"><div className="bg-green-600 h-1 w-[42%]"></div></div>
        </div>

        {/* Card 2: Pending Files (DYNAMIC NOW) */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm">
           <div className="flex justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Files for Disposal</h3>
              <FileText size={16} className="text-orange-600"/>
           </div>
           {/* DYNAMIC COUNT */}
           <div className="text-2xl font-bold text-orange-600">{requests.length}</div>
           <p className="text-[10px] text-gray-500 mt-1">
              Action required within 3 days. <span className="underline cursor-pointer text-blue-600">View Reasons</span>
           </p>
        </div>

        {/* Card 3: Audit Status */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm">
           <div className="flex justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">CAG Audit Status</h3>
              <AlertTriangle size={16} className="text-red-600"/>
           </div>
           <div className="text-lg font-bold text-red-600">Objection Raised</div>
           <p className="text-[10px] text-gray-500 mt-1">Discrepancy in Laptop Stock.</p>
        </div>

        {/* Card 4: Staff Strength */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm">
           <div className="flex justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Manpower</h3>
              <Users size={16} className="text-[#0b1e3c]"/>
           </div>
           <div className="text-2xl font-bold text-[#0b1e3c]">45 / 50</div>
           <p className="text-[10px] text-green-600 font-bold mt-1">90% Attendance Reported</p>
        </div>
      </div>

      {/* --- E-FILE TABLE (REAL DATA INTEGRATED) --- */}
      <div className="bg-white border border-gray-300 shadow-sm">
         
         {/* Table Header */}
         <div className="bg-[#0b1e3c] text-white px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-bold flex items-center gap-2"><FileCheck size={16}/> e-File Inbox (Pending Approvals)</h3>
            <div className="flex gap-2">
               <div className="bg-white rounded flex items-center px-2">
                  <Search size={12} className="text-gray-500"/>
                  <input type="text" placeholder="Search File No..." className="px-2 py-1 text-xs text-black rounded outline-none w-32"/>
               </div>
               <button className="bg-orange-500 hover:bg-orange-600 px-3 py-1 text-xs font-bold rounded">Filter</button>
            </div>
         </div>

         {/* DATA TABLE */}
         {loading ? (
             <div className="p-10 text-center text-gray-500 text-sm">Loading Files from Secure Server...</div>
         ) : error ? (
             <div className="p-10 text-center text-red-500 text-sm font-bold">{error}</div>
         ) : requests.length === 0 ? (
             <div className="p-10 text-center text-green-700 bg-green-50">
                 <CheckCircle size={32} className="mx-auto mb-2 opacity-50"/>
                 <p className="font-bold">No Pending Files</p>
                 <p className="text-xs">All requisitions have been disposed.</p>
             </div>
         ) : (
            <table className="w-full text-xs text-left border-collapse">
               <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                  <tr>
                     <th className="px-4 py-3 border-r border-gray-200">File No. / Date</th>
                     <th className="px-4 py-3 border-r border-gray-200 w-1/3">Subject / Description</th>
                     <th className="px-4 py-3 border-r border-gray-200">Amount (₹)</th>
                     <th className="px-4 py-3 border-r border-gray-200">Initiated By</th>
                     <th className="px-4 py-3 border-r border-gray-200">Vendor</th>
                     <th className="px-4 py-3 text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                     <tr key={req.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 border-r border-gray-200">
                           <div className="font-mono font-bold text-blue-800">EDU/2026/{req.id}</div>
                           <div className="text-gray-400 font-normal flex items-center gap-1 mt-1">
                               <Clock size={10}/> {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}
                           </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 font-bold text-gray-800">
                           {req.itemName}
                           <span className="block text-[10px] text-gray-500 font-normal mt-1">
                              Category: {req.category}
                           </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 font-bold text-[#0b1e3c]">
                           {req.estimatedCost?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                           {req.initiatedBy?.username || "Procurement Officer"}
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-blue-600 font-medium">
                           {req.vendorName || "GeM Portal"}
                        </td>
                        <td className="px-4 py-3 text-center">
                           <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleApprove(req.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <CheckCircle size={10}/> Sanction
                              </button>
                              <button 
                                onClick={() => handleReject(req.id)}
                                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <XCircle size={10}/> Return
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
         
         {/* Table Footer */}
         <div className="bg-gray-50 px-4 py-2 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
            <span>Showing {requests.length} Active Records</span>
            <div className="flex gap-2">
               <button className="hover:underline">First</button>
               <button className="hover:underline">Previous</button>
               <button className="hover:underline">Next</button>
               <button className="hover:underline">Last</button>
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;