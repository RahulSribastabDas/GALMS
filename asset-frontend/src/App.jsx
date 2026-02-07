import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // Priya
import ProcurementDashboard from './pages/ProcurementDashboard'; // Amit
import ProcurementForm from './pages/ProcurementForm'; // Amit's Form
import EmployeeDashboard from './pages/EmployeeDashboard'; // Rahul (NEW)

// NOTE: You can create placeholders for Auditor/SuperAdmin if not made yet
// import AuditorDashboard from './pages/AuditorDashboard';
// import SuperAdminDashboard from './pages/SuperAdminDashboard';

import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      {/* Public Route (Login) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* --- SECURE ZONE: DEPT HEAD (Priya) --- */}
      <Route element={<ProtectedRoute allowedRoles={['DEPT_HEAD']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* --- SECURE ZONE: PROCUREMENT (Amit) --- */}
      <Route element={<ProtectedRoute allowedRoles={['PROCUREMENT_OFFICER']} />}>
        <Route path="/procurement" element={<ProcurementDashboard />} />
        <Route path="/procurement/add" element={<ProcurementForm />} />
      </Route>

      {/* --- SECURE ZONE: EMPLOYEE (Rahul) --- */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'GOVT_EMPLOYEE']} />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Route>

      {/* --- PLACEHOLDERS FOR FUTURE EXPANSION --- */}
      {/* <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['AUDITOR']} />}>
        <Route path="/auditor" element={<AuditorDashboard />} />
      </Route> 
      */}

      {/* Catch-all: Redirect unknown URLs back to Login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;