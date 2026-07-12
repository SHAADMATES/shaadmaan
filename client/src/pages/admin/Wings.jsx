import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, FileSpreadsheet, Printer, Shield, User, Key, Image, LayoutGrid, Table as TableIcon, Sparkles, UserCheck, Users } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const Wings = () => {
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWing, setSelectedWing] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [chairmanName, setChairmanName] = useState('');
  const [assistantName, setAssistantName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/wings');
      setWings(res.data || []);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch wings directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWings();
  }, []);

  const resetForm = () => {
    setName('');
    setLogo('');
    setChairmanName('');
    setAssistantName('');
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      setErrorMsg('');
      try {
        const res = await api.post('/admin/upload', { image: reader.result });
        setLogo(res.data.url);
        setToastType('success');
        setToastMessage('Logo uploaded successfully.');
      } catch (err) {
        setErrorMsg('Failed to upload wing logo.');
        setToastType('error');
        setToastMessage('Logo upload failed.');
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

  const handleOpenEdit = (wing) => {
    setEditMode(true);
    setSelectedWing(wing);
    setName(wing.name);
    setLogo(wing.logo || '');
    setChairmanName(wing.chairmanId?.name || '');
    setAssistantName(wing.chairmanId?.assistantName || '');
    setUsername(wing.chairmanId?.userId?.username || '');
    setPassword(wing.chairmanId?.userId?.plainPassword || '');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !chairmanName || !username || !password) {
      setErrorMsg('Wing Name, Chairman Name, Username, and Password are required.');
      return;
    }

    const payload = {
      name,
      logo,
      chairmanName,
      assistantName,
      username,
      password
    };

    try {
      if (editMode) {
        await api.put(`/admin/wings/${selectedWing._id}`, payload);
        setToastType('success');
        setToastMessage(`Wing "${name}" updated successfully.`);
      } else {
        await api.post('/admin/wings', payload);
        setToastType('success');
        setToastMessage(`Wing "${name}" created successfully.`);
      }
      setIsOpen(false);
      fetchWings();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Verify credentials.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/wings/${deleteId}`);
      setToastType('success');
      setToastMessage('Wing deleted successfully.');
      setDeleteId(null);
      fetchWings();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete wing.');
      setDeleteId(null);
    }
  };

  const filteredWings = wings.filter(w => {
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) ||
           (w.chairmanId?.name && w.chairmanId.name.toLowerCase().includes(q)) ||
           (w.chairmanId?.userId?.username && w.chairmanId.userId.username.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/15">
            <Sparkles size={12} className="text-cyan animate-pulse" />
            <span>Academic Wings Registry</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Wing & Chairman Directory
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl font-light">
            Manage student wings, configure Chairman and Assistant faculty accounts, and inspect access credentials across the organization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
          <UniversalExport
            data={wings}
            filename={`ShaadMates_Wings_Directory_${new Date().toISOString().slice(0,10)}`}
            label="Export Directory"
            title="WING & CHAIRMAN DIRECTORY AUDIT REPORT"
            buttonClass="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md glow-emerald"
          />
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan via-royal to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-2xl shadow-lg glow-blue transition-all"
          >
            <Plus size={15} />
            <span>Create Wing</span>
          </button>
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:hidden">
        <div className="stat-badge-glow glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Wings Active</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{wings.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-royal/10 text-royal dark:bg-royal/20">
            <Shield size={24} />
          </div>
        </div>

        <div className="stat-badge-glow glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chairmen Assigned</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {wings.filter(w => w.chairmanId?.name).length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-badge-glow glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assistant Faculty</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {wings.filter(w => w.chairmanId?.assistantName).length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Search & View Mode Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none mt-3" size={16} />
          <input
            type="text"
            placeholder="Search by wing name, chairman or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-royal/20 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-royal shadow-sm scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Grid Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-royal shadow-sm scale-105'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TableIcon size={14} />
            <span>Table Registry</span>
          </button>
        </div>
      </div>

      {/* Main Content View (Grid or Table) */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Loading wings directory...</p>
        </div>
      ) : filteredWings.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <Shield size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No wings found matching your query.</p>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-royal text-white rounded-xl text-xs font-bold">
            Create First Wing
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Glowing Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWings.map((w) => (
            <div
              key={w._id}
              className="stat-badge-glow glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-6 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-royal/5 rounded-full blur-2xl group-hover:bg-royal/10 transition-colors pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-royal via-indigo-600 to-cyan text-white flex items-center justify-center font-extrabold text-lg shadow-md overflow-hidden border-2 border-white/20 shrink-0">
                      {w.logo ? (
                        <img src={w.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        w.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-royal transition-colors">
                        {w.name}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">
                        Active Wing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chairman & Assistant info */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <User size={13} className="mr-1.5 text-royal" /> Chairman:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                      {w.chairmanId?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Users size={13} className="mr-1.5 text-amber-500" /> Assistant:
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-350 truncate max-w-[150px]">
                      {w.chairmanId?.assistantName || 'None Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-2">
                    <span className="text-slate-400 flex items-center font-mono">
                      <Key size={13} className="mr-1.5 text-cyan" /> Username:
                    </span>
                    <span className="font-mono font-bold text-royal dark:text-cyan">
                      @{w.chairmanId?.userId?.username || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400">
                  PWD: <strong className="text-slate-600 dark:text-slate-300">{w.chairmanId?.userId?.plainPassword || '••••••••'}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(w)}
                    className="p-2 text-slate-500 hover:text-royal hover:bg-royal/10 dark:hover:bg-royal/20 rounded-xl transition-all"
                    title="Edit Wing Details"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(w._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                    title="Delete Wing"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Registry View */
        <div className="glass-card border rounded-3xl overflow-hidden shadow-lg print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Wing</th>
                  <th className="p-4">Chairman Name</th>
                  <th className="p-4">Assistant Name</th>
                  <th className="p-4">Wing Username</th>
                  <th className="p-4">Wing Password</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                {filteredWings.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-royal to-cyan text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                        {w.logo ? (
                          <img src={w.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          w.name.charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{w.name}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                      {w.chairmanId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-350">
                      {w.chairmanId?.assistantName || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="p-4 text-royal dark:text-cyan font-mono font-bold">
                      @{w.chairmanId?.userId?.username || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">
                      {w.chairmanId?.userId?.plainPassword || 'N/A'}
                    </td>
                    <td className="p-4 print:hidden">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-2 text-slate-500 hover:text-royal hover:bg-royal/10 dark:hover:bg-royal/20 rounded-xl transition-all"
                          title="Edit Wing"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(w._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                          title="Delete Wing"
                        >
                          <Trash2 size={16} />
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
          <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black font-sans text-slate-900 dark:text-white flex items-center space-x-2">
                <Shield size={18} className="text-royal" />
                <span>{editMode ? 'Edit Wing Details' : 'Create New Wing'}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center">
                <AlertCircle size={15} className="mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Wing Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="e.g. Red Wing"
                    disabled={editMode}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Chairman Name *</label>
                  <input
                    type="text"
                    value={chairmanName}
                    onChange={(e) => setChairmanName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="Dr. Faisal Rahman"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assistant Name</label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                    <Image size={14} className="mr-1 text-royal" /> Logo/Image Upload
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2.5 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-2xl text-xs cursor-pointer transition-all border border-royal/15">
                      <span>{uploading ? 'Uploading...' : 'Choose Logo Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {logo && (
                      <div className="flex items-center space-x-2">
                        <img src={logo} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-royal shadow-sm" />
                        <span className="text-xs text-slate-500 truncate max-w-[150px]">Uploaded</span>
                        <button
                          type="button"
                          onClick={() => setLogo('')}
                          className="text-xs text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 sm:col-span-2">
                  <h4 className="text-xs font-black text-royal uppercase tracking-wider mb-2 flex items-center">
                    <Shield size={13} className="mr-1" /> Wing Portal Access Credentials
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Wing Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="red_wing_access"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Wing Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                    placeholder="••••••••"
                  />
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
                  className="px-6 py-2.5 bg-gradient-to-r from-royal to-indigo-600 hover:opacity-95 text-white font-bold rounded-2xl transition-all shadow-lg glow-blue"
                >
                  {editMode ? 'Save Changes' : 'Create Wing'}
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
              <h4 className="text-lg font-black font-sans text-slate-900 dark:text-white">Delete Wing Directory?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action will delete the wing and permanently revoke login access for the associated Chairman and Assistant accounts.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded-2xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md glow-rose"
              >
                Yes, Delete
              </button>
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

export default Wings;
