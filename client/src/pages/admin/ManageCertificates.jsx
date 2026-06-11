import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Award, CheckCircle, XCircle, Search, RefreshCw, Eye, Sparkles, Filter } from 'lucide-react';
import Toast from '../../components/Toast';

const ManageCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/certificates');
      setCertificates(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load certificates registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleToggleApproval = async (certId, currentStatus) => {
    setActionLoadingId(certId);
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/certificates/${certId}/approve`, { approved: newStatus });
      
      // Update local state
      setCertificates(prev => prev.map(c => c._id === certId ? { ...c, approved: newStatus } : c));
      
      setToastType('success');
      setToastMessage(newStatus ? 'Certificate approved successfully!' : 'Certificate approval revoked.');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to update certificate approval.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filters
  const filteredCerts = certificates.filter(c => {
    const matchesSearch = 
      c.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.programId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && c.approved) ||
      (statusFilter === 'pending' && !c.approved);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-royal via-indigo-600 to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Sparkles size={12} className="text-gold animate-pulse" /> <span>Registry Control</span>
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Certificate Release Moderation
          </h2>
          <p className="text-xs md:text-sm text-slate-200/90 max-w-2xl font-light">
            Authorize or hold academic merit certificates generated from program results. Students can download verified certificates as PDFs only after your explicit approval.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="glass-card border rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search by student, program, or cert ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          <button
            onClick={fetchCertificates}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh registry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-royal" />
            Loading certificate records...
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-16 text-center text-slate-450 italic">
            No certificates match the filters. Publish program standings to generate certificates first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-500/5 text-slate-400 font-bold border-b dark:border-slate-850">
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Recipient Student</th>
                  <th className="p-4">Program & Wing</th>
                  <th className="p-4">Standing</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCerts.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-800 dark:text-slate-300">
                      {cert.certificateId}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{cert.studentId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{cert.studentId?.admissionNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{cert.programId?.title || 'Unknown Event'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cert.programId?.wing || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-gold-dark border border-gold/10">
                        {cert.position} ({cert.grade || 'A'})
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      {cert.approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
                          <CheckCircle size={10} className="mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/15">
                          <XCircle size={10} className="mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleApproval(cert._id, cert.approved)}
                        disabled={actionLoadingId === cert._id}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          cert.approved 
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' 
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                        }`}
                      >
                        {actionLoadingId === cert._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : cert.approved ? (
                          'Revoke Release'
                        ) : (
                          'Approve Release'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default ManageCertificates;
