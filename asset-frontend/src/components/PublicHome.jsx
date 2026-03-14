import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Server, TrendingUp, Users, ArrowRight, BookOpen, Bell, HelpCircle } from 'lucide-react';

const PublicHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- TOP HEADER (Your existing Navbar) --- */}
      <header className="bg-[#0b1e3c] text-white shadow-md z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Placeholder for State Emblem of India */}
            <div className="w-10 h-12 border-2 border-yellow-500 rounded flex items-center justify-center text-yellow-500 font-bold text-xs text-center p-1">
              सत्यमेव जयते
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-orange-500">GALMS</h1>
              <p className="text-[10px] tracking-widest uppercase text-blue-200">Govt of India Asset Portal</p>
            </div>
          </div>
          
          {/* FUNCTIONAL NAVIGATION LINKS */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-blue-100">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors border-b-2 border-orange-500 pb-1">Home</button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About GALMS</button>
            <button onClick={() => navigate('/notifications')} className="hover:text-white transition-colors flex items-center gap-1">
              Notifications <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">New</span>
            </button>
            <button onClick={() => navigate('/manual')} className="hover:text-white transition-colors">User Manual</button>
            <button onClick={() => navigate('/directory')} className="hover:text-white transition-colors">Department Directory</button>
          </nav>

          <button onClick={() => navigate('/support')} className="text-sm font-bold flex items-center gap-2 text-white hover:text-orange-400">
            <HelpCircle size={16} /> Support
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-[#0b1e3c] to-[#1a365d] text-white py-20 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                Digital India Initiative
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Government Asset Lifecycle Management System
              </h2>
              <p className="text-blue-200 text-lg mb-8 max-w-xl">
                A unified, secure, and transparent portal for tracking, procuring, and auditing all state and central government physical assets across ministries.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/login')} // Redirects to your existing login page
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                  Secure Login Portal <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-lg font-bold backdrop-blur-sm transition-colors"
                >
                  Read the Mandate
                </button>
              </div>
            </div>

            {/* Live Global Statistics (Read-only for public) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-6 border-b border-white/20 pb-2">National Asset Overview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-bold text-white mb-1">42</p>
                  <p className="text-xs text-blue-300 uppercase tracking-wider">Onboarded Ministries</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1">1.2M+</p>
                  <p className="text-xs text-blue-300 uppercase tracking-wider">Tracked Assets</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1">₹ 4.5K Cr</p>
                  <p className="text-xs text-blue-300 uppercase tracking-wider">Managed Budget</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1">100%</p>
                  <p className="text-xs text-green-400 uppercase tracking-wider">Audit Compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CORE PILLARS SECTION --- */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-[#0b1e3c] mb-4">Core Objectives of GALMS</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4"><Shield size={24} /></div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Total Transparency</h4>
                <p className="text-sm text-gray-600">Eliminates ghost assets and enforces strict verification protocols across all state departments.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Budget Optimization</h4>
                <p className="text-sm text-gray-600">Prevents over-purchasing by ensuring underutilized assets are reallocated before new tenders are passed.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-4"><Server size={24} /></div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Centralized Registry</h4>
                <p className="text-sm text-gray-600">A single source of truth for all government hardware, vehicles, and infrastructure.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center mb-4"><Users size={24} /></div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Role-Based Access</h4>
                <p className="text-sm text-gray-600">Strict separation of duties between Procurement Officers, Dept Heads, and CAG Auditors.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0b1e3c] text-white py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-blue-200">Designed & Developed for Govt Asset Lifecycle Management System</p>
          <p className="text-xs text-blue-400 mt-2">© 2026 National Informatics Centre (NIC). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;