import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Building2, Plus, Coins, Layers, ArrowRight, 
  Package, Truck, Globe, Search, MoreHorizontal, AlertOctagon 
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Mock Database
  const departments = [
    { id: 1, name: 'Ministry of Education', head: 'Priya Sharma', assets: 120, budget: '5.0 Cr', status: 'Active' },
    { id: 2, name: 'Police Department', head: 'Vikram Singh', assets: 3400, budget: '12.0 Cr', status: 'Active' },
    { id: 3, name: 'Health Department', head: 'Dr. Anjali R', assets: 850, budget: '8.5 Cr', status: 'Pending' },
  ];

  return (
    <DashboardLayout role="SUPER_ADMIN">
      
      {/* --- SUPER ADMIN HEADER --- */}
      <div className="bg-[#0b1e3c] p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden">
        {/* Background Design */}
        <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="relative z-10 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Central Command Center</h1>
             <p className="text-blue-200 mt-1 text-sm">Ministry of Electronics & IT (MeitY) | Asset Management Cell</p>
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
        {/* Card 1: Laptops */}
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

        {/* Card 2: Vehicles */}
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

        {/* Card 3: Budget */}
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

        {/* Card 4: Departments */}
        <div className="bg-[#1b3a6b] p-5 rounded-xl shadow-md flex flex-col justify-between h-32 text-white">
           <div className="flex justify-between items-start">
              <div className="p-2 bg-white/10 rounded-lg"><Building2 size={20}/></div>
           </div>
           <div>
              <h3 className="text-2xl font-bold">14</h3>
              <p className="text-xs text-blue-200 font-medium">Active Ministries</p>
           </div>
        </div>
      </div>

      {/* --- DEPARTMENT MANAGEMENT TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <div>
             <h3 className="font-bold text-gray-800">Department Oversight</h3>
             <p className="text-xs text-gray-500">Monitor budget usage and asset distribution</p>
           </div>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
             <input type="text" placeholder="Search Ministry..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-blue-500"/>
           </div>
        </div>

        <table className="w-full text-sm text-left">
           <thead className="bg-gray-100 text-gray-600">
             <tr>
               <th className="px-6 py-4 font-semibold">Department Name</th>
               <th className="px-6 py-4 font-semibold">Dept Head</th>
               <th className="px-6 py-4 font-semibold">Grant Allocated</th>
               <th className="px-6 py-4 font-semibold">Asset Holding</th>
               <th className="px-6 py-4 font-semibold">Status</th>
               <th className="px-6 py-4 text-right font-semibold">Quick Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {departments.map((dept) => (
               <tr key={dept.id} className="hover:bg-blue-50/50 transition-colors group">
                 <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{dept.name.charAt(0)}</div>
                        {dept.name}
                    </div>
                 </td>
                 <td className="px-6 py-4 text-gray-500">{dept.head}</td>
                 <td className="px-6 py-4 font-mono font-bold text-gray-700">₹ {dept.budget}</td>
                 <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                        {dept.assets} Units
                    </span>
                 </td>
                 <td className="px-6 py-4">
                    {dept.status === 'Active' ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Online</span>
                    ) : (
                        <span className="text-xs font-bold text-orange-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span> Setup</span>
                    )}
                 </td>
                 <td className="px-6 py-4 text-right">
                   <button 
                     onClick={() => { setSelectedDept(dept); setShowAssetModal(true); }}
                     className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     Allocate Assets
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {/* --- MODAL: ALLOCATE ASSETS --- */}
      {showAssetModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#0b1e3c] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Truck size={18}/> Asset Distribution</h3>
              <button onClick={() => setShowAssetModal(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 mb-2 p-3 bg-gray-50 rounded border border-gray-200">
                Destination: <span className="font-bold text-black block text-lg">{selectedDept.name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Select Stock Category</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none bg-white focus:border-blue-500">
                  <option>Dell Latitude Laptops (Stock: 5000)</option>
                  <option>Mahindra Bolero (Stock: 12)</option>
                  <option>Office Chairs (Stock: 10000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Quantity to Transfer</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" 
                  placeholder="e.g. 50"
                />
              </div>

              <div className="bg-orange-50 p-3 rounded border border-orange-100 flex gap-2 items-start">
                <AlertOctagon size={16} className="text-orange-600 mt-0.5"/>
                <p className="text-xs text-orange-800">
                   Action is irreversible. Assets will be immediately deducted from Central Inventory.
                </p>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md mt-2 transition-colors">
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default SuperAdminDashboard;