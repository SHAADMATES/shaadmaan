import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, User, Key, Shield, Search, FileSpreadsheet, Printer, X, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('treasurer');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('treasurer');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !role) {
      setErrorMsg('Username, password, and role are required.');
      return;
    }

    try {
      await api.post('/admin/users', { username, password, role });
      setToastType('success');
      setToastMessage(`User @${username} registered successfully.`);
      setIsOpen(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Username', 'Plain Password', 'Account Role', 'Creation Date'];
    const rows = users.map(u => [
      u.username,
      u.plainPassword || 'N/A',
      u.role.toUpperCase().replace('_', ' '),
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ShaadMates_AllUsers_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastType('success');
    setToastMessage('User list exported successfully.');
  };

  const triggerPrint = async () => {
    const input = document.getElementById('user-table-area');
    if (!input) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShaadMates_AllUsers.pdf');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = u.username.toLowerCase().includes(query);
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            User Logins Directory
          </h2>
          <p className="text-sm text-slate-350 mt-1">
            Display credentials and create custom administrative or treasurer logins.
          </p>
        </div>
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-royal hover:bg-royal-dark text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <Printer size={14} />
            <span>Print List</span>
          </button>
          <button
            onClick={() => { resetForm(); setIsOpen(true); }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan to-royal text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <Plus size={14} />
            <span>Add User Login</span>
          </button>
        </div>
      </div>

      {/* Filters - hidden in print */}
      <div className="flex flex-col sm:flex-row gap-4 items-center print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="wing_chairman">Wing Chairman</option>
          <option value="treasurer">Treasurer</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Main Table */}
      <div id="user-table-area" className="glass-card border rounded-3xl overflow-hidden shadow-lg print:border-none print:shadow-none">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading user list...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Username</th>
                  <th className="p-4">Password</th>
                  <th className="p-4">Account Role</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                      No user logins found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-100">@{u.username}</td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{u.plainPassword || '••••••••'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'super_admin' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/25 dark:text-rose-350' :
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/25 dark:text-purple-350' :
                          u.role === 'wing_chairman' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/25 dark:text-amber-350' :
                          u.role === 'treasurer' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-350' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-950/25 dark:text-blue-350'
                        }`}>
                          {u.role.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 print:hidden">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scale">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">Create User Login</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
                <AlertCircle size={14} className="mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="treasurer_jack"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                >
                  <option value="admin">System Admin</option>
                  <option value="treasurer">Treasurer</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-royal hover:bg-royal-dark text-white font-semibold rounded-xl text-xs transition-all shadow glow-blue"
                >
                  Create Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default AllUsers;
