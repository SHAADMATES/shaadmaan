import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { Shield, Key, User, Eye, EyeOff, Check, AlertCircle, Search, RefreshCw, Lock } from 'lucide-react';
import Toast from '../components/Toast';

const ChangePassword = () => {
  const { user, logout } = useAuth();

  // Self-change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selfLoading, setSelfLoading] = useState(false);
  const [selfError, setSelfError] = useState('');

  // Super Admin reset section
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewUsername, setResetNewUsername] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchAllUsers();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/superadmin/users');
      setAllUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  const handleSelfChange = async (e) => {
    e.preventDefault();
    setSelfError('');

    if (!currentPassword) {
      setSelfError('Please enter your current password.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setSelfError('New passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setSelfError('New password must be at least 6 characters.');
      return;
    }
    if (!newPassword && !newUsername) {
      setSelfError('Please enter a new password or new username.');
      return;
    }

    setSelfLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword: newPassword || undefined,
        newUsername: newUsername || undefined,
      });

      showToast(res.data.message, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewUsername('');

      // If password changed, logout and redirect to login
      if (newPassword) {
        setTimeout(() => {
          logout();
        }, 2500);
      }
    } catch (err) {
      setSelfError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setSelfLoading(false);
    }
  };

  const handleAdminReset = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!selectedUser) {
      setResetError('Please select a user to reset.');
      return;
    }
    if (!resetNewPassword && !resetNewUsername) {
      setResetError('Please provide a new password or new username.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.put(`/superadmin/users/${selectedUser._id}/reset-password`, {
        newPassword: resetNewPassword || undefined,
        newUsername: resetNewUsername || undefined,
      });

      showToast(`✅ Credentials for @${selectedUser.username} updated successfully.`, 'success');
      setSelectedUser(null);
      setResetNewPassword('');
      setResetNewUsername('');
      fetchAllUsers();
    } catch (err) {
      setResetError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  ).filter(u => u._id !== user?._id);

  const roleColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      admin: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      wing_chairman: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      treasurer: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      student: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    };
    return colors[role] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      wing_chairman: 'Wing Chairman',
      treasurer: 'Treasurer',
      student: 'Student',
    };
    return labels[role] || role;
  };

  return (
    <div className="p-6 space-y-8 animate-scale max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-emerald-400 blur-3xl"></div>
          <div className="absolute bottom-2 left-4 w-32 h-32 rounded-full bg-royal blur-3xl"></div>
        </div>
        <div className="relative flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">Account Security</h2>
            <p className="text-sm text-slate-400 mt-1">Manage your login credentials and account security settings.</p>
          </div>
        </div>
      </div>

      {/* Self Change Password Form */}
      <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-royal/10 text-royal flex items-center justify-center">
            <Key size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Change My Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your own username or password. You will be logged out after a password change.</p>
          </div>
        </div>

        <form onSubmit={handleSelfChange} className="space-y-4">
          {selfError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
              <AlertCircle size={14} className="mr-2 shrink-0" />
              <span>{selfError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Current Password */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 flex items-center">
                <Lock size={11} className="mr-1 text-rose-500" /> Current Password (required)
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 border-t dark:border-slate-800 pt-3">
              <p className="text-xs text-slate-400 font-medium">Leave a field blank to keep it unchanged.</p>
            </div>

            {/* New Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center">
                <User size={11} className="mr-1 text-royal" /> New Username (optional)
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                placeholder="New username..."
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center">
                <Key size={11} className="mr-1 text-emerald-500" /> New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                  placeholder="New password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500 flex items-center">
                  <Check size={11} className="mr-1 text-emerald-500" /> Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 dark:bg-slate-900 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-rose-400 dark:border-rose-600'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-400 dark:border-emerald-700'
                      : 'dark:border-slate-700'
                  }`}
                  placeholder="Confirm new password"
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-rose-500 font-medium">Passwords do not match.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={selfLoading}
              className="px-8 py-2.5 bg-gradient-to-r from-royal to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-royal/30 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {selfLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Key size={16} />
              )}
              <span>{selfLoading ? 'Updating...' : 'Update My Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Super Admin: Reset Any User */}
      {user?.role === 'super_admin' && (
        <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Reset Any User Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">As Super Admin, you can reset credentials for any account in the system.</p>
            </div>
          </div>

          {/* User Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Search by username or role..."
              />
            </div>

            {/* User List */}
            <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No users found.</p>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setResetNewPassword('');
                      setResetNewUsername(u.username);
                      setResetError('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedUser?._id === u._id
                        ? 'bg-amber-500/10 border-amber-500/40 dark:border-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-500/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-600 dark:text-slate-300">
                        {u.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">@{u.username}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md border ${roleColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </div>
                    </div>
                    {selectedUser?._id === u._id && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Reset Form */}
          {selectedUser && (
            <form onSubmit={handleAdminReset} className="border-t dark:border-slate-800 pt-5 space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center font-bold text-xs uppercase text-amber-500">
                  {selectedUser.username?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Editing @{selectedUser.username}</p>
                  <p className="text-xs text-slate-500">{getRoleLabel(selectedUser.role)}</p>
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
                  <AlertCircle size={14} className="mr-2 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">New Username</label>
                  <input
                    type="text"
                    value={resetNewUsername}
                    onChange={(e) => setResetNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="New username..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">New Password</label>
                  <input
                    type="text"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="New password..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold border dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center space-x-2 text-sm"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  <span>{resetLoading ? 'Resetting...' : 'Reset Credentials'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default ChangePassword;
