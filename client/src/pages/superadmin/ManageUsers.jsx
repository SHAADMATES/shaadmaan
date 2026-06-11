import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { UserPlus, Trash2, ShieldAlert, Sparkles, User, Key, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import Toast from '../../components/Toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('admin');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    studentId: '',
    admissionNumber: '',
    class: '',
    wing: '',
    dob: '',
    phone: '',
    email: '',
  });

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/superadmin/users');
      setUsers(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role };
      await api.post('/superadmin/users', payload);
      setToastType('success');
      setToastMessage(`User account @${formData.username} created successfully!`);
      // Reset form
      setFormData({
        username: '',
        password: '',
        name: '',
        studentId: '',
        admissionNumber: '',
        class: '',
        wing: '',
        dob: '',
        phone: '',
        email: '',
      });
      fetchUsers();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete account @${username}?`)) return;

    try {
      await api.delete(`/superadmin/users/${id}`);
      setToastType('success');
      setToastMessage(`Account @${username} has been deleted.`);
      fetchUsers();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          Manage System Users
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Provision accounts for system administrators, Wing Chairmen, Treasurers, and Students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Add User Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          <h3 className="text-lg font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <UserPlus size={20} className="text-royal" />
            <span>Provision User Account</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal transition-all"
              >
                <option value="admin">System Admin</option>
                <option value="wing_chairman">Wing Chairman</option>
                <option value="treasurer">Treasurer</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Core credentials */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="e.g. jdoe"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
              />
            </div>

            {/* Conditional Fields: Wing Chairman / Student */}
            {(role === 'wing_chairman' || role === 'student') && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wing Assignment</label>
                    <select
                      name="wing"
                      value={formData.wing}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    >
                      <option value="">Select Wing</option>
                      <option value="Red Wing">Red Wing</option>
                      <option value="Blue Wing">Blue Wing</option>
                      <option value="Green Wing">Green Wing</option>
                      <option value="Yellow Wing">Yellow Wing</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+12345678"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                  />
                </div>
              </div>
            )}

            {/* Conditional Fields: Student Only */}
            {role === 'student' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/40 pt-4 animate-scale">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      placeholder="e.g. STU1024"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admission Number</label>
                    <input
                      type="text"
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. ADM2026-99"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class / Grade</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Grade 10A"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-royal to-cyan text-white py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 transform active:scale-95"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Right Column - User Accounts Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Layers size={20} className="text-cyan" />
              <span>User Index Directory</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {users.length} Users Registered
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider bg-slate-500/5">
                  <th className="p-3">User & Handle</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Assigned Info</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-450 italic">
                      No accounts provisioned.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-white">
                          {u.profile?.name || u.username}
                        </div>
                        <div className="text-slate-450 font-mono text-[10px]">@{u.username}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-rose-500/10 text-rose-500'
                              : u.role === 'admin'
                              ? 'bg-purple-500/10 text-purple-500'
                              : u.role === 'wing_chairman'
                              ? 'bg-amber-500/10 text-amber-500'
                              : u.role === 'treasurer'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {u.role.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.role === 'student' && (
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {u.profile?.wing || 'No Wing'}
                            </span>
                            <div className="text-[10px] text-slate-450">ID: {u.profile?.studentId}</div>
                          </div>
                        )}
                        {u.role === 'wing_chairman' && (
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {u.profile?.wing || 'No Wing'}
                          </span>
                        )}
                        {!['student', 'wing_chairman'].includes(u.role) && (
                          <span className="text-slate-450 italic">System access</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.role !== 'super_admin' ? (
                          <button
                            onClick={() => handleDelete(u._id, u.username)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete User Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[10px] font-mono">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

export default ManageUsers;
