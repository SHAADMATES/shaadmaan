import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [wing, setWing] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/wing-managers');
      setManagers(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch manager list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setWing('');
    setPhone('');
    setEmail('');
    setErrorMsg('');
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (manager) => {
    setEditMode(true);
    setSelectedManager(manager);
    setUsername(manager.userId?.username || '');
    setPassword('');
    setName(manager.name);
    setWing(manager.wing);
    setPhone(manager.phone || '');
    setEmail(manager.email || '');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !wing || (!editMode && (!username || !password))) {
      setErrorMsg('All marked fields are required.');
      return;
    }

    const payload = { name, wing, phone, email };
    if (!editMode) {
      payload.username = username;
      payload.password = password;
    } else if (password) {
      payload.password = password;
    }

    try {
      if (editMode) {
        await api.put(`/admin/wing-managers/${selectedManager._id}`, payload);
        setToastType('success');
        setToastMessage(`Manager ${name} updated successfully.`);
      } else {
        await api.post('/admin/wing-managers', payload);
        setToastType('success');
        setToastMessage(`Manager ${name} added successfully.`);
      }
      setIsOpen(false);
      fetchManagers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Action failed. Check wing duplication or inputs.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/wing-managers/${deleteId}`);
      setToastType('success');
      setToastMessage('Wing manager deleted successfully.');
      setDeleteId(null);
      fetchManagers();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete manager.');
      setDeleteId(null);
    }
  };

  const filteredManagers = managers.filter(manager => {
    const query = searchQuery.toLowerCase();
    return (
      manager.name.toLowerCase().includes(query) ||
      manager.wing.toLowerCase().includes(query) ||
      (manager.userId?.username && manager.userId.username.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Search and Add bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search by name, wing or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-royal/20"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-royal hover:bg-royal-dark text-white font-semibold rounded-2xl shadow hover:shadow-lg flex items-center justify-center transition-all glow-blue"
        >
          <Plus size={16} className="mr-2" /> Add Wing Manager
        </button>
      </div>

      {/* Main Table Card */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading wing managers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Wing Managed</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                      No wing managers found.
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{manager.name}</td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-light text-emerald dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald/10">
                          {manager.wing}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">@{manager.userId?.username || 'N/A'}</td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p className="truncate font-semibold">{manager.email || 'No Email'}</p>
                        <p>{manager.phone || 'No Phone'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(manager)}
                            className="p-2 text-slate-500 hover:text-royal hover:bg-royal/10 dark:hover:bg-royal/20 rounded-xl transition-all"
                            title="Edit details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(manager._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                            title="Delete manager"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">
                {editMode ? 'Edit Wing Manager' : 'Register Wing Manager'}
              </h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Details (only on create) */}
                {!editMode && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Username *</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                        placeholder="wing_manager_red"
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
                  </>
                )}

                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="Alex Mercer"
                  />
                </div>

                {/* Wing */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Wing to Manage *</label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  >
                    <option value="">Select Wing</option>
                    <option value="Red Wing">Red Wing</option>
                    <option value="Blue Wing">Blue Wing</option>
                    <option value="Green Wing">Green Wing</option>
                    <option value="Yellow Wing">Yellow Wing</option>
                  </select>
                </div>

                {/* Contacts */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="555-0155"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="alex@shaadmates.com"
                  />
                </div>

                {/* Change password on edit */}
                {editMode && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Change Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="Enter new password"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-royal hover:bg-royal-dark text-white font-semibold rounded-xl transition-all shadow glow-blue"
                >
                  {editMode ? 'Save Changes' : 'Register Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-sans">Delete Wing Manager?</h4>
              <p className="text-xs text-slate-400">
                Deleting this profile will also delete their login access. Programs they created will remain but will become orphaned.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                No, Keep
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
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

export default ManageManagers;
