import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Building2, Plus, Coins, Layers, ArrowRight, 
  Package, Truck, Globe, Search, MoreHorizontal, AlertOctagon,
  Users, UserPlus, Shield, Key, Mail // <-- ADDED Mail Icon
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  const [departments, setDepartments] = useState([]);
  const [deptUsers, setDeptUsers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptRegion, setNewDeptRegion] = useState('');
  const [newDeptBudget, setNewDeptBudget] = useState('');

  // --- ADDED EMAIL STATE ---
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState(''); // <-- NEW
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('PROCUREMENT_OFFICER');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setIsLoading(false);
      }
    };

    if (token) {
        fetchDepartments();
    }
  }, [token]);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/departments', {
        name: newDeptName,
        region: newDeptRegion,
        totalBudget: parseFloat(newDeptBudget)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDepartments([...departments, response.data]);
      setShowDeptModal(false);
      setNewDeptName('');
      setNewDeptRegion('');
      setNewDeptBudget('');
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Failed to create department. Make sure the name is unique.");
    }
  };

  const handleManageUsers = async (dept) => {
    setSelectedDept(dept);
    setShowUserModal(true);
    setDeptUsers([]); 
    
    try {
      const response = await axios.get(`http://localhost:8080/api/users/department/${dept.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptUsers(response.data);
    } catch (error) {
      console.error("Error fetching users for department:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/users', {
        username: newUsername,
        email: newEmail, // <-- SEND EMAIL TO BACKEND
        password: newPassword,
        role: newUserRole,
        departmentName: selectedDept.name, 
        department: { id: selectedDept.id } 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDeptUsers([...deptUsers, response.data]); 
      setNewUsername('');
      setNewEmail(''); // Clear it!
      setNewPassword('');
      alert("✅ Official Account Provisioned! Credentials have been emailed.");
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.response?.data || "Failed to create user.");
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="p-2">
          {/* --- SUPER ADMIN HEADER --- */}
          <div className="bg-[#0b1e3c] p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-end">
              <div>
                 <h1 className="text-3xl font-bold tracking-tight">Central Command Center</h1>
                 <p className="text-blue-200 mt-1 text-sm italic">Logged in as: {user?.username || 'Administrator'}</p>
                 <p className="text-blue-400 text-[10px] uppercase font-bold tracking-widest mt-1">Ministry of Electronics & IT (MeitY)</p>
              </div>
              <div className="flex gap-3">
                 <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-all border border-white/10">
                    Download Global Audit
                 </button>
                 <button 
                    onClick={() => setShowDeptModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all"
                 >
                    <Plus size={18}/> Initialize New Dept
                 </button>
              </div>
            </div>
          </div>

          {/* --- MASTER WAREHOUSE STATS --- */}
          <h3 className="text-gray-700 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
            <Globe size={16}/> Global Master Inventory
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-1 h-full bg-blue-500"></div>
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Stock High</span>
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-gray-800">5,000</h3>
                  <p className="text-xs text-gray-500 font-medium">Laptops Available</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-1 h-full bg-orange-500"></div>
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Truck size={20}/></div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Low Stock</span>
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-gray-800">12</h3>
                  <p className="text-xs text-gray-500 font-medium">Utility Vehicles</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-1 h-full bg-green-500"></div>
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Coins size={20}/></div>
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-gray-800">₹ 100 Cr</h3>
                  <p className="text-xs text-gray-500 font-medium">Unallocated Grant</p>
               </div>
            </div>
            <div className="bg-[#1b3a6b] p-5 rounded-xl shadow-md flex flex-col justify-between h-32 text-white">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/10 rounded-lg"><Building2 size={20}/></div>
               </div>
               <div>
                  <h3 className="text-2xl font-bold">{departments.length}</h3>
                  <p className="text-xs text-blue-200 font-medium">Active Ministries</p>
               </div>
            </div>
          </div>

          {/* --- DEPARTMENT MANAGEMENT TABLE --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h3 className="font-bold text-gray-800">Department Oversight</h3>
                 <p className="text-xs text-gray-500">Monitor budget usage and assign personnel</p>
               </div>
            </div>

            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-bold animate-pulse">Fetching secure records from PostgreSQL...</div>
            ) : departments.length === 0 ? (
              <div className="p-10 text-center text-gray-500 font-bold">No departments initialized yet.</div>
            ) : (
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-100 text-gray-600">
                   <tr>
                     <th className="px-6 py-4 font-semibold">Department Name</th>
                     <th className="px-6 py-4 font-semibold">Region</th>
                     <th className="px-6 py-4 font-semibold">Total Budget</th>
                     <th className="px-6 py-4 font-semibold">Used Budget</th>
                     <th className="px-6 py-4 font-semibold">Unverified Assets</th>
                     <th className="px-6 py-4 text-right font-semibold">Quick Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {departments.map((dept) => (
                     <tr key={dept.id} className="hover:bg-blue-50/50 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                {dept.name ? dept.name.charAt(0) : 'D'}
                              </div>
                              {dept.name}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-gray-500 font-medium">{dept.region}</td>
                       <td className="px-6 py-4 font-mono font-bold text-gray-700">₹ {dept.totalBudget?.toLocaleString() || '0'}</td>
                       <td className="px-6 py-4 font-mono text-gray-600">₹ {dept.usedBudget?.toLocaleString() || '0'}</td>
                       
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${dept.unverifiedAssetsCount > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                              {dept.unverifiedAssetsCount || 0} Pending
                          </span>
                       </td>
                       
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleManageUsers(dept)}
                           className="text-xs font-bold text-white bg-[#1b3a6b] hover:bg-blue-900 px-3 py-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto"
                         >
                           <Users size={14}/> Manage Users
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            )}
          </div>

          {/* --- MODAL: INITIALIZE NEW DEPARTMENT --- */}
          {showDeptModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-[#0b1e3c] text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Building2 size={18}/> Initialize Ministry / Dept</h3>
                  <button onClick={() => setShowDeptModal(false)} className="text-white/70 hover:text-white font-bold">✕</button>
                </div>
                
                <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Department Name</label>
                    <input type="text" required value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500" placeholder="e.g. Ministry of Health" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Region / Zone</label>
                    <input type="text" required value={newDeptRegion} onChange={(e) => setNewDeptRegion(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500" placeholder="e.g. North District" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Total Allocated Budget (₹)</label>
                    <input type="number" required value={newDeptBudget} onChange={(e) => setNewDeptBudget(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500" placeholder="e.g. 50000000" />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-md mt-4 transition-colors">
                    Initialize Department
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* --- MODAL: MANAGE USERS --- */}
          {showUserModal && selectedDept && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                
                <div className="bg-[#1b3a6b] text-white px-6 py-4 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-bold flex items-center gap-2"><Shield size={18}/> Access Control Center</h3>
                    <p className="text-xs text-blue-200 mt-0.5">Managing personnel for: <span className="text-white font-bold">{selectedDept.name}</span></p>
                  </div>
                  <button onClick={() => setShowUserModal(false)} className="text-white/70 hover:text-white font-bold text-xl">✕</button>
                </div>

                <div className="flex flex-col md:flex-row overflow-hidden">
                  
                  {/* LEFT SIDE: Current Users List */}
                  <div className="w-full md:w-1/2 p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Users size={14}/> Active Personnel ({deptUsers.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {deptUsers.length === 0 ? (
                        <p className="text-sm text-gray-400 italic bg-white p-3 rounded border border-gray-200">No users assigned yet.</p>
                      ) : (
                        deptUsers.map(u => (
                          <div key={u.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                             <div>
                               <p className="text-sm font-bold text-gray-800">{u.username}</p>
                               <p className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                                  {u.role.replace('_', ' ')}
                               </p>
                             </div>
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE: Add New User Form */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <UserPlus size={14}/> Provision New Account
                    </h4>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Official Role</label>
                        <select 
                          value={newUserRole} 
                          onChange={(e) => setNewUserRole(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="PROCUREMENT_OFFICER">Procurement Officer (PO)</option>
                          <option value="DEPT_HEAD">Department Head</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Username / ID</label>
                        <input 
                          type="text" required
                          value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                          placeholder="e.g. amit_po"
                        />
                      </div>

                      {/* --- NEW EMAIL INPUT --- */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Official Email Address</label>
                        <div className="relative">
                           <Mail size={14} className="absolute left-3 top-3 text-gray-400"/>
                           <input 
                             type="email" required
                             value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                             className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                             placeholder="e.g. official@gov.in"
                           />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Secure Password</label>
                        <div className="relative">
                           <Key size={14} className="absolute left-3 top-3 text-gray-400"/>
                           <input 
                             type="password" required
                             value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                             className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                             placeholder="••••••••"
                           />
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-[#1b3a6b] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg shadow mt-2 transition-colors flex justify-center items-center gap-2">
                         <UserPlus size={16}/> Create Account & Send Email
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          )}

      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;