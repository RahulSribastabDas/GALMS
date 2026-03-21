import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout'; 
import { 
  Building2, Users, MonitorSmartphone, CheckCircle, 
  Send, UserPlus, AlertCircle, Wrench, CheckCircle2, XCircle,
  Search, Filter, Download, ShieldCheck, Key, Mail 
} from 'lucide-react';

const DeptDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isLoading, setIsLoading] = useState(true);

  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [targetUsername, setTargetUsername] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // STATE: Includes email now
  const [newEmployee, setNewEmployee] = useState({
      username: '',
      email: '', 
      password: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userDept = user?.department || 'SOFTWARE FORCE'; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const assetRes = await axios.get('http://localhost:8080/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myDeptAssets = assetRes.data.filter(
            asset => asset.department === userDept && asset.status === 'AVAILABLE'
        );
        setAssets(myDeptAssets);

        const ticketRes = await axios.get('http://localhost:8080/api/requests/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myDeptTickets = ticketRes.data.filter(t => t.type !== 'REQUISITION');
        setTickets(myDeptTickets);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token, userDept]);

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

  const handleTicketAction = async (ticketId, newStatus) => {
      try {
          await axios.put(`http://localhost:8080/api/requests/${ticketId}/status?status=${newStatus}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setTickets(tickets.filter(t => t.id !== ticketId));
          alert(`Ticket successfully marked as ${newStatus}.`);
      } catch (error) {
          console.error("Error updating ticket:", error);
          alert("Failed to update ticket.");
      }
  };

  const handleRegisterEmployee = async (e) => {
      e.preventDefault();
      try {
          await axios.post('http://localhost:8080/api/users', {
              username: newEmployee.username,
              email: newEmployee.email, // SENDING EMAIL TO BACKEND
              password: newEmployee.password,
              role: 'EMPLOYEE',
              department: { name: userDept } 
          }, {
              headers: { Authorization: `Bearer ${token}` } 
          });
          
          alert(`✅ Secure account created for ${newEmployee.username}! Credentials have been emailed.`);
          setNewEmployee({ username: '', email: '', password: '' }); 
      }  catch (error) {
          console.error("Error creating user:", error);
          alert(error.response?.data || "Failed to create user.");
      }
  };

  const filteredAssets = assets.filter(asset => {
      const matchesSearch = asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            asset.assetId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const exportToCSV = () => {
      if (filteredAssets.length === 0) return alert("No data to export!");
      const headers = ['Asset ID', 'Name & Model', 'Category', 'Purchase Value (INR)', 'Status', 'Department'];
      const csvRows = filteredAssets.map(asset => [
          asset.assetId || `AST-${asset.id}`, `"${asset.assetName}"`, asset.category, asset.cost || 0, asset.status, asset.department
      ].join(','));
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${userDept.replace(/\s+/g, '_')}_Inventory.csv`;
      link.click();
  };

  return (
    <DashboardLayout role="DEPT_HEAD">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
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
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 pb-px">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors ${activeTab === 'overview' ? 'bg-white text-[#1e3a8a] border-t-2 border-l border-r border-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-t-2 border-transparent'}`}
            >
                Logistics & Tickets
            </button>
            <button 
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'staff' ? 'bg-white text-[#1e3a8a] border-t-2 border-l border-r border-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-t-2 border-transparent'}`}
            >
                <Users size={16}/> Manage Staff
            </button>
        </div>

        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><MonitorSmartphone size={18}/> Available Stock</h3>
                    </div>
                    <button onClick={exportToCSV} className="flex items-center gap-1 text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200">
                        <Download size={14}/> Export CSV
                    </button>
                  </div>

                  <div className="bg-white p-4 border-b border-gray-100 flex gap-3">
                      <div className="relative flex-grow">
                          <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                          <input 
                              type="text" placeholder="Search by Asset Name or ID..." 
                              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                      </div>
                      <div className="relative">
                          <Filter size={14} className="absolute left-3 top-3 text-gray-400"/>
                          <select 
                              value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                              className="pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer"
                          >
                              <option value="All">All Categories</option>
                              <option value="Hardware">Hardware</option>
                              <option value="Vehicle">Vehicle</option>
                              <option value="Furniture">Furniture</option>
                          </select>
                      </div>
                  </div>

                  <div className="overflow-y-auto flex-grow">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-xs uppercase">Asset details</th>
                            <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {isLoading ? (<tr><td colSpan="2" className="p-6 text-center text-gray-500">Loading inventory...</td></tr>) 
                          : filteredAssets.length === 0 ? (<tr><td colSpan="2" className="p-10 text-center text-gray-500"><AlertCircle size={32} className="mx-auto text-gray-300 mb-2"/>No assets match your search.</td></tr>) 
                          : (filteredAssets.map((asset) => (
                              <tr key={asset.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="font-bold text-gray-800">{asset.assetName}</div>
                                  <div className="text-[10px] font-mono text-blue-800 mt-0.5 bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">
                                      {asset.assetId} • {asset.category}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right align-middle">
                                  <button onClick={() => {setSelectedAsset(asset); setShowAssignModal(true);}} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ml-auto">
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Wrench size={18} className="text-orange-500"/> Staff Service Requests</h3>
                  </div>
                  <div className="overflow-y-auto flex-grow">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-xs uppercase">Ticket Info</th>
                            <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Resolution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {isLoading ? (<tr><td colSpan="2" className="p-6 text-center text-gray-500">Loading tickets...</td></tr>) 
                          : tickets.length === 0 ? (<tr><td colSpan="2" className="p-10 text-center text-gray-500"><CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2"/>No pending requests.</td></tr>) 
                          : (tickets.map((ticket) => (
                              <tr key={ticket.id} className="hover:bg-orange-50/30 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-gray-800 text-sm">{ticket.employee?.username}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${ticket.type === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>{ticket.type}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate max-w-[200px] italic">"{ticket.description}"</p>
                                </td>
                                <td className="px-4 py-4 text-right align-middle">
                                  <div className="flex justify-end gap-2">
                                      <button onClick={() => handleTicketAction(ticket.id, 'APPROVED')} className="text-green-600 hover:bg-green-50 p-1.5 rounded border border-green-200" title="Approve & Close"><CheckCircle2 size={16}/></button>
                                      <button onClick={() => handleTicketAction(ticket.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-red-200" title="Reject"><XCircle size={16}/></button>
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
        )}

        {activeTab === 'staff' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto animate-in fade-in duration-300 mt-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-[#1e3a8a]"/>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Secure Staff Onboarding</h2>
                        <p className="text-xs text-gray-500">Generate access credentials for new department personnel.</p>
                    </div>
                </div>
                
                <form onSubmit={handleRegisterEmployee} className="p-6 md:p-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0"/>
                        <p className="text-sm text-blue-800">
                            Accounts created here are strictly bound to the <strong>{userDept}</strong>. The new employee will log in using the "Employee Portal" tab on the main screen.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Employee Gov Username</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input 
                                    type="text" required 
                                    value={newEmployee.username}
                                    onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                                    placeholder="e.g. emp_kiran"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
                                />
                            </div>
                        </div>

                        {/* NEW INPUT FOR EMAIL ADDRESS */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Official Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input 
                                    type="email" required 
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                                    placeholder="e.g. employee@gov.in"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Temporary Password</label>
                            <div className="relative">
                                <Key size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input 
                                    type="password" required 
                                    value={newEmployee.password}
                                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2">
                            <UserPlus size={18}/> Generate Employee Account
                        </button>
                    </div>
                </form>
            </div>
        )}

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
                        <input type="text" required value={targetUsername} onChange={(e) => setTargetUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. rahul" />
                    </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setShowAssignModal(false)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                        <button type="submit" className="w-2/3 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"><CheckCircle size={16}/> Confirm Allocation</button>
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