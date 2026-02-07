import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Normalize Role (Uppercase default)
  const userRole = (user.role || '').toUpperCase();

  // 3. Check if role is allowed
  if (!allowedRoles.includes(userRole)) {
    // If logged in but wrong role, send them to their correct dashboard
    // or back to login to prevent "White Screen of Death"
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;