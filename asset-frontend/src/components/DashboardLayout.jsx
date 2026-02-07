import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, FileText, 
  LogOut, ShieldAlert, Users, Menu, Globe, Building2, Truck, Eye
} from 'lucide-react';

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. SELF-HEALING ROLE LOGIC ---
  // If 'role' is not passed as a prop, we pull it from the stored user session
  const sessionUser = JSON.parse(localStorage.getItem('user'));
  const activeRole = (role || sessionUser?.role || '').toUpperCase();

  // --- 2. DEFINE MENUS BASED ON ROLE ---
  let menuItems = [];

  if (activeRole === 'SUPER_ADMIN') {
    menuItems = [
      { name: 'Command Center', path: '/super-admin', icon: <Globe size={18} /> },
      { name: 'Dept Oversight', path: '/super-admin/departments', icon: <Building2 size={18} /> },
      { name: 'Global Inventory', path: '/super-admin/inventory', icon: <Package size={18} /> },
    ];
  } 
  else if (activeRole === 'DEPT_HEAD' || activeRole === 'HEAD') {
    menuItems = [
      { name: 'Secretary View', path: '/admin', icon: <LayoutDashboard size={18} /> },
      { name: 'Approvals', path: '/admin/approvals', icon: <FileText size={18} /> },
      { name: 'Budget Reports', path: '/admin/budget', icon: <Users size={18} /> },
    ];
  } 
  else if (activeRole === 'PROCUREMENT_OFFICER' || activeRole === 'PO') {
    menuItems = [
      { name: 'Officer Dashboard', path: '/procurement', icon: <LayoutDashboard size={18} /> },
      { name: 'New Indent', path: '/procurement/add', icon: <ShoppingCart size={18} /> },
      { name: 'Stock Register', path: '/procurement', icon: <Package size={18} /> }, // Points to Dashboard (Stock View)
      { name: 'Shipments', path: '/procurement/track', icon: <Truck size={18} /> },
    ];
  }
  else if (activeRole === 'AUDITOR') {
    menuItems = [
      { name: 'Audit Console', path: '/auditor', icon: <Eye size={18} /> },
      { name: 'Flagged Anomalies', path: '/auditor/anomalies', icon: <ShieldAlert size={18} /> },
      { name: 'Final Reports', path: '/auditor/reports', icon: <FileText size={18} /> },
    ];
  }
  else {
    // Default: EMPLOYEE (Rahul)
    menuItems = [
      { name: 'My Dashboard', path: '/employee', icon: <LayoutDashboard size={18} /> },
      { name: 'My Assets', path: '/employee', icon: <Package size={18} /> },
      { name: 'Raise Ticket', path: '/employee/support', icon: <ShieldAlert size={18} /> },
    ];
  }

  // --- 3. DEFINE USER PROFILE INFO ---
  const getUserProfile = () => {
    switch(activeRole) {
        case 'SUPER_ADMIN': 
            return { name: 'System Admin', desig: 'NIC Officer', init: 'SA', bg: 'bg-red-600' };
        case 'DEPT_HEAD': 
            return { name: sessionUser?.username || 'Priya Sharma', desig: 'Joint Secretary', init: 'PS', bg: 'bg-orange-600' };
        case 'PROCUREMENT_OFFICER': 
            return { name: sessionUser?.username || 'Amit Kumar', desig: 'Procurement Officer', init: 'AK', bg: 'bg-blue-600' };
        case 'AUDITOR': 
            return { name: 'CAG Officer', desig: 'External Auditor', init: 'CAG', bg: 'bg-purple-600' };
        case 'EMPLOYEE':
        case 'GOVT_EMPLOYEE':
            return { 
                name: sessionUser?.username || 'Rahul Sharma', 
                desig: 'Govt Employee', 
                init: 'RS', 
                bg: 'bg-green-600' 
            };
        default: 
            return { name: 'User', desig: 'Guest', init: 'U', bg: 'bg-gray-600' };
    }
  };

  const user = getUserProfile();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1e3c] text-white flex flex-col shadow-xl transition-all">
        <div className="h-16 flex items-center px-6 bg-[#051024] border-b border-gray-800 gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-8 brightness-0 invert" alt="Emblem" />
          <div>
            <h1 className="font-bold text-lg tracking-wider text-orange-500">GALMS</h1>
            <p className="text-[9px] text-gray-400 uppercase">Govt of India</p>
          </div>
        </div>

        <div className="p-6 border-b border-gray-800 bg-[#0e244b]">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">CURRENTLY LOGGED IN</p>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${user.bg} flex items-center justify-center text-xs font-bold`}>
                {user.init}
              </div>
              <div>
                <p className="font-bold text-sm text-white capitalize">{user.name}</p>
                <p className="text-xs text-blue-200">{user.desig}</p>
              </div>
            </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path 
                ? 'bg-[#1b3a6b] text-white border-l-4 border-orange-500 shadow-md' 
                : 'text-gray-300 hover:bg-[#152a4d] hover:text-white'
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-300 hover:text-white hover:bg-red-900/20 w-full px-4 py-2 rounded transition-colors text-sm font-semibold"
            >
              <LogOut size={16}/> Sign Out
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 text-gray-500">
               <Menu size={20} />
               <span className="text-sm font-medium">Dashboard &gt; {activeRole.replace('_', ' ')} View</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-bold uppercase tracking-wide">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> NIC Server Connected
            </div>
        </header>

        <div className="p-8 flex-1">
           {children}
        </div>
        
        <div className="text-center py-2 text-[10px] text-gray-400">
          NIC-GALMS v2.0 | Session ID: {Math.floor(Math.random() * 90000) + 10000}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;