import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, FileSpreadsheet, Printer, Shield, User, Key, Mail, Hash, Image, Download, Eye, EyeOff, ChevronDown, GraduationCap, Copy, Check, ArrowRightLeft, CheckSquare, Square, Users } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

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

const StudentCard = ({ student, onEdit, onDelete, isSelected, onToggleSelect, onCopyCreds, copiedId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const wg = getWingColor(student.wing);

  return (
    <div className={`stat-badge-glow glass-card-hover border rounded-3xl overflow-hidden shadow-lg transition-all duration-300 group relative ${isSelected ? 'ring-2 ring-royal border-royal bg-royal/5 dark:bg-royal/10' : 'border-slate-200/80 dark:border-slate-800/80'}`}>
      <div className={`h-2.5 bg-gradient-to-r ${wg}`} />
      
      <div className="p-5 space-y-4">
        {/* Checkbox + Header Avatar */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onToggleSelect(student._id)}
              className="text-slate-400 hover:text-royal transition-colors shrink-0"
              title="Select for bulk transfer"
            >
              {isSelected ? <CheckSquare size={18} className="text-royal" /> : <Square size={18} />}
            </button>

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${wg} flex items-center justify-center font-extrabold text-xl text-white shadow-md shrink-0 overflow-hidden border-2 border-white/20`}>
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                student.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white truncate text-base leading-tight group-hover:text-royal transition-colors">{student.name}</h3>
              <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">{student.admissionNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onCopyCreds(student)}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Copy Login Credentials"
            >
              {copiedId === student._id ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </button>
            <button
              onClick={() => onEdit(student)}
              className="p-2 text-slate-400 hover:text-royal hover:bg-royal/10 rounded-xl transition-all"
              title="Edit Profile"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(student._id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Delete Account"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Wing Badge */}
        <div className="flex items-center justify-between">
          {student.wing ? (
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r ${wg} text-white shadow-sm`}>
              <Shield size={11} />
              <span>{student.wing}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">Unassigned Wing</span>
          )}
          {student.className && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-2 py-0.5 rounded-lg border dark:border-slate-800">
              {student.className}
            </span>
          )}
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-xs border-t dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <User size={12} className="text-royal" />
              <span>Username</span>
            </span>
            <span className="font-mono font-bold text-royal dark:text-cyan">
              @{student.userId?.username || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Key size={12} className="text-amber-500" />
              <span>Password</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
                {showPassword ? (student.userId?.plainPassword || '—') : '••••••••'}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-royal transition-colors p-1"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {student.email && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
                <Mail size={12} className="text-emerald-500" />
                <span>Email</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px] font-medium">
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Bulk Selection & Transfer
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [targetTransferWing, setTargetTransferWing] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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
      setStudents(res.data || []);
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
        setCustomFields(res.data || []);
      } catch (err) {
        console.error('Failed to load custom student fields');
      }
    };
    fetchCustomFields();
  }, []);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setAdmissionNumber('');
    setWing('');
    setClassName('');
    setDob('');
    setPhone('');
    setEmail('');
    setPhoto('');
    setCustomValues({});
    setErrorMsg('');
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
    setDob(student.dob ? student.dob.split('T')[0] : '');
    setPhone(student.phone || '');
    setEmail(student.email || '');
    setPhoto(student.photo || '');
    setCustomValues(student.customFields || {});
    setErrorMsg('');
    setIsOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      setErrorMsg('');
      try {
        const res = await api.post('/admin/upload', { image: reader.result });
        setPhoto(res.data.url);
        setToastType('success');
        setToastMessage('Photo uploaded successfully.');
      } catch (err) {
        setErrorMsg('Failed to upload student photo.');
        setToastType('error');
        setToastMessage('Photo upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !wing) {
      setErrorMsg('Full Name and Academic Wing are required.');
      return;
    }

    const timeHash = Date.now().toString().slice(-6);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';

    const finalAdmissionNo = admissionNumber?.trim() ? admissionNumber : `ADM-${timeHash}-${randNum}`;
    const finalUsername = username?.trim() ? username : `${cleanName}_${randNum}`;
    const finalPassword = password?.trim() ? password : 'Pass@123';

    const payload = {
      username: finalUsername,
      password: finalPassword,
      name,
      admissionNumber: finalAdmissionNo,
      wing,
      className: className || 'Class XII',
      dob,
      phone,
      email,
      photo,
      customFields: customValues,
    };

    try {
      if (editMode) {
        await api.put(`/admin/students/${selectedStudent._id}`, payload);
        setToastType('success');
        setToastMessage(`Student "${name}" updated successfully.`);
      } else {
        await api.post('/admin/students', payload);
        setToastType('success');
        setToastMessage(`Student "${name}" added instantly.`);
      }
      setIsOpen(false);
      fetchStudents();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Verify uniqueness.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/students/${deleteId}`);
      setToastType('success');
      setToastMessage('Student record removed.');
      setDeleteId(null);
      fetchStudents();
    } catch {
      setToastType('error');
      setToastMessage('Failed to delete student.');
      setDeleteId(null);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s._id)));
    }
  };

  const handleBulkTransfer = async () => {
    if (selectedIds.size === 0 || !targetTransferWing) return;
    setTransferring(true);
    try {
      // Execute bulk update
      const idsArray = Array.from(selectedIds);
      await Promise.all(
        idsArray.map(id => {
          const st = students.find(s => s._id === id);
          if (!st) return Promise.resolve();
          return api.put(`/admin/students/${id}`, {
            username: st.userId?.username || `${st.admissionNumber}_usr`,
            password: st.userId?.plainPassword || 'Pass@123',
            name: st.name,
            admissionNumber: st.admissionNumber,
            wing: targetTransferWing,
            className: st.className || '',
            email: st.email || '',
            phone: st.phone || '',
            photo: st.photo || ''
          });
        })
      );

      setToastType('success');
      setToastMessage(`Transferred ${idsArray.length} student(s) to "${targetTransferWing}" wing!`);
      setSelectedIds(new Set());
      setTargetTransferWing('');
      fetchStudents();
    } catch (err) {
      setToastType('error');
      setToastMessage('Bulk transfer encountered an error.');
    } finally {
      setTransferring(false);
    }
  };

  const handleCopyCreds = (student) => {
    const text = `ShaadMates Login Portal:\nUsername: ${student.userId?.username}\nPassword: ${student.userId?.plainPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student._id);
    setToastType('success');
    setToastMessage(`Copied credentials for ${student.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      student.name?.toLowerCase().includes(query) ||
      student.admissionNumber?.toLowerCase().includes(query) ||
      (student.userId?.username && student.userId.username.toLowerCase().includes(query));
    const matchesWing = wingFilter === '' || student.wing === wingFilter;
    return matchesSearch && matchesWing;
  });

  const wingsList = [...new Set(students.map(s => s.wing))].filter(Boolean);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-navy to-slate-900 text-white shadow-2xl border border-slate-700/40 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-royal/20 rounded-full blur-3xl pointer-events-none -translate-y-10 translate-x-10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-royal flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">Students Directory & Bulk Registry</h2>
              <p className="text-sm text-slate-400 mt-0.5 font-light">{students.length} students enrolled across {wingsList.length} academic wings.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <UniversalExport 
              data={students.map(s => ({
                Name: s.name,
                AdmissionNo: s.admissionNumber,
                Username: s.userId?.username || 'N/A',
                Password: s.userId?.plainPassword || '',
                Email: s.email || 'N/A',
                Wing: s.wing || 'No Wing'
              }))}
              filename="ShaadMates_Students_Registry"
              label="Export Registry"
              title="STUDENT REGISTRY & CREDENTIALS AUDIT"
              buttonClass="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md glow-emerald transition-all"
            />
            <button onClick={() => window.print()} className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl shadow transition-all">
              <Printer size={14} /><span>Print List</span>
            </button>
            <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-royal to-cyan text-white text-xs font-bold rounded-2xl shadow-lg glow-blue transition-all">
              <Plus size={15} /><span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by name, admission no or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-royal/20 shadow-sm"
            />
          </div>

          {/* Wing Filter */}
          <div className="relative">
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-royal/20 shadow-sm"
            >
              <option value="">All Academic Wings</option>
              {wingsList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Select All Filtered Button */}
          {filteredStudents.length > 0 && (
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-all border border-slate-200/80 dark:border-slate-700 shrink-0"
            >
              {selectedIds.size === filteredStudents.length ? <CheckSquare size={15} className="text-royal" /> : <Square size={15} />}
              <span>{selectedIds.size === filteredStudents.length ? 'Deselect Cohort' : `Select Filtered (${filteredStudents.length})`}</span>
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-1 shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Glowing Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-royal text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Table Ledger
          </button>
        </div>
      </div>

      {/* Floating Bulk Transfer Action Strip */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-royal via-indigo-700 to-navy text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 animate-bounce-once sticky top-4 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-sm">
              {selectedIds.size}
            </div>
            <div>
              <h4 className="font-extrabold text-sm font-sans">Batch Cohort Selected</h4>
              <p className="text-xs text-slate-200/90">Bulk transfer these students to a new wing or update assignments simultaneously.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <select
              value={targetTransferWing}
              onChange={(e) => setTargetTransferWing(e.target.value)}
              className="px-3.5 py-2 bg-white text-slate-900 font-bold rounded-2xl text-xs focus:outline-none shadow-inner"
            >
              <option value="">-- Select Target Wing --</option>
              {wingsList.map(w => <option key={w} value={w}>Transfer to: {w}</option>)}
              <option value="General">Transfer to: General / Core</option>
            </select>
            <button
              onClick={handleBulkTransfer}
              disabled={!targetTransferWing || transferring}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center space-x-1.5"
            >
              <ArrowRightLeft size={14} className={transferring ? 'animate-spin' : ''} />
              <span>{transferring ? 'Transferring...' : 'Execute Batch Transfer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="h-52 rounded-3xl animate-shimmer" />)}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card border rounded-3xl p-16 text-center space-y-3">
          <GraduationCap size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No students found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Adjust search keywords or add new student records to populate this directory.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStudents.map((s) => (
            <StudentCard
              key={s._id}
              student={s}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              isSelected={selectedIds.has(s._id)}
              onToggleSelect={handleToggleSelect}
              onCopyCreds={handleCopyCreds}
              copiedId={copiedId}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card border rounded-3xl overflow-hidden shadow-xl print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAllFiltered} className="text-slate-400">
                      {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={16} className="text-royal" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Admission No</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Password</th>
                  <th className="p-4">Email / Phone</th>
                  <th className="p-4">Wing</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className={`hover:bg-slate-500/5 transition-colors ${selectedIds.has(s._id) ? 'bg-royal/5 dark:bg-royal/10 font-bold' : ''}`}>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggleSelect(s._id)} className="text-slate-400">
                        {selectedIds.has(s._id) ? <CheckSquare size={16} className="text-royal" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getWingColor(s.wing)} flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden shadow-sm`}>
                          {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{s.admissionNumber}</td>
                    <td className="p-4 font-mono font-bold text-royal dark:text-cyan">@{s.userId?.username || 'N/A'}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">{s.userId?.plainPassword || '••••••••'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-350">{s.email || s.phone || '—'}</td>
                    <td className="p-4">
                      {s.wing ? (
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-r ${getWingColor(s.wing)} text-white shadow-sm inline-block`}>
                          {s.wing}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-4 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleCopyCreds(s)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                          title="Copy Credentials"
                        >
                          {copiedId === s._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => handleOpenEdit(s)} className="p-1.5 text-slate-400 hover:text-royal hover:bg-royal/10 rounded-xl transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(s._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
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
      )}

      {/* CRUD Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 print:hidden animate-scale">
          <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black font-sans text-slate-900 dark:text-white flex items-center space-x-2">
                <GraduationCap size={22} className="text-royal" />
                <span>{editMode ? 'Edit Student Profile' : 'Register Student Account'}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center">
                <AlertCircle size={15} className="mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="e.g. Shaadmaan Ahmed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Admission Number (Optional - Auto ID)</label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="Auto-generated if left empty"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Wing *</label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                  >
                    <option value="">Select Wing</option>
                    {wingsList.map(w => <option key={w} value={w}>{w}</option>)}
                    <option value="General">General Wing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Class / Cohort</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="Grade 12-A"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="student@shaadmates.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="+1 (555) 019-2831"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                    <Image size={14} className="mr-1.5 text-royal" /> Profile Photo Upload
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2.5 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-2xl text-xs cursor-pointer transition-all border border-royal/15">
                      <span>{uploading ? 'Uploading Photo...' : 'Choose Student Image'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                    </label>
                    {photo && (
                      <div className="flex items-center space-x-2">
                        <img src={photo} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-royal shadow-sm" />
                        <span className="text-xs text-slate-500">Uploaded</span>
                        <button type="button" onClick={() => setPhoto('')} className="text-xs text-rose-500 font-bold hover:underline">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom fields dynamically */}
                {customFields.map((field) => (
                  <div key={field._id} className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">{field.label}</label>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={customValues[field.name] || ''}
                      onChange={(e) => setCustomValues({ ...customValues, [field.name]: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                      placeholder={field.label}
                    />
                  </div>
                ))}

                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 sm:col-span-2">
                  <h4 className="text-xs font-black text-royal uppercase tracking-wider mb-2 flex items-center">
                    <Shield size={13} className="mr-1" /> Student Portal Login Credentials (Optional - Auto-Generated)
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Portal Username (Optional)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="Auto-generated if left empty"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Portal Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-royal/30 pr-10"
                      placeholder="Defaults to Pass@123 if empty"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-royal"
                    >
                      {showFormPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-royal to-cyan text-white font-bold rounded-2xl transition-all shadow-lg glow-blue"
                >
                  {editMode ? 'Save Profile Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 print:hidden animate-scale">
          <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black font-sans text-slate-900 dark:text-white">Delete Student Account?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanently deletes this student's profile, academic results, certificate records, and login access.
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

export default ManageStudents;
