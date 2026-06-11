import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-dark transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Workspace */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Top bar controls */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-100/50 dark:bg-navy/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
