import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, FileText, HelpCircle } from 'lucide-react';

const UserManual = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-[#0b1e3c] text-white shadow-md py-4 px-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wider text-orange-500">GALMS</h1>
            <p className="text-[10px] tracking-widest uppercase text-blue-200 hidden md:block">User Manual & Docs</p>
         </div>
         <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors">
            <ArrowLeft size={16} /> Return to Home
         </button>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl flex-grow animate-in fade-in duration-500">
         <div className="mb-8 flex items-center gap-3">
            <div className="bg-[#1b3a6b] p-3 rounded-xl text-white"><BookOpen size={28} /></div>
            <div>
               <h2 className="text-3xl font-extrabold text-gray-800">Documentation & Manuals</h2>
               <p className="text-gray-500">Official guides for navigating the Asset Management Portal.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={24} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded">V 2.1 - Latest</span>
               </div>
               <h3 className="font-bold text-lg text-gray-800 mb-2">Dept. Head Quickstart Guide</h3>
               <p className="text-sm text-gray-600 mb-6">Learn how to provision employee accounts, approve tickets, and view your department's asset allocation.</p>
               <button className="w-full bg-[#1b3a6b] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                  <Download size={16} /> Download PDF
               </button>
            </div>

            {/* Guide 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><HelpCircle size={24} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">FAQ</span>
               </div>
               <h3 className="font-bold text-lg text-gray-800 mb-2">Employee Troubleshooting</h3>
               <p className="text-sm text-gray-600 mb-6">Common solutions for login issues, submitting maintenance requests, and verifying assigned assets.</p>
               <button className="w-full border-2 border-[#1b3a6b] text-[#1b3a6b] hover:bg-blue-50 font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors">
                  Read Online
               </button>
            </div>
         </div>
      </main>
    </div>
  );
};

export default UserManual;