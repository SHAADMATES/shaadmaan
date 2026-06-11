import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Check, X, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const MyPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingProgram, setEditingProgram] = useState(null);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMyPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chairman/programs');
      setPrograms(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPrograms();
  }, []);

  const handleOpenEdit = (prog) => {
    if (prog.approved) {
      setToastType('error');
      setToastMessage('Cannot edit a program after it has been approved by the Admin.');
      return;
    }
    setEditingProgram(prog);
    setTitle(prog.title);
    setVenue(prog.venue);
    setTime(prog.time);
    const formattedDate = new Date(prog.date).toISOString().split('T')[0];
    setDate(formattedDate);
    setDescription(prog.description || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, venue, time, date, description };
      await api.put(`/chairman/programs/${editingProgram._id}`, payload);
      setToastType('success');
      setToastMessage('Program updated successfully.');
      setEditingProgram(null);
      fetchMyPrograms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update program.');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Main List */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-4 text-slate-450" size={28} />
            Loading proposed programs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Program Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Approval State</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400 font-medium">
                      No programs proposed yet. Navigate to "Add Program" to draft your first event.
                    </td>
                  </tr>
                ) : (
                  programs.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{p.title}</td>
                      <td className="p-4 uppercase text-xs font-semibold text-slate-500">{p.type}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          p.approved
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/20'
                            : 'bg-amber-50 text-amber-600 border-amber-250 dark:bg-amber-950/20'
                        }`}>
                          {p.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-500">{p.venue}</td>
                      <td className="p-4 font-semibold text-xs text-royal">{p.status}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className={`p-2 rounded-xl transition-all ${
                            p.approved
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                              : 'text-slate-500 hover:text-royal hover:bg-royal/10 dark:hover:bg-royal/20'
                          }`}
                          disabled={p.approved}
                          title={p.approved ? 'Cannot edit approved programs' : 'Edit program'}
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">Modify Proposed Program</h3>
              <button onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
                <AlertCircle size={14} className="mr-2" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Program Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl min-h-[80px]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-royal hover:bg-royal-dark text-white font-semibold rounded-xl transition-all shadow glow-blue"
                >
                  Save Changes
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

export default MyPrograms;
