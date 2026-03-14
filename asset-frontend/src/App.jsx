import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT YOUR FILES ---
import PublicHome from './components/PublicHome'; 
import Login from './pages/Login'; 
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <Routes>
      
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<Login />} />

      {/* --- SECURE ROUTES --- */}
      <Route path="/super-admin" element={<SuperAdminDashboard />} />

      {/* --- FALLBACK ROUTE --- */}
      {/* Redirects any unknown URLs back to the Home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;