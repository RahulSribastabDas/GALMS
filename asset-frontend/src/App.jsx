import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT YOUR FILES ---
import PublicHome from './components/PublicHome'; 
import Login from './pages/Login'; 
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import About from './components/About'; // Adjust path if it is in './pages/About'
import CAGDashboard from './pages/CAGDashboard'; // Or './components/CAGDashboard'
import PODashboard from './pages/PODashboard'; // Or './components/PODashboard'
import DeptDashboard from './pages/DeptDashboard'; // Adjust path if needed
import EmployeeDashboard from './pages/EmployeeDashboard';


function App() {
  return (
    <Routes>
      
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<PublicHome />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />

      {/* --- SECURE ROUTES --- */}
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/cag-dashboard" element={<CAGDashboard />} />
      <Route path="/po-dashboard" element={<PODashboard />} />
      <Route path="/dept-dashboard" element={<DeptDashboard />} />
      
      {/* THIS WAS THE MISSING LINE! */}
      <Route path="/employee" element={<EmployeeDashboard />} />

      {/* --- FALLBACK ROUTE --- */}
      {/* Redirects any unknown URLs back to the Home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;