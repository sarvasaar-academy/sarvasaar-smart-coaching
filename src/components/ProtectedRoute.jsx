import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user role hasn't resolved yet during real-time login transitions, wait gracefully
  if (currentUser && !userRole) {
    return <div className="min-h-screen flex items-center justify-center bg-[#030305] text-white/50 text-sm tracking-widest uppercase">Verifying Clearances...</div>;
  }

  // If a role is required but user doesn't have it, send them home
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
