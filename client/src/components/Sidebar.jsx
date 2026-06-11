import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Calendar, 
  FileSpreadsheet, 
  Trophy, 
  Settings, 
  LogOut, 
  FolderKanban, 
  PlusCircle, 
  CheckSquare, 
  UserCircle,
  Database,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  BookOpen,
  Award,
  BookMarked,
  KeyRound,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, profileDetails } = useAuth();

  if (!user) return null;

  const superAdminLinks = [
    { to: '/super/dashboard', label: 'Super Dashboard', icon: LayoutDashboard },
    { to: '/super/users', label: 'Manage Users', icon: Users },
    { to: '/super/backups', label: 'System Backups', icon: Database },
    { to: '/super/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Manage Students', icon: Users },
    { to: '/admin/wings', label: 'Manage Wings', icon: UserSquare2 },
    { to: '/admin/users', label: 'User Directory', icon: UserCircle },
    { to: '/admin/forms', label: 'Forms Management', icon: FileSpreadsheet },
    { to: '/admin/publications', label: 'Moderate Articles', icon: BookMarked },
    { to: '/admin/programs', label: 'Manage Programs', icon: FolderKanban },
    { to: '/admin/schedule', label: 'Program Schedule', icon: Calendar },
    { to: '/admin/results', label: 'Add Results', icon: Trophy },
    { to: '/admin/certificates', label: 'Manage Certificates', icon: Award },
    { to: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const chairmanLinks = [
    { to: '/chairman/dashboard', label: 'Chairman Dashboard', icon: LayoutDashboard },
    { to: '/chairman/add-program', label: 'Propose Program', icon: PlusCircle },
    { to: '/chairman/programs', label: 'Wing Programs', icon: FolderKanban },
    { to: '/chairman/students', label: 'Registered Students', icon: Users },
    { to: '/chairman/schedule', label: 'Schedules', icon: Calendar },
    { to: '/chairman/results', label: 'Results', icon: Trophy },
  ];

  const treasurerLinks = [
    { to: '/treasurer/dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
    { to: '/treasurer/transactions', label: 'Transactions Ledger', icon: DollarSign },
    { to: '/treasurer/reports', label: 'Finance Reports', icon: FileSpreadsheet },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/student/available-programs', label: 'Available Activities', icon: FolderKanban },
    { to: '/student/my-registrations', label: 'My Registrations', icon: CheckSquare },
    { to: '/student/schedule', label: 'Timeline Schedule', icon: Calendar },
    { to: '/student/my-results', label: 'My Results', icon: Trophy },
    { to: '/student/certificates', label: 'My Certificates', icon: Award },
    { to: '/student/publications', label: 'My Publications', icon: BookMarked },
    { to: '/student/profile', label: 'Profile Settings', icon: UserCircle },
  ];

  const getLinks = () => {
    if (user.role === 'super_admin') return superAdminLinks;
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'wing_chairman') return chairmanLinks;
    if (user.role === 'treasurer') return treasurerLinks;
    if (user.role === 'student') return studentLinks;
    return [];
  };

  const getRoleLabel = () => {
    if (user.role === 'super_admin') return 'Super Admin';
    if (user.role === 'admin') return 'Admin Portal';
    if (user.role === 'wing_chairman') return `${profileDetails?.wing || 'Wing'} Chairman`;
    if (user.role === 'treasurer') return 'Treasurer Desk';
    if (user.role === 'student') return `${profileDetails?.wing || 'Wing'} Student`;
    return '';
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-955 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold font-sans tracking-wide bg-gradient-to-r from-cyan to-royal-light bg-clip-text text-transparent">
              Shaad-Mates
            </span>
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* User profile segment */}
        <div className="p-4 mx-4 mt-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logged in as</p>
          <p className="mt-1 font-semibold text-white truncate">{profileDetails?.name || user.username}</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-royal/20 text-cyan rounded-md border border-royal/30">
            {getRoleLabel()}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-royal text-white glow-blue' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={18} className="mr-3" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Change Password link for all roles */}
        <div className="px-4 py-2">
          <NavLink
            to="/account/change-password"
            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:bg-amber-500/10 hover:text-amber-400'
              }`
            }
          >
            <KeyRound size={18} className="mr-3" />
            <span>Change Password</span>
          </NavLink>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 rounded-xl transition-colors duration-200"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
