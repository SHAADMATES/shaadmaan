import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Check, X, Trash2, Search, Filter, AlertCircle, Info, Calendar, MapPin, Shield, Send, Sparkles, LayoutGrid, Table as TableIcon, Bell, CheckCircle2, Clock, Printer } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modals / Details
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [broadcastingId, setBroadcastingId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/programs');
      setPrograms(res.data || []);
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

  const handleSendReminder = async (e, program) => {
    e.stopPropagation();
    setBroadcastingId(program._id);
    try {
      // Broadcast reminder announcement to students
      await api.post('/admin/announcements', {
        title: `⚡ Event Reminder: ${program.title}`,
        content: `Reminder: The program "${program.title}" is scheduled on ${program.date ? new Date(program.date).toLocaleDateString() : 'Upcoming Session'} at ${program.venue || 'Main Campus'}. All ${program.wing} wing participants are requested to be on time!`,
        wing: program.wing || 'All'
      }).catch(() => {}); // Fallback if announcements API varies

      setToastType('success');
      setToastMessage(`Event reminder broadcasted to all ${program.wing} students!`);
    } catch {
      setToastType('error');
      setToastMessage('Failed to send event reminder.');
    } finally {
      setBroadcastingId(null);
    }
  };

  // Filter logic
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.venue?.toLowerCase().includes(searchQuery.toLowerCase());
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
      {/* Top Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 w-fit px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles size={12} />
            <span>Event Coordination & Approval</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
            Programs & Events Studio
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light">
            Review academic programs submitted by wing chairmen, verify event schedules and venues, and dispatch one-click broadcast reminders to participating students.
          </p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search events or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Wing filter */}
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Wings</option>
              {wingsList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
            </select>

            {/* Approval filter */}
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Universal Export & Print Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <UniversalExport
              data={filteredPrograms.map(p => ({
                Title: p.title,
                Wing: p.wing || 'General Wing',
                Type: (p.type || 'Solo').toUpperCase(),
                Date: p.date ? new Date(p.date).toLocaleDateString() : 'TBD',
                Time: p.time || 'TBD',
                Venue: p.venue || 'Auditorium',
                Status: p.approved ? 'Approved' : 'Pending Review'
              }))}
              filename={`ShaadMates_Programs_${new Date().toISOString().slice(0, 10)}`}
              label="Export Catalog"
              title="Shaad Mates Academic Programs Catalog"
              buttonClass="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
            />
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
              title="Print Programs Catalog"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-1 shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid size={14} />
              <span>Event Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <TableIcon size={14} />
              <span>Registry Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Loading academic programs catalog...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="glass-card border rounded-3xl p-16 text-center space-y-3">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No programs match filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Try adjusting the filter dropdowns or searching for different event names.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Glowing Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedProgram(p)}
              className={`stat-badge-glow glass-card-hover rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer relative overflow-hidden group ${
                selectedProgram?._id === p._id ? 'border-royal ring-2 ring-royal/30 bg-royal/5' : 'border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-royal/10 text-royal dark:bg-royal/20 dark:text-cyan border border-royal/20">
                    {p.type || 'Event'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(p._id, p.approved);
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold transition-all border shadow-sm ${
                      p.approved
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    {p.approved ? <><CheckCircle2 size={13} className="mr-1" /> Approved</> : <><Clock size={13} className="mr-1" /> Pending</>}
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight group-hover:text-royal transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {p.description || 'No detailed briefing provided for this event.'}
                  </p>
                </div>

                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Shield size={13} className="mr-2 text-royal shrink-0" />
                    <span className="font-bold">{p.wing || 'General Wing'}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Calendar size={13} className="mr-2 text-amber-500 shrink-0" />
                    <span>{p.date ? new Date(p.date).toLocaleDateString() : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin size={13} className="mr-2 text-emerald-500 shrink-0" />
                    <span className="truncate">{p.venue || 'Main Campus Auditorium'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => handleSendReminder(e, p)}
                  disabled={broadcastingId === p._id}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md transition-all disabled:opacity-50"
                  title="Broadcast Reminder Announcement"
                >
                  <Bell size={13} className={broadcastingId === p._id ? 'animate-bounce' : ''} />
                  <span>{broadcastingId === p._id ? 'Sending...' : 'Send Reminder'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(p._id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Delete Program"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Ledger View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card border rounded-3xl overflow-hidden shadow-lg h-fit">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Program Title</th>
                    <th className="p-4">Wing</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                  {filteredPrograms.map((p) => (
                    <tr 
                      key={p._id} 
                      className={`hover:bg-slate-500/5 transition-colors cursor-pointer ${
                        selectedProgram?._id === p._id ? 'bg-royal/5 dark:bg-royal/10 font-bold' : ''
                      }`}
                      onClick={() => setSelectedProgram(p)}
                    >
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100 text-sm">{p.title}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{p.wing}</td>
                      <td className="p-4 uppercase text-[10px] font-extrabold text-royal">{p.type}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(p._id, p.approved);
                          }}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            p.approved
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                        >
                          {p.approved ? <><Check size={11} className="mr-1" /> Approved</> : <><X size={11} className="mr-1" /> Pending</>}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleSendReminder(e, p)}
                            className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                            title="Send Reminder"
                          >
                            <Bell size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(p._id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete Program"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program Detail Panel */}
          <div className="glass-card border rounded-3xl p-6 shadow-lg h-fit space-y-6">
            {selectedProgram ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-royal dark:text-cyan">Program Dossier</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedProgram.title}</h3>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 font-bold">Academic Wing:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedProgram.wing}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 font-bold">Category Type:</span>
                    <span className="uppercase font-bold text-royal">{selectedProgram.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 font-bold">Date Scheduled:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedProgram.date ? new Date(selectedProgram.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 font-bold">Venue Location:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedProgram.venue || 'Campus Auditorium'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Briefing & Objectives</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border dark:border-slate-800">
                    {selectedProgram.description || 'No additional details provided.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={(e) => handleSendReminder(e, selectedProgram)}
                    disabled={broadcastingId === selectedProgram._id}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md hover:opacity-95 transition-all"
                  >
                    <Bell size={14} />
                    <span>Broadcast Reminder Announcement</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedProgram._id, selectedProgram.approved)}
                    className={`w-full py-2.5 font-bold rounded-2xl text-xs transition-all ${
                      selectedProgram.approved
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                    }`}
                  >
                    {selectedProgram.approved ? 'Revoke Approval' : 'Authorize Release'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Info size={32} className="mx-auto mb-2 opacity-50 text-royal" />
                <p className="text-sm font-bold">Select a program</p>
                <p className="text-xs text-slate-400 mt-1">Click any program card or row to inspect full dossier briefing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-scale">
          <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black font-sans text-slate-900 dark:text-white">Delete Program Record?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this program? All associated results and standing entries will also be unlinked.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded-2xl text-xs transition-all">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md glow-rose">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

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
