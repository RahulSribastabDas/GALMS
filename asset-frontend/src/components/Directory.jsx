import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react';

const Directory = () => {
  const navigate = useNavigate();

  const departments = [
    { name: "Ministry of Electronics & IT", head: "Joint Secretary (Admin)", phone: "011-2436-1234", email: "admin@meity.gov.in" },
    { name: "Department of Telecommunications", head: "Director (Assets)", phone: "011-2303-5678", email: "assets@dot.gov.in" },
    { name: "Ministry of Health & Family Welfare", head: "Chief Procurement Officer", phone: "011-2306-9876", email: "cpo@mohfw.gov.in" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-[#0b1e3c] text-white shadow-md py-4 px-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wider text-orange-500">GALMS</h1>
            <p className="text-[10px] tracking-widest uppercase text-blue-200 hidden md:block">Department Directory</p>
         </div>
         <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors">
            <ArrowLeft size={16} /> Return to Home
         </button>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl flex-grow animate-in fade-in duration-500">
         <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Building2 size={28} /></div>
            <div>
               <h2 className="text-3xl font-extrabold text-gray-800">Official Directory</h2>
               <p className="text-gray-500">Contact information for integrated ministries and nodal officers.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
               <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                  <h3 className="font-bold text-gray-800 mb-4 h-12">{dept.name}</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-400 w-12">Head</span>
                        <span className="text-gray-800 font-medium">{dept.head}</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{dept.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-blue-600 hover:underline cursor-pointer">{dept.email}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </main>
    </div>
  );
};

export default Directory;