import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-navy-dark">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-royal/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-royal border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if unauthorized
    if (user.role === 'super_admin') return <Navigate to="/super/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'wing_chairman') return <Navigate to="/chairman/dashboard" replace />;
    if (user.role === 'treasurer') return <Navigate to="/treasurer/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
