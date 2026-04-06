import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENTS ---
import PublicHome from './components/PublicHome'; 
import About from './components/About'; 
import UserManual from './components/UserManual'; 
import Directory from './components/Directory'; 

// --- PAGES ---
import Login from './pages/Login'; 
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CAGDashboard from './pages/CAGDashboard'; 
import PODashboard from './pages/PODashboard'; 
import DeptDashboard from './pages/DeptDashboard'; 
import EmployeeDashboard from './pages/EmployeeDashboard';
import TrackingDashboard from './pages/TrackingDashboard';
import ProcurementForm from './pages/ProcurementForm';

function App() {
  return (
    <Routes>
      
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<PublicHome />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/manual" element={<UserManual />} />
      <Route path="/directory" element={<Directory />} />

      {/* --- SECURE ROUTES --- */}
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/cag-dashboard" element={<CAGDashboard />} />
      <Route path="/tracking" element={<TrackingDashboard />} />
      <Route path="/po-dashboard" element={<PODashboard />} />
      <Route path="/procurement/new" element={<ProcurementForm />} />
      <Route path="/dept-dashboard" element={<DeptDashboard />} />
      <Route path="/employee" element={<EmployeeDashboard />} />

      {/* --- FALLBACK ROUTE --- */}
      {/* Redirects any unknown URLs back to the Home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;