import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Globe, Shield } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- MINIMAL HEADER --- */}
      <header className="bg-[#0b1e3c] text-white shadow-md py-4 px-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wider text-orange-500">GALMS</h1>
            <p className="text-[10px] tracking-widest uppercase text-blue-200 hidden md:block">Govt of India Asset Portal</p>
         </div>
         <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"
         >
            <ArrowLeft size={16} /> Return to Home
         </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-6 py-12 max-w-4xl flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
            
            <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 w-max">
               <Shield size={14}/> Official Mandate
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b1e3c] mb-6 leading-tight">
               About the Government Asset Lifecycle Management System
            </h2>
            
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
               GALMS is a centralized digital infrastructure initiated under the Digital India program. It is engineered to bring absolute transparency, accountability, and efficiency to the procurement, allocation, utilization, and disposal of physical assets across all state and central government ministries.
            </p>

            <div className="space-y-8">
               <div className="flex gap-5 items-start">
                  <div className="mt-1 p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
                  <div>
                     <h4 className="text-xl font-bold text-gray-800">Eradicating Ghost Assets</h4>
                     <p className="text-gray-600 mt-2 leading-relaxed">Through rigorous digital audits and unified tracking, GALMS ensures that every rupee spent on government infrastructure is actively accounted for. It prevents assets from "disappearing" off the books.</p>
                  </div>
               </div>
               
               <div className="flex gap-5 items-start">
                  <div className="mt-1 p-3 bg-blue-50 text-blue-600 rounded-xl"><Globe size={24} /></div>
                  <div>
                     <h4 className="text-xl font-bold text-gray-800">Cross-Department Resource Pooling</h4>
                     <p className="text-gray-600 mt-2 leading-relaxed">Departments with surplus assets (like laptops or utility vehicles) can now securely identify and transfer them to ministries facing shortages, drastically reducing redundant procurement budgets across the government.</p>
                  </div>
               </div>
               
               <div className="flex gap-5 items-start">
                  <div className="mt-1 p-3 bg-orange-50 text-orange-600 rounded-xl"><FileText size={24} /></div>
                  <div>
                     <h4 className="text-xl font-bold text-gray-800">Automated CAG Auditing</h4>
                     <p className="text-gray-600 mt-2 leading-relaxed">The system replaces manual paper ledgers with built-in compliance reporting, allowing the Comptroller and Auditor General (CAG) to conduct real-time, tamper-proof audits instantly.</p>
                  </div>
               </div>
            </div>

         </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0b1e3c] text-white py-6 border-t border-white/10 text-center">
         <p className="text-xs text-blue-400">© 2026 National Informatics Centre (NIC). All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;