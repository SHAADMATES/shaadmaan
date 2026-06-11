import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Calendar, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [approvedPrograms, setApprovedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form State
  const [programId, setProgramId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const schRes = await api.get('/admin/schedules');
      setSchedules(schRes.data);

      const progRes = await api.get('/admin/programs');
      // Only show approved programs for scheduling
      const approvedOnly = progRes.data.filter(p => p.approved);
      setApprovedPrograms(approvedOnly);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setProgramId('');
    setDate('');
    setTime('');
    setVenue('');
    setDescription('');
    setErrorMsg('');
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditMode(true);
    setSelectedSchedule(schedule);
    setProgramId(schedule.programId?._id || '');
    // format date as YYYY-MM-DD
    const dateObj = new Date(schedule.date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    setDate(formattedDate);
    setTime(schedule.time);
    setVenue(schedule.venue);
    setDescription(schedule.description || '');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programId || !date || !time || !venue) {
      setErrorMsg('All marked fields are required.');
      return;
    }

    const payload = { programId, date, time, venue, description };

    try {
      if (editMode) {
        await api.put(`/admin/schedules/${selectedSchedule._id}`, payload);
        setToastType('success');
        setToastMessage('Program schedule updated successfully.');
      } else {
        await api.post('/admin/schedules', payload);
        setToastType('success');
        setToastMessage('New schedule slot created.');
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit schedule.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/schedules/${deleteId}`);
      setToastType('success');
      setToastMessage('Schedule slot deleted.');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete schedule slot.');
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Top Banner and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
          <Calendar className="text-royal" />
          <div>
            <h3 className="font-bold text-sm">Draft Timelines</h3>
            <p className="text-xs text-slate-400">Manage times, venues, and descriptions for active events.</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-royal hover:bg-royal-dark text-white font-semibold rounded-2xl shadow hover:shadow-lg flex items-center justify-center transition-all glow-blue"
        >
          <Plus size={16} className="mr-2" /> Schedule Program
        </button>
      </div>

      {/* Main Timetable listing */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading schedules...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Program Title</th>
                  <th className="p-4">Wing</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Time & Venue</th>
                  <th className="p-4">Notes / Info</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      No schedule slots created yet. Click "Schedule Program" to get started.
                    </td>
                  </tr>
                ) : (
                  schedules.map((sch) => (
                    <tr key={sch._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                        {sch.programId?.title || 'Unknown Program'}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-500 uppercase">
                        {sch.programId?.wing || 'N/A'}
                      </td>
                      <td className="p-4 font-medium">
                        {new Date(sch.date).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <p className="font-semibold text-royal dark:text-cyan">{sch.time}</p>
                        <p className="text-slate-500">{sch.venue}</p>
                      </td>
                      <td className="p-4 text-xs text-slate-500 max-w-xs truncate">
                        {sch.description || 'No scheduling notes.'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            className="p-2 text-slate-500 hover:text-royal hover:bg-royal/10 dark:hover:bg-royal/20 rounded-xl transition-all"
                            title="Edit schedule slot"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(sch._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                            title="Remove schedule slot"
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
          <div className="glass-card border rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">
                {editMode ? 'Modify Timeline' : 'Schedule Program'}
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
              {/* Program Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Select Approved Program *</label>
                <select
                  value={programId}
                  onChange={(e) => {
                    setProgramId(e.target.value);
                    const selected = approvedPrograms.find(p => p._id === e.target.value);
                    if (selected) {
                      // autofill defaults
                      const formattedDate = new Date(selected.date).toISOString().split('T')[0];
                      setDate(formattedDate);
                      setTime(selected.time);
                      setVenue(selected.venue);
                    }
                  }}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  disabled={editMode}
                >
                  <option value="">Select Program</option>
                  {approvedPrograms.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.wing})</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                />
              </div>

              {/* Time */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Time Slot *</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. 10:00 AM - 12:30 PM"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Venue *</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. Auditorium Hall"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Scheduling Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl min-h-[80px]"
                  placeholder="Provide any additional items like assembly coordinates, guidelines..."
                />
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
                  {editMode ? 'Save Changes' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-sans">Delete Schedule Slot?</h4>
              <p className="text-xs text-slate-400">
                This will remove the timetable allocation. The program itself will not be deleted.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Remove
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

export default SchedulePage;
