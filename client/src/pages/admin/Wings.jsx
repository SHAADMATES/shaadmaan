import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, FileSpreadsheet, Printer, Shield, User, Key, Image } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Wings = () => {
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      setWings(res.data);
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

  // Export to Excel / CSV
  const exportToCSV = () => {
    const headers = ['Wing Name', 'Chairman Name', 'Assistant Name', 'Wing Username', 'Wing Password'];
    const rows = wings.map(w => [
      w.name,
      w.chairmanId?.name || 'N/A',
      w.chairmanId?.assistantName || 'N/A',
      w.chairmanId?.userId?.username || 'N/A',
      w.chairmanId?.userId?.plainPassword || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ShaadMates_Wings_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastType('success');
    setToastMessage('Exported wings directory to CSV successfully.');
  };

  // Print Page
  const triggerPrint = async () => {
    const input = document.getElementById('wing-table-area');
    if (!input) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ShaadMates_Wings.pdf');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const filteredWings = wings.filter(w => {
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) ||
           (w.chairmanId?.name && w.chairmanId.name.toLowerCase().includes(q)) ||
           (w.chairmanId?.userId?.username && w.chairmanId.userId.username.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Wing & Chairman Directory
          </h2>
          <p className="text-sm text-slate-350 mt-1">
            Create wings and assign accounts for Wing Chairmen and Assistants.
          </p>
        </div>
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-royal hover:bg-royal-dark text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan to-royal text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            <Plus size={14} />
            <span>Create Wing</span>
          </button>
        </div>
      </div>

      {/* Filter Block */}
      <div className="flex gap-4 items-center print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search by wing name, chairman or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-royal/20"
          />
        </div>
      </div>

      {/* Main Table */}
      <div id="wing-table-area" className="glass-card border rounded-3xl overflow-hidden shadow-lg print:border-none print:shadow-none">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading wings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Wing</th>
                  <th className="p-4">Chairman Name</th>
                  <th className="p-4">Assistant Name</th>
                  <th className="p-4">Wing Username</th>
                  <th className="p-4">Wing Password</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredWings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      No wings registered.
                    </td>
                  </tr>
                ) : (
                  filteredWings.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-royal/10 text-royal flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border">
                          {w.logo ? (
                            <img src={w.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            w.name.charAt(0)
                          )}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{w.name}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">
                        {w.chairmanId?.name || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-350">
                        {w.chairmanId?.assistantName || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono font-bold">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 print:hidden">
          <div className="glass-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">
                {editMode ? 'Edit Wing Details' : 'Create New Wing'}
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
                {/* Wing Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Wing Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="e.g. Red Wing"
                    disabled={editMode}
                  />
                </div>

                {/* Chairman Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Chairman Name *</label>
                  <input
                    type="text"
                    value={chairmanName}
                    onChange={(e) => setChairmanName(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="Dr. Faisal Rahman"
                  />
                </div>

                {/* Assistant Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assistant Name</label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="Jane Doe"
                  />
                </div>

                {/* Wing Image/Logo */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 flex items-center">
                    <Image size={12} className="mr-1 text-royal" /> Logo/Image Upload
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-xl text-xs cursor-pointer transition-all border border-royal/15">
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
                        <img src={logo} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                        <span className="text-xs text-slate-500 truncate max-w-[150px]">Uploaded</span>
                        <button
                          type="button"
                          onClick={() => setLogo('')}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wing Login Credentials */}
                <div className="space-y-1 border-t dark:border-slate-800 pt-3 sm:col-span-2">
                  <h4 className="text-xs font-bold text-royal uppercase tracking-wider mb-2 flex items-center">
                    <Shield size={12} className="mr-1" /> Wing Portal Access Account
                  </h4>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Wing Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="red_wing_access"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Wing Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
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
                  {editMode ? 'Save Changes' : 'Create Wing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 print:hidden">
          <div className="glass-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-scale">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-sans">Delete Wing?</h4>
              <p className="text-xs text-slate-450">
                This will delete the wing, its associated chairman and assistant settings, and the wing login account.
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

export default Wings;
