import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { 
  Laptop, AlertCircle, CheckCircle, Clock, FileText, 
  ChevronRight, Download, Plus, Smartphone, X,
  ShieldCheck, Key, Lock // <-- NEW SECURITY ICONS ADDED
} from 'lucide-react';

const EmployeeDashboard = () => {
  // --- 1. CORE USER STATE ---
  // Converted to state so we can update it after password reset
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { username: 'rahul', role: 'EMPLOYEE' });
  const token = localStorage.getItem('token'); 

  // --- 2. SECURITY LOCK STATE ---
  const [needsPasswordChange, setNeedsPasswordChange] = useState(user?.firstLogin === true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // --- 3. DASHBOARD DATA STATE ---
  const [myAssets, setMyAssets] = useState([]);
  const [myTickets, setMyTickets] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); 
  const [ticketForm, setTicketForm] = useState({
      type: 'MAINTENANCE',
      priority: 'Medium',
      description: ''
  });
  
  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    // Only fetch data if they don't need a password change!
    if (token && !needsPasswordChange) {
        fetchMyAssets();
        fetchMyTickets();
    }
  }, [token, needsPasswordChange]);

  const fetchMyAssets = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
      });
      const myItems = response.data.filter(asset => 
        asset.assignedTo && asset.assignedTo.username === user.username
      );
      setMyAssets(myItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
      try {
          const response = await axios.get(`http://localhost:8080/api/requests/my-tickets/${user.username}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMyTickets(response.data);
      } catch (error) {
          console.error("Error fetching tickets:", error);
      }
  };

  // --- ACTIONS ---

  // A: Handle Password Reset
  const handlePasswordReset = async (e) => {
      e.preventDefault();
      setError('');

      if (newPassword !== confirmPassword) return setError("Passwords do not match!");
      if (newPassword.length < 6) return setError("Password must be at least 6 characters.");

      try {
          await axios.post('http://localhost:8080/api/auth/change-password', {
              username: user.username,
              newPassword: newPassword
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });

          alert("✅ Password secured successfully! Welcome to the portal.");
          
          // Update local storage so they don't get locked out on refresh
          const updatedUser = { ...user, firstLogin: false };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          
          // Unlock the dashboard!
          setNeedsPasswordChange(false); 
      } catch (error) {
          console.error("Password reset failed:", error);
          setError("Failed to update password. Please try again.");
      }
  };

  // B: Handle Asset Acceptance
  const handleAccept = async (assetId) => {
      if(window.confirm("I certify that I have physically received this item in good working condition.")) {
          try {
            await axios.post(`http://localhost:8080/api/assets/accept/${assetId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Custody Accepted! The asset is now officially under your care.");
            setMyAssets(prev => prev.map(a => a.id === assetId ? {...a, assignmentPending: false} : a));
          } catch (err) {
            alert("Error communicating with server.");
          }
      }
  };

  // C: Handle Ticket Submission
  const handleRaiseTicket = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              type: ticketForm.type,
              priority: ticketForm.priority,
              description: ticketForm.description,
              status: 'SUBMITTED',
              employee: { username: user.username }
          };
          
          await axios.post('http://localhost:8080/api/requests/raise', payload, {
              headers: { Authorization: `Bearer ${token}` }
          });

          alert("✅ Ticket Raised Successfully!");
          setShowModal(false);
          setTicketForm({ type: 'MAINTENANCE', priority: 'Medium', description: '' }); 
          fetchMyTickets(); 
      } catch (error) {
          console.error("Full Error:", error);
          alert("Failed to raise ticket. Check console for details.");
      }
  };

  // ==========================================
  // UI 1: THE HIGH-SECURITY LOCK SCREEN
  // ==========================================
  if (needsPasswordChange) {
      return (
          <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 z-[100] relative">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                 <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
             </div>

             <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
                 <div className="flex justify-center mb-6">
                     <div className="bg-blue-50 p-4 rounded-full text-[#1e3a8a] ring-8 ring-blue-50/50">
                         <ShieldCheck size={40} />
                     </div>
                 </div>
                 <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">Secure Your Account</h2>
                 <p className="text-sm text-center text-gray-500 mb-6 px-4">
                     Welcome, <span className="font-bold text-[#1e3a8a]">{user?.username}</span>! As per government security protocols, you must replace your temporary credentials before accessing the GALMS portal.
                 </p>

                 {error && (
                     <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-medium border border-red-100">
                         {error}
                     </div>
                 )}

                 <form onSubmit={handlePasswordReset} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">New Secret Password</label>
                         <div className="relative">
                             <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                             <input 
                                 type="password" required 
                                 value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all"
                                 placeholder="Enter a strong password"
                             />
                         </div>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Confirm Password</label>
                         <div className="relative">
                             <CheckCircle size={16} className="absolute left-3 top-3 text-gray-400" />
                             <input 
                                 type="password" required 
                                 value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] outline-none transition-all"
                                 placeholder="Re-type your new password"
                             />
                         </div>
                     </div>
                     <button type="submit" className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-3 rounded-lg mt-6 shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2">
                         <Key size={18} /> Update Password & Continue
                     </button>
                 </form>
             </div>
          </div>
      );
  }

  // ==========================================
  // UI 2: THE NORMAL EMPLOYEE DASHBOARD
  // ==========================================
  return (
    <DashboardLayout role="EMPLOYEE">
      
      {/* --- BREADCRUMB & WELCOME --- */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4 p-4">
         <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide mb-1">
               <span>Home</span> <ChevronRight size={10}/> <span>Employee Self Service (ESS)</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0b1e3c]">My Workspace</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.username}. Manage your assets.</p>
         </div>
         <button 
            onClick={() => setShowModal(true)}
            className="bg-[#0b1e3c] hover:bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-sm transition-all"
         >
            <Plus size={16}/> Raise New Ticket
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">

        {/* --- LEFT COLUMN: ASSETS & REQUESTS --- */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* SECTION A: MY ASSIGNED ASSETS */}
           <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="font-bold text-[#0b1e3c] flex items-center gap-2"><Laptop size={18}/> Assigned Assets (Custody)</h2>
                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">
                    {myAssets.length} Active
                 </span>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-4">
                 {loading ? <div className="text-gray-400 text-sm">Loading assets...</div> : 
                  myAssets.length === 0 ? <div className="text-gray-400 text-sm italic">No assets assigned yet.</div> :
                  myAssets.map((asset) => (
                    <div key={asset.id} className={`border p-4 rounded hover:shadow-md transition-shadow relative ${asset.assignmentPending ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                       <div className="absolute top-4 right-4 text-gray-200">
                          {asset.assetName?.toLowerCase().includes('phone') ? <Smartphone size={40}/> : <Laptop size={40}/>}
                       </div>
                       <div className="flex justify-between items-start">
                           <div>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{asset.assetId}</p>
                               <h3 className="text-lg font-bold text-[#0b1e3c]">{asset.assetName}</h3>
                               <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  <p><span className="font-bold">Value:</span> ₹ {asset.cost}</p>
                                  <p><span className="font-bold">Issued Date:</span> {asset.purchaseDate || 'N/A'}</p>
                               </div>
                           </div>
                           <div className="mr-12">
                               {asset.assignmentPending ? (
                                   <div className="text-right">
                                       <span className="bg-orange-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm animate-pulse">ACTION REQUIRED</span>
                                       <p className="text-[10px] text-orange-700 mt-1 font-bold">Pending Acceptance</p>
                                   </div>
                               ) : (
                                   <div className="text-right">
                                       <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={10}/> Active / In-Custody</span>
                                   </div>
                               )}
                           </div>
                       </div>
                       <div className="mt-4 flex gap-3 border-t border-gray-200/50 pt-3">
                          {asset.assignmentPending ? (
                              <button onClick={() => handleAccept(asset.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm flex items-center gap-2">
                                <CheckCircle size={14}/> I Accept Custody
                              </button>
                          ) : (
                              <>
                                <button className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1.5 border border-blue-200 rounded hover:bg-blue-100 font-bold">Report Issue</button>
                                <button className="text-[10px] bg-gray-50 text-gray-700 px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-100">Return Asset</button>
                              </>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* SECTION B: RECENT TICKETS */}
           <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="font-bold text-[#0b1e3c] flex items-center gap-2"><Clock size={18}/> Recent Service Requests</h2>
                 <a href="#" className="text-xs text-blue-600 hover:underline">View All History</a>
              </div>
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-100 text-gray-600 font-bold text-xs uppercase">
                    <tr>
                       <th className="px-4 py-3 border-b">Request ID</th>
                       <th className="px-4 py-3 border-b">Type / Description</th>
                       <th className="px-4 py-3 border-b">Date</th>
                       <th className="px-4 py-3 border-b">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {myTickets.length === 0 ? (
                        <tr><td colSpan="4" className="p-4 text-center text-gray-400 italic">No tickets raised yet.</td></tr>
                    ) : (
                        myTickets.map((req) => (
                           <tr key={req.id} className="hover:bg-blue-50">
                              <td className="px-4 py-3 font-mono text-xs font-bold text-gray-500">REQ-{req.id}</td>
                              <td className="px-4 py-3">
                                  <div className="font-bold text-gray-800">{req.type}</div>
                                  <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{req.description}</div>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}
                              </td>
                              <td className="px-4 py-3">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                    req.status === 'CLOSED' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-orange-100 text-orange-700 border-orange-200'
                                 }`}>
                                    {req.status}
                                 </span>
                              </td>
                           </tr>
                        ))
                    )}
                 </tbody>
              </table>
           </div>

        </div>

        {/* --- RIGHT COLUMN: NOTICES & PROFILE --- */}
        <div className="space-y-6">
           <div className="bg-gradient-to-b from-[#0b1e3c] to-[#1b3a6b] text-white p-6 rounded shadow-md text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border-2 border-white/50 mb-3">
                 {user.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-lg capitalize">{user.username}</h3>
              <p className="text-xs text-blue-200 uppercase tracking-wide mb-4">Govt Employee</p>
              <div className="text-[10px] bg-black/20 p-2 rounded text-left space-y-1">
                 <p><span className="text-gray-400">Employee ID:</span> GOV-8821</p>
                 <p><span className="text-gray-400">Department:</span> Administration</p>
                 <p><span className="text-gray-400">Location:</span> Block-C, Room 204</p>
              </div>
           </div>

           <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                 <FileText size={16} className="text-orange-500"/> Office Circulars
              </h3>
              <ul className="space-y-3">
                 <li className="text-xs border-b border-gray-100 pb-2">
                    <p className="font-bold text-[#0b1e3c] hover:underline cursor-pointer">Holiday Notice: Republic Day</p>
                    <p className="text-gray-500 mt-0.5">Office will remain closed on 26th Jan.</p>
                 </li>
                 <li className="text-xs pb-1">
                     <a href="#" className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                        <Download size={12}/> Download HR Policy
                     </a>
                 </li>
              </ul>
           </div>

           <div className="bg-blue-50 border border-blue-100 p-4 rounded text-center">
              <AlertCircle className="text-blue-500 mx-auto mb-2" size={24}/>
              <h4 className="font-bold text-sm text-blue-900">Need IT Support?</h4>
              <p className="font-bold text-lg text-[#0b1e3c]">Ext: 4402</p>
           </div>
        </div>

      </div>

      {/* --- MODAL: RAISE NEW TICKET --- */}
      {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-[#0b1e3c] text-white px-6 py-4 flex justify-between items-center">
                      <h3 className="font-bold">Raise New Ticket</h3>
                      <button onClick={() => setShowModal(false)} className="hover:text-red-300"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleRaiseTicket} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Request Type</label>
                          <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            value={ticketForm.type}
                            onChange={(e) => setTicketForm({...ticketForm, type: e.target.value})}
                          >
                              <option value="REQUISITION">New Asset Requisition</option>
                              <option value="MAINTENANCE">Repair / Maintenance</option>
                              <option value="RETURN">Return Asset</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Priority</label>
                          <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                          >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Issue</label>
                          <textarea 
                              className="w-full border border-gray-300 rounded p-2 text-sm h-24"
                              placeholder="Describe your issue or requirement..."
                              value={ticketForm.description}
                              onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                              required
                          ></textarea>
                      </div>
                      <div className="pt-2">
                          <button type="submit" className="w-full bg-[#0b1e3c] hover:bg-blue-900 text-white font-bold py-2 rounded text-sm transition-colors">
                              Submit Request
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </DashboardLayout>
  );
};

export default EmployeeDashboard;