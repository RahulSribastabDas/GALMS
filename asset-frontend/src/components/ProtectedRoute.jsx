import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token'); // <-- NEW: Grab the JWT token
  
  // 1. Check if user AND token exist
  // If either is missing, they are not properly authenticated.
  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  // 2. Normalize Role (Uppercase default)
  const userRole = (user.role || '').toUpperCase();

  // 3. Check if role is allowed
  if (!allowedRoles.includes(userRole)) {
    // If logged in but wrong role, send them back to login 
    // to prevent unauthorized access to other department dashboards
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;