import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  Globe, Plus, Pencil, Trash2, Search, Filter, X, Save,
  ChevronDown, Trophy, Building2, Calendar, Tag, User, Download
} from 'lucide-react';
import Toast from '../../components/Toast';

const PROGRAM_TYPES = ['Cultural', 'Sports', 'Academic', 'Social Service', 'Technical', 'Other'];
const POSITIONS = ['1st Position', '2nd Position', '3rd Position', 'Participation', 'No Position'];

const ManageOutreach = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterWing, setFilterWing] = useState('');

  // Form state
  const [form, setForm] = useState({
    studentId: '', programName: '', date: '', organization: '',
    programType: 'Cultural', position: 'Participation'
  });

  const fetchRecords = async () => {
    try {
      const res = await api.get('/admin/outreach');
      setRecords(res.data);
    } catch (err) {
      showToast('Failed to load outreach records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students');
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRecord) {
        await api.put(`/admin/outreach/${editRecord._id}`, form);
        showToast('Outreach record updated successfully!');
      } else {
        await api.post('/admin/outreach', form);
        showToast('Outreach record added successfully!');
      }
      setShowForm(false);
      setEditRecord(null);
      setForm({ studentId: '', programName: '', date: '', organization: '', programType: 'Cultural', position: 'Participation' });
      fetchRecords();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleEdit = (rec) => {
    setEditRecord(rec);
    setForm({
      studentId: rec.studentId,
      programName: rec.programName,
      date: rec.date ? rec.date.split('T')[0] : '',
      organization: rec.organization,
      programType: rec.programType,
      position: rec.position
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete outreach record for "${name}"?`)) return;
    try {
      await api.delete(`/admin/outreach/${id}`);
      showToast('Record deleted.');
      fetchRecords();
    } catch {
      showToast('Deletion failed.', 'error');
    }
  };

  const downloadCSV = () => {
    const headers = ['Student Name', 'Wing', 'Program Name', 'Date', 'Organization', 'Program Type', 'Position'];
    const rows = filteredRecords.map(r => [
      r.studentName || 'N/A',
      r.wing || 'N/A',
      r.programName,
      new Date(r.date).toLocaleDateString(),
      r.organization,
      r.programType,
      r.position
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShaadMates_Outreach_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueWings = [...new Set(records.map(r => r.wing).filter(Boolean))];

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (r.studentName || '').toLowerCase().includes(q) ||
      r.programName.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q);
    const matchType = !filterType || r.programType === filterType;
    const matchPosition = !filterPosition || r.position === filterPosition;
    const matchWing = !filterWing || r.wing === filterWing;
    return matchSearch && matchType && matchPosition && matchWing;
  });

  const positionColor = (pos) => {
    if (pos === '1st Position') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (pos === '2nd Position') return 'bg-slate-100 text-slate-600 border-slate-300';
    if (pos === '3rd Position') return 'bg-orange-50 text-orange-600 border-orange-200';
    if (pos === 'Participation') return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const typeColor = (type) => {
    const map = {
      Cultural: 'bg-purple-50 text-purple-700 border-purple-200',
      Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Academic: 'bg-blue-50 text-blue-700 border-blue-200',
      'Social Service': 'bg-pink-50 text-pink-700 border-pink-200',
      Technical: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Other: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return map[type] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map(n => (
          <div key={n} className="h-24 rounded-3xl animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe size={28} className="text-emerald-200" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Outreach Achievements</h2>
            </div>
            <p className="text-emerald-100 text-sm">Track student achievements at external programs, competitions & events.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-2xl text-sm font-semibold transition-all"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => { setShowForm(true); setEditRecord(null); setForm({ studentId: '', programName: '', date: '', organization: '', programType: 'Cultural', position: 'Participation' }); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={16} />
              Add Achievement
            </button>
          </div>
        </div>
        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: records.length },
            { label: 'Winners (1st–3rd)', value: records.filter(r => ['1st Position', '2nd Position', '3rd Position'].includes(r.position)).length },
            { label: 'Participants', value: records.filter(r => r.position === 'Participation').length },
            { label: 'Organizations', value: new Set(records.map(r => r.organization)).size }
          ].map(stat => (
            <div key={stat.label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-emerald-100 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-600">
              <h3 className="text-lg font-bold text-white">{editRecord ? 'Edit Outreach Record' : 'Add New Outreach Achievement'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Student *</label>
                  <select
                    value={form.studentId}
                    onChange={e => setForm({...form, studentId: e.target.value})}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.wing || 'No Wing'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Program Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Program Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. National Science Olympiad 2026"
                    value={form.programName}
                    onChange={e => setForm({...form, programName: e.target.value})}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Organizing Body / Institution *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jammu & Kashmir Education Board"
                    value={form.organization}
                    onChange={e => setForm({...form, organization: e.target.value})}
                    required
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Program Type *</label>
                  <select
                    value={form.programType}
                    onChange={e => setForm({...form, programType: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PROGRAM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Position / Achievement *</label>
                  <select
                    value={form.position}
                    onChange={e => setForm({...form, position: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md transition-all">
                  <Save size={16} />
                  {editRecord ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search student, program, organization..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none">
          <option value="">All Types</option>
          {PROGRAM_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none">
          <option value="">All Positions</option>
          {POSITIONS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterWing} onChange={e => setFilterWing(e.target.value)} className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none">
          <option value="">All Wings</option>
          {uniqueWings.map(w => <option key={w}>{w}</option>)}
        </select>
        {(searchQuery || filterType || filterPosition || filterWing) && (
          <button onClick={() => { setSearchQuery(''); setFilterType(''); setFilterPosition(''); setFilterWing(''); }} className="flex items-center gap-1 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-colors">
            <X size={14} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400 font-medium">{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-slate-400 italic text-sm">
            <Globe size={40} className="mx-auto mb-3 opacity-30" />
            <p>No outreach records found. Add your first achievement!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Program Name</th>
                  <th className="text-left px-4 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Organization</th>
                  <th className="text-left px-4 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Position</th>
                  <th className="text-right px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{rec.studentName || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{rec.wing || 'No Wing'} · {rec.className}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{rec.programName}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Building2 size={12} />
                        <span className="text-xs">{rec.organization}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColor(rec.programType)}`}>
                        {rec.programType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${positionColor(rec.position)}`}>
                        {rec.position === '1st Position' && '🥇 '}
                        {rec.position === '2nd Position' && '🥈 '}
                        {rec.position === '3rd Position' && '🥉 '}
                        {rec.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(rec)} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(rec._id, rec.programName)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default ManageOutreach;
