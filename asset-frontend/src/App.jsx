import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; 
import ProcurementDashboard from './pages/ProcurementDashboard'; 
import ProcurementForm from './pages/ProcurementForm'; 
import EmployeeDashboard from './pages/EmployeeDashboard'; 

// --- NEW IMPORTS ACTIVATED ---
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AuditorDashboard from './pages/AuditorDashboard'; 

import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* --- SECURE ZONE: DEPT HEAD --- */}
      <Route element={<ProtectedRoute allowedRoles={['DEPT_HEAD']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* --- SECURE ZONE: PROCUREMENT --- */}
      <Route element={<ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']} />}>
        <Route path="/procurement" element={<ProcurementDashboard />} />
        <Route path="/procurement/add" element={<ProcurementForm />} />
      </Route>

      {/* --- SECURE ZONE: EMPLOYEE --- */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'GOVT_EMPLOYEE']} />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Route>

      {/* --- SECURE ZONE: SYSTEM ADMIN (NIC) --- */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
      </Route>

      {/* --- SECURE ZONE: CAG AUDITOR --- */}
      <Route element={<ProtectedRoute allowedRoles={['CAG_AUDITOR']} />}>
        <Route path="/auditor" element={<AuditorDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;