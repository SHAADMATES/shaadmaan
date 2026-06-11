import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Check, X, Trash2, Search, Filter, AlertCircle, Info } from 'lucide-react';
import Toast from '../../components/Toast';

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');

  // Modals / Details
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/programs');
      setPrograms(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleApprove = async (id, currentStatus) => {
    try {
      await api.put(`/admin/programs/${id}/approve`, { approved: !currentStatus });
      setToastType('success');
      setToastMessage(!currentStatus ? 'Program approved successfully.' : 'Program approval revoked.');
      fetchPrograms();
      if (selectedProgram && selectedProgram._id === id) {
        setSelectedProgram(prev => ({ ...prev, approved: !currentStatus }));
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to update program approval.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/programs/${deleteId}`);
      setToastType('success');
      setToastMessage('Program deleted successfully.');
      setSelectedProgram(null);
      setDeleteId(null);
      fetchPrograms();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete program.');
      setDeleteId(null);
    }
  };

  // Filter logic
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWing = wingFilter === '' || p.wing === wingFilter;
    const matchesType = typeFilter === '' || p.type === typeFilter;
    
    let matchesApproval = true;
    if (approvalFilter === 'approved') matchesApproval = p.approved === true;
    if (approvalFilter === 'pending') matchesApproval = p.approved === false;

    return matchesSearch && matchesWing && matchesType && matchesApproval;
  });

  const wingsList = [...new Set(programs.map(p => p.wing))].filter(Boolean);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Search and Filters */}
      <div className="bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
            <input
              type="text"
              placeholder="Search programs by title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none"
            />
          </div>

          {/* Wing Filter */}
          <select
            value={wingFilter}
            onChange={(e) => setWingFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm focus:outline-none"
          >
            <option value="">All Wings</option>
            {wingsList.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="group">Group</option>
          </select>

          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm focus:outline-none"
          >
            <option value="">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Programs Table */}
        <div className="lg:col-span-2 glass-card border rounded-3xl overflow-hidden shadow-lg h-fit">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading programs...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                    <th className="p-4">Program Title</th>
                    <th className="p-4">Wing</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Approval</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredPrograms.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                        No programs found.
                      </td>
                    </tr>
                  ) : (
                    filteredPrograms.map((p) => (
                      <tr 
                        key={p._id} 
                        className={`hover:bg-slate-500/5 transition-colors cursor-pointer ${
                          selectedProgram?._id === p._id ? 'bg-royal/5 dark:bg-royal/10' : ''
                        }`}
                        onClick={() => setSelectedProgram(p)}
                      >
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{p.title}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{p.wing}</td>
                        <td className="p-4 uppercase text-xs font-semibold">{p.type}</td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(p._id, p.approved);
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                              p.approved
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30'
                                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30'
                            }`}
                          >
                            {p.approved ? (
                              <><Check size={12} className="mr-1" /> Approved</>
                            ) : (
                              <><X size={12} className="mr-1" /> Pending</>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(p._id);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                            title="Delete Program"
                          >
                            <Trash2 size={16} />
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

        {/* Right 1 Col: Program Detail Panel */}
        <div className="glass-card border rounded-3xl p-6 shadow-lg h-fit space-y-6">
          {selectedProgram ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{selectedProgram.wing}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${
                  selectedProgram.type === 'single'
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20'
                }`}>
                  {selectedProgram.type}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white leading-tight">
                  {selectedProgram.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Proposed on: {new Date(selectedProgram.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/50 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Date</p>
                  <p className="font-semibold">{new Date(selectedProgram.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Time</p>
                  <p className="font-semibold">{selectedProgram.time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Venue</p>
                  <p className="font-semibold">{selectedProgram.venue}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Max Registrations</p>
                  <p className="font-semibold">{selectedProgram.maxParticipants || 'Unlimited'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Status</p>
                  <p className="font-semibold text-royal">{selectedProgram.status}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-slate-400">Description</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-500/5 p-3 rounded-xl">
                  {selectedProgram.description || 'No description provided.'}
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-slate-400">Rules & Instructions</h4>
                {selectedProgram.rules && selectedProgram.rules.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 bg-slate-500/5 p-3 rounded-xl text-slate-600 dark:text-slate-300">
                    {selectedProgram.rules.map((rule, index) => (
                      <li key={index} className="leading-relaxed">{rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic bg-slate-500/5 p-3 rounded-xl">No specific rules defined.</p>
                )}
              </div>

              {/* Approve/Disapprove Action */}
              <button
                onClick={() => handleApprove(selectedProgram._id, selectedProgram.approved)}
                className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all ${
                  selectedProgram.approved
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : 'bg-emerald hover:bg-emerald-dark glow-blue'
                }`}
              >
                {selectedProgram.approved ? 'Revoke Approval' : 'Approve Program'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 text-sm space-y-2">
              <Info size={32} className="text-slate-300 dark:text-slate-600" />
              <p className="font-semibold">No Program Selected</p>
              <p className="text-xs">Click a program in the list to review details and approve.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-sans">Delete Program proposal?</h4>
              <p className="text-xs text-slate-400">
                Deleting this program will delete all associated student registrations, schedule slots, and results permanently.
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

export default ManagePrograms;
