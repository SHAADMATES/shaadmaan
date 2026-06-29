import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, FileSpreadsheet, Printer, Shield, User, Key, Mail, Hash, Image, Download, Eye, EyeOff, ChevronDown, GraduationCap } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper: color by wing name hash
const wingColors = [
  'from-blue-500 to-royal',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-violet-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];
const getWingColor = (wing) => {
  if (!wing) return wingColors[0];
  let hash = 0;
  for (let i = 0; i < wing.length; i++) hash += wing.charCodeAt(i);
  return wingColors[hash % wingColors.length];
};

const StudentCard = ({ student, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const wg = getWingColor(student.wing);

  return (
    <div className="glass-card border rounded-3xl overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      {/* Card top strip with wing gradient */}
      <div className={`h-2 bg-gradient-to-r ${wg}`} />
      
      <div className="p-5 space-y-4">
        {/* Header: Avatar + Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${wg} flex items-center justify-center font-extrabold text-xl text-white shadow-md shrink-0 overflow-hidden`}>
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                student.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight">{student.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{student.admissionNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(student)}
              className="p-2 text-slate-400 hover:text-royal hover:bg-royal/10 rounded-xl transition-all"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(student._id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Wing Badge */}
        {student.wing && (
          <div className="flex">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r ${wg} text-white shadow-sm`}>
              <Shield size={10} />
              <span>{student.wing}</span>
            </span>
          </div>
        )}

        {/* Info rows */}
        <div className="space-y-2 text-xs border-t dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <User size={11} />
              <span>Username</span>
            </span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              @{student.userId?.username || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Key size={11} />
              <span>Password</span>
            </span>
            <div className="flex items-center space-x-1">
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {showPassword ? (student.userId?.plainPassword || '—') : '••••••••'}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-royal transition-colors"
              >
                {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
            </div>
          </div>

          {student.email && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Mail size={11} />
                <span>Email</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                {student.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [wing, setWing] = useState('');
  const [className, setClassName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const [customFields, setCustomFields] = useState([]);
  const [customValues, setCustomValues] = useState({});

  const fileInputRef = useRef(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    const fetchCustomFields = async () => {
      try {
        const res = await api.get('/admin/form-fields/student');
        setCustomFields(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCustomFields();
  }, []);

  const resetForm = () => {
    setUsername(''); setPassword(''); setName('');
    setAdmissionNumber(''); setWing(''); setClassName(''); setDob(''); setPhone(''); setEmail('');
    setPhoto(''); setCustomValues({}); setErrorMsg('');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await api.post('/admin/upload', { image: reader.result });
        setPhoto(res.data.url);
        setToastType('success');
        setToastMessage('Photo uploaded successfully.');
      } catch {
        setErrorMsg('Failed to upload photo.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setUsername(student.userId?.username || '');
    setPassword(student.userId?.plainPassword || '');
    setName(student.name);
    setAdmissionNumber(student.admissionNumber);
    setWing(student.wing || '');
    setClassName(student.className || '');
    setDob(student.dob ? new Date(student.dob).toISOString().split('T')[0] : '');
    setPhone(student.phone || '');
    setEmail(student.email || '');
    setPhoto(student.photo || '');
    setCustomValues(student.customValues || {});
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !admissionNumber || !username || !password) {
      setErrorMsg('Name, Admission Number, Username, and Password are required.');
      return;
    }
    const payload = { username, password, name, admissionNumber, class: className, wing, dob, phone, email, photo, customValues };
    try {
      if (editMode) {
        await api.put(`/admin/students/${selectedStudent._id}`, payload);
        setToastType('success');
        setToastMessage(`Student "${name}" updated.`);
      } else {
        await api.post('/admin/students', payload);
        setToastType('success');
        setToastMessage(`Student "${name}" registered!`);
      }
      setIsOpen(false);
      fetchStudents();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/students/${deleteId}`);
      setToastType('success');
      setToastMessage('Student account removed.');
      setDeleteId(null);
      fetchStudents();
    } catch {
      setToastType('error');
      setToastMessage('Failed to delete student.');
      setDeleteId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Admission No', 'Username', 'Password', 'Gmail', 'Wing'];
    const rows = students.map(s => [
      s.name, s.admissionNumber,
      s.userId?.username || 'N/A',
      s.userId?.plainPassword || '',
      s.email || 'N/A',
      s.wing || 'No Wing'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "ShaadMates_Students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastType('success');
    setToastMessage('Exported students to CSV.');
  };

  const handlePrint = async () => {
    const input = document.getElementById('student-print-area');
    if (!input) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShaadMates_Students.pdf');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.admissionNumber.toLowerCase().includes(query) ||
      (student.userId?.username && student.userId.username.toLowerCase().includes(query));
    const matchesWing = wingFilter === '' || student.wing === wingFilter;
    return matchesSearch && matchesWing;
  });

  const wingsList = [...new Set(students.map(s => s.wing))].filter(Boolean);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700/40 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-royal/20 rounded-full blur-3xl pointer-events-none -translate-y-10 translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-royal flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Students Registry</h2>
              <p className="text-sm text-slate-400 mt-0.5">{students.length} students enrolled across {wingsList.length} wings.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={exportToCSV} className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Download size={13} /><span>Export CSV</span>
            </button>
            <button onClick={handlePrint} className="flex items-center space-x-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Printer size={13} /><span>Print</span>
            </button>
            <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-royal to-cyan-500 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Plus size={13} /><span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 print:hidden">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, admission no or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-royal/20"
          />
        </div>

        {/* Wing Filter */}
        <div className="relative">
          <select
            value={wingFilter}
            onChange={(e) => setWingFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
          >
            <option value="">All Wings</option>
            {wingsList.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors ${viewMode === 'cards' ? 'bg-royal text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-royal text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 font-medium print:hidden">
        Showing <span className="font-bold text-slate-700 dark:text-white">{filteredStudents.length}</span> of {students.length} students
      </p>

      {/* Content */}
      <div id="student-print-area" className="space-y-4">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="h-52 rounded-3xl animate-shimmer" />)}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card border rounded-3xl p-16 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-400 font-medium">No students found.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or adding a new student.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStudents.map((s) => (
            <StudentCard
              key={s._id}
              student={s}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : (
        // Table view
        <div className="glass-card border rounded-3xl overflow-hidden shadow-lg print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Admission No</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Password</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Wing</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getWingColor(s.wing)} flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden`}>
                          {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{s.admissionNumber}</td>
                    <td className="p-4 font-mono text-slate-500">@{s.userId?.username || 'N/A'}</td>
                    <td className="p-4 text-slate-400 dark:text-slate-500 font-mono text-xs">{s.userId?.plainPassword || '••••••••'}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{s.email || '—'}</td>
                    <td className="p-4">
                      {s.wing ? (
                        <span className={`inline-block px-2.5 py-0.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${getWingColor(s.wing)}`}>{s.wing}</span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No Wing</span>
                      )}
                    </td>
                    <td className="p-4 print:hidden">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleOpenEdit(s)} className="p-2 text-slate-500 hover:text-royal hover:bg-royal/10 rounded-xl transition-all"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteId(s._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <User size={16} />
                </div>
                <h3 className="text-lg font-bold">
                  {editMode ? 'Edit Student Details' : 'Register New Student'}
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
                {/* Full name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <User size={11} className="text-royal" /><span>Full Name *</span>
                  </label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="Full name"
                  />
                </div>

                {/* Admission number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Hash size={11} className="text-royal" /><span>Admission No *</span>
                  </label>
                  <input
                    type="text" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="ADM2026-001"
                  />
                </div>

                {/* Wing (optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Shield size={11} className="text-royal" /><span>Wing (optional)</span>
                  </label>
                  <input
                    type="text" value={wing} onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="e.g. Red Wing"
                    list="wings-datalist"
                  />
                    <datalist id="wings-datalist">
                      {wingsList.map(w => <option key={w} value={w} />)}
                    </datalist>
                  </div>

                  {/* Class */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <GraduationCap size={11} className="text-royal" /><span>Class</span>
                    </label>
                    <input
                      type="text" value={className} onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                      placeholder="e.g. Class XII"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <span>Date of Birth</span>
                    </label>
                    <input
                      type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                      placeholder="e.g. 1234567890"
                    />
                  </div>

                {/* Student Photo Upload */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Image size={11} className="text-royal" /><span>Student Photo</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center space-x-2 px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-xl text-xs cursor-pointer transition-all border border-royal/15 disabled:opacity-50"
                    >
                      <Image size={13} />
                      <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    {photo && (
                      <div className="flex items-center space-x-2">
                        <img src={photo} alt="Preview" className="w-10 h-10 rounded-xl object-cover border shadow" />
                        <button type="button" onClick={() => setPhoto('')} className="text-xs text-rose-500 hover:underline font-semibold">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gmail/Email */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Mail size={11} className="text-royal" /><span>Gmail / Email</span>
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="student@gmail.com"
                  />
                </div>

                {/* Custom Fields */}
                {customFields.map(field => (
                  <div key={field._id} className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={customValues[field.name] || ''}
                        onChange={(e) => setCustomValues({ ...customValues, [field.name]: e.target.value })}
                        required={field.required}
                        rows="3"
                        className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={customValues[field.name] || ''}
                        onChange={(e) => setCustomValues({ ...customValues, [field.name]: e.target.value })}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}

                {/* Credentials */}
                <div className="sm:col-span-2 border-t dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-royal uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                    <Shield size={11} /><span>Login Access Credentials</span>
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <User size={11} /><span>Username *</span>
                  </label>
                  <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                    placeholder="student_access"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Key size={11} /><span>Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 border dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                      {showFormPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-royal to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all">
                  {editMode ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h4 className="text-lg font-bold">Delete Student Profile?</h4>
              <p className="text-xs text-slate-400 mt-1">This will permanently remove the student profile and their login account.</p>
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

export default ManageStudents;
