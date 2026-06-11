import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Menu, User, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, profileDetails, logout, darkMode, toggleDarkMode } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  if (!user) return null;

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/students')) return 'Manage Students';
    if (path.includes('/wing-managers')) return 'Manage Wing Managers';
    if (path.includes('/add-program')) return 'Add Program';
    if (path.includes('/programs')) return 'Programs Management';
    if (path.includes('/available-programs')) return 'Available Programs';
    if (path.includes('/my-registrations')) return 'My Registrations';
    if (path.includes('/schedule')) return 'Program Schedule';
    if (path.includes('/results')) return 'Program Results';
    if (path.includes('/reports')) return 'System Reports';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'My Profile';
    return 'Shaad-Mates Portal';
  };

  // Mock notifications
  const notifications = [
    { id: 1, text: 'New program scheduled for your Wing!', time: '10 mins ago' },
    { id: 2, text: 'Admin approved your program proposal.', time: '2 hours ago' },
    { id: 3, text: 'Shaad-Mates results published!', time: '1 day ago' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Left: Mobile trigger & title */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-3">
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} className="text-gold" /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-royal rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-scale">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                  <button className="text-xs text-royal hover:underline">Mark all as read</button>
                </div>
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="text-sm border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                      <p className="text-slate-700 dark:text-slate-300">{item.text}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-royal to-cyan flex items-center justify-center text-white font-bold text-sm shadow">
              {(profileDetails?.name || user.username).charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {profileDetails?.name || user.username}
            </span>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user.username}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors text-left"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
