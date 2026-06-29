import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, FileSpreadsheet, Printer, Globe, Calendar, Award } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ManageOutreach = () => {
  const [outreaches, setOutreaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOutreach, setSelectedOutreach] = useState(null);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState('');
  const [position, setPosition] = useState('');

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [outreachRes, studentsRes] = await Promise.all([
        api.get('/outreach'),
        api.get('/admin/students')
      ]);
      setOutreaches(outreachRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setStudentId('');
    setProgramDate('');
    setOrganization('');
    setType('');
    setPosition('');
    setErrorMsg('');
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    resetForm();
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !programDate || !organization || !type) {
      setErrorMsg('Student, Date, Organization, and Type are required.');
      return;
    }

    const payload = { studentId, programDate, organization, type, position };

    try {
      if (editMode) {
        // Assume you have a PUT endpoint if editing, but for now we'll just handle POST as we don't have a PUT route in outreach yet, wait let's use POST. The previous file had no edit logic. I'll stick to POST/DELETE.
        // If there's an edit route: await api.put(`/outreach/${selectedOutreach._id}`, payload);
      } else {
        await api.post('/outreach', payload);
        setToastType('success');
        setToastMessage(`Outreach achievement added!`);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // The previous file deleted by ID. The _id in outreach.
      await api.delete(`/outreach/${deleteId}`);
      setToastType('success');
      setToastMessage('Outreach record removed.');
      setDeleteId(null);
      fetchData();
    } catch {
      setToastType('error');
      setToastMessage('Failed to delete outreach.');
      setDeleteId(null);
    }
  };

  const handlePrint = async () => {
    const input = document.getElementById('outreach-print-area');
    if (!input) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShaadMates_Outreach.pdf');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const filteredOutreaches = outreaches.filter(o => {
    const query = searchQuery.toLowerCase();
    const studentName = (o.student?.name || o.studentId?.name || '').toLowerCase();
    const org = (o.organization || '').toLowerCase();
    return studentName.includes(query) || org.includes(query);
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700/40 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-royal/20 rounded-full blur-3xl pointer-events-none -translate-y-10 translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-royal flex items-center justify-center shadow-lg">
              <Globe size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Outreach Achievements</h2>
              <p className="text-sm text-slate-400 mt-0.5">Manage external student achievements and programs.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={handlePrint} className="flex items-center space-x-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Printer size={13} /><span>Print</span>
            </button>
            <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-royal to-cyan-500 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Plus size={13} /><span>Add Outreach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by student name or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-royal/20"
          />
        </div>
      </div>

      <div id="outreach-print-area" className="glass-card border rounded-3xl overflow-hidden shadow-lg print:border-none print:shadow-none">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading outreach data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Position</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredOutreaches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      No outreach records found.
                    </td>
                  </tr>
                ) : (
                  filteredOutreaches.map((o) => {
                    const studentName = o.student?.name || o.studentId?.name || 'Unknown';
                    const oId = o._id || o.id;
                    return (
                      <tr key={oId} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{studentName}</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {new Date(o.programDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{o.organization}</td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-royal bg-royal/10 border border-royal/20">
                            {o.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-xs font-semibold">{o.position || '—'}</td>
                        <td className="p-4 print:hidden">
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => setDeleteId(oId)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="glass-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-royal/10 text-royal flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <h3 className="text-lg font-bold">
                  Record Outreach Achievement
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
                <AlertCircle size={13} className="mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <span>Student *</span>
                  </label>
                  <select
                    value={studentId} onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                  >
                    <option value="">Select a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.admissionNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Calendar size={11} className="text-royal" /><span>Program Date *</span>
                  </label>
                  <input
                    type="date" value={programDate} onChange={(e) => setProgramDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <span>Program Type *</span>
                  </label>
                  <input
                    type="text" value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="e.g. Competition"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Globe size={11} className="text-royal" /><span>Organization / Event Name *</span>
                  </label>
                  <input
                    type="text" value={organization} onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="Organization name"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Award size={11} className="text-royal" /><span>Position / Status</span>
                  </label>
                  <input
                    type="text" value={position} onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="e.g. 1st Place, Participant"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-royal to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h4 className="text-lg font-bold">Delete Outreach Record?</h4>
              <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default ManageOutreach;
