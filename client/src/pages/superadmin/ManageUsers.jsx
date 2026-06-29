import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  UserPlus, Trash2, ShieldAlert, User, Key, Mail, Phone,
  BookOpen, Layers, Search, RefreshCw, Shield, ToggleLeft,
  ToggleRight, Edit3, X, CheckCircle2, AlertCircle, Crown
} from 'lucide-react';
import Toast from '../../components/Toast';

const ROLE_COLORS = {
  super_admin: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  admin: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  wing_chairman: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  treasurer: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  student: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
};

const ROLE_ICONS = {
  super_admin: '👑',
  admin: '🛡️',
  wing_chairman: '🏛️',
  treasurer: '💰',
  student: '🎓',
};

const InputField = ({ label, name, type = 'text', value, onChange, required, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 transition-all"
    />
  </div>
);

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [resetModal, setResetModal] = useState(null); // { userId, username }
  const [roleModal, setRoleModal] = useState(null); // { userId, username, currentRole }
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '', password: '', name: '', studentId: '',
    admissionNumber: '', class: '', wing: '', dob: '', phone: '', email: '',
  });

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const showToast = (msg, type = 'success') => { setToastType(type); setToastMessage(msg); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to fetch user directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, role };
      await api.post('/superadmin/users', payload);
      showToast(`Account @${formData.username} created successfully!`);
      setFormData({ username: '', password: '', name: '', studentId: '', admissionNumber: '', class: '', wing: '', dob: '', phone: '', email: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete account @${username}? This action is irreversible.`)) return;
    try {
      await api.delete(`/superadmin/users/${userId}`);
      showToast(`@${username} deleted.`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const handleToggleStatus = async (userId, username, isActive) => {
    try {
      await api.put(`/superadmin/users/${userId}/toggle-status`);
      showToast(`@${username} ${isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Status toggle failed.', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    try {
      await api.put(`/superadmin/users/${resetModal.userId}/reset-password`, { newPassword });
      showToast(`Password for @${resetModal.username} reset successfully!`);
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed.', 'error');
    }
  };

  const handleChangeRole = async () => {
    if (!newRole || newRole === roleModal?.currentRole) {
      showToast('Please select a different role.', 'error');
      return;
    }
    try {
      await api.put(`/superadmin/users/${roleModal.userId}/role`, { role: newRole });
      showToast(`@${roleModal.username}'s role changed to ${newRole}.`);
      setRoleModal(null);
      setNewRole('');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Role change failed.', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.profile?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'active' ? u.isActive : !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer" />
        <div className="grid grid-cols-1 gap-4">
          {[1,2,3].map(n => <div key={n} className="h-20 rounded-2xl animate-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">

      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">User Directory</h2>
          <p className="text-sm text-slate-400">
            Manage all platform accounts — create users, reset credentials, toggle status, and delete accounts.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button onClick={fetchUsers} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-royal hover:bg-royal-dark text-white font-bold text-sm shadow-lg transition-all"
          >
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            <span>{showForm ? 'Cancel' : 'New Account'}</span>
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6 animate-scale">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <UserPlus size={18} className="text-royal" />
              <span>Create New Account</span>
            </h3>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['admin', 'super_admin', 'wing_chairman', 'treasurer', 'student'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    role === r
                      ? 'bg-royal text-white border-royal shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-royal/50'
                  }`}
                >
                  {ROLE_ICONS[r]} {r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Username *" name="username" value={formData.username} onChange={handleChange} required placeholder="e.g. john_doe" />
              <InputField label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" />
            </div>

            {(role === 'student' || role === 'wing_chairman') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Full Name *" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name" />
                <InputField label="Wing *" name="wing" value={formData.wing} onChange={handleChange} required placeholder="e.g. Science Wing" />
                <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" />
              </div>
            )}

            {role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InputField label="Student ID *" name="studentId" value={formData.studentId} onChange={handleChange} required placeholder="e.g. STU-2024-001" />
                <InputField label="Admission Number *" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required placeholder="e.g. ADM/2024/001" />
                <InputField label="Class *" name="class" value={formData.class} onChange={handleChange} required placeholder="e.g. Class XII" />
                <InputField label="Date of Birth *" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-royal hover:bg-royal-dark text-white rounded-2xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{submitting ? 'Creating...' : 'Create Account'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
        >
          <option value="ALL">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="wing_chairman">Wing Chairman</option>
          <option value="treasurer">Treasurer</option>
          <option value="student">Student</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
        >
          <option value="ALL">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        {['super_admin', 'admin', 'wing_chairman', 'treasurer', 'student'].map(r => (
          <div key={r} className="p-3 rounded-2xl glass-card border">
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">
              {users.filter(u => u.role === r).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {ROLE_ICONS[r]} {r.replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>

      {/* Users List */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold flex items-center space-x-2">
            <Shield size={17} className="text-royal" />
            <span>All Accounts ({filteredUsers.length})</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <User size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm italic">No users match your search.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    {(u.profile?.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="font-bold text-slate-800 dark:text-white">@{u.username}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || ''}`}>
                        {ROLE_ICONS[u.role]} {u.role.replace('_', ' ')}
                      </span>
                      {!u.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    {u.profile?.name && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.profile.name}
                        {u.profile.wing && <span className="ml-2 text-slate-400">• {u.profile.wing}</span>}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:shrink-0">
                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleStatus(u.id, u.username, u.isActive)}
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-xl border transition-all ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                  >
                    {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>

                  {/* Change Role */}
                  <button
                    onClick={() => { setRoleModal({ userId: u.id, username: u.username, currentRole: u.role }); setNewRole(u.role); }}
                    title="Change Role"
                    className="p-2 rounded-xl border bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/20 dark:border-violet-800 dark:text-violet-400 transition-all"
                  >
                    <Crown size={16} />
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={() => { setResetModal({ userId: u.id, username: u.username }); setNewPassword(''); }}
                    title="Reset Password"
                    className="p-2 rounded-xl border bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400 transition-all"
                  >
                    <Key size={16} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    title="Delete User"
                    className="p-2 rounded-xl border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-scale">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl w-full max-w-md mx-4 space-y-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Reset Password</h3>
                <p className="text-sm text-slate-500 mt-1">For @{resetModal.username}</p>
              </div>
              <button onClick={() => setResetModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
              />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setResetModal(null)} className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Cancel
              </button>
              <button onClick={handleResetPassword} className="flex-1 py-2.5 rounded-2xl bg-royal hover:bg-royal-dark text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2">
                <Key size={15} />
                <span>Reset Password</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-scale">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl w-full max-w-md mx-4 space-y-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Change User Role</h3>
                <p className="text-sm text-slate-500 mt-1">@{roleModal.username} — currently <strong>{roleModal.currentRole.replace('_', ' ')}</strong></p>
              </div>
              <button onClick={() => setRoleModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
              >
                <option value="super_admin">👑 Super Admin</option>
                <option value="admin">🛡️ Admin</option>
                <option value="wing_chairman">🏛️ Wing Chairman</option>
                <option value="treasurer">💰 Treasurer</option>
                <option value="student">🎓 Student</option>
              </select>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-xs text-amber-700">
              ⚠️ Changing a user's role will immediately affect their access permissions. Use with caution.
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setRoleModal(null)} className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Cancel
              </button>
              <button onClick={handleChangeRole} className="flex-1 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2">
                <Crown size={15} />
                <span>Change Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default ManageUsers;
