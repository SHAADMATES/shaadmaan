import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Calendar, 
  FolderKanban, 
  TrendingUp, 
  Database, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  X, 
  ArrowRight,
  Command
} from 'lucide-react';

const CommandModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // Build commands list based on user role
  const allCommands = [
    // Superadmin & Admin
    { title: 'Superadmin Dashboard', path: '/super/dashboard', role: ['super_admin'], icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Manage System Users', path: '/super/users', role: ['super_admin'], icon: Users, category: 'Management' },
    { title: 'System Backups', path: '/super/backups', role: ['super_admin'], icon: Database, category: 'System' },
    { title: 'Audit Logs', path: '/super/audit-logs', role: ['super_admin'], icon: ShieldCheck, category: 'System' },
    
    // Admin
    { title: 'Admin Dashboard', path: '/admin/dashboard', role: ['admin', 'super_admin'], icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Manage Students Directory', path: '/admin/students', role: ['admin', 'super_admin'], icon: Users, category: 'Management' },
    { title: 'Universal Bulk Upload (CSV)', path: '/admin/bulk-upload', role: ['admin', 'super_admin'], icon: TrendingUp, category: 'Quick Action' },
    { title: 'Manage Wings', path: '/admin/wings', role: ['admin', 'super_admin'], icon: UserSquare2, category: 'Management' },
    { title: 'Forms Management', path: '/admin/forms', role: ['admin', 'super_admin'], icon: FolderKanban, category: 'Management' },
    { title: 'Program Schedule', path: '/admin/schedule', role: ['admin', 'super_admin'], icon: Calendar, category: 'Navigation' },
    
    // Chairman
    { title: 'Wing Dashboard', path: '/manager/dashboard', role: ['chairman'], icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Propose New Program', path: '/manager/add-program', role: ['chairman'], icon: FolderKanban, category: 'Quick Action' },
    
    // Student
    { title: 'Student Dashboard', path: '/student/dashboard', role: ['student'], icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Explore Available Programs', path: '/student/programs', role: ['student'], icon: BookOpen, category: 'Navigation' },
    { title: 'My Registrations', path: '/student/registrations', role: ['student'], icon: Calendar, category: 'Navigation' },
    { title: 'My Certificates', path: '/student/certificates', role: ['student'], icon: Award, category: 'Navigation' },
    { title: 'My Profile', path: '/student/profile', role: ['student'], icon: Users, category: 'Account' },
  ];

  const filteredCommands = allCommands.filter(cmd => {
    const roleMatch = cmd.role.includes(user.role) || user.role === 'super_admin';
    const queryMatch = cmd.title.toLowerCase().includes(query.toLowerCase()) || 
                       cmd.category.toLowerCase().includes(query.toLowerCase());
    return roleMatch && queryMatch;
  });

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search size={20} className="text-slate-400 mr-3 shrink-0" />
          <input 
            type="text"
            placeholder="Type a command or search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium"
          />
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">ESC</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {cmd.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <Command size={14} />
            <span>Command Palette Active</span>
          </div>
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">Ctrl + K</kbd> to toggle</span>
        </div>

      </div>
    </div>
  );
};

export default CommandModal;
