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

  // --- NEW: GRAB REAL USER DATA ---
  const user = JSON.parse(localStorage.getItem('user'));

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
        <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="relative z-10 flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Central Command Center</h1>
             {/* DYNAMIC WELCOME MESSAGE */}
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

      {/* ... (Rest of your table and modal code remains the same) ... */}
      {/* ... Ensure the rest of the file is copy-pasted from your original ... */}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;