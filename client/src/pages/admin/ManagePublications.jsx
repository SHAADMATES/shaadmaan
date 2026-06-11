import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { BookOpen, Check, X, Search, Filter, Globe, Calendar, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const ManagePublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchPublications = async () => {
    try {
      const res = await api.get('/admin/publications');
      setPublications(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load student publications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleUpdateStatus = async (id, title, newStatus) => {
    try {
      await api.put(`/admin/publications/${id}/status`, { status: newStatus });
      setToastType('success');
      setToastMessage(`Publication "${title}" has been ${newStatus.toLowerCase()}.`);
      fetchPublications();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to update publication status.');
    }
  };

  const filteredPublications = publications.filter(pub => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = pub.title.toLowerCase().includes(query) ||
                          pub.content.toLowerCase().includes(query) ||
                          (pub.studentId?.name && pub.studentId.name.toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'ALL' || pub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="h-64 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
          Student Publications Moderator
        </h2>
        <p className="text-sm text-slate-350 mt-1">
          Review, approve, or reject student essays, articles, and newsletters proposed for official publication.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search publications or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPublications.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-card border rounded-3xl p-6 text-slate-400 italic text-sm">
            No student publication proposals found matching search filters.
          </div>
        ) : (
          filteredPublications.map((pub) => (
            <div key={pub._id} className="p-6 rounded-3xl glass-card border flex flex-col justify-between space-y-4 hover-scale shadow border-slate-250/20">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-850 dark:text-white line-clamp-1">{pub.title}</h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-455">
                      <span className="flex items-center"><User size={10} className="mr-0.5" /> {pub.studentId?.name || 'Unknown Student'}</span>
                      <span>•</span>
                      <span className="flex items-center"><Globe size={10} className="mr-0.5" /> {pub.language}</span>
                      <span>•</span>
                      <span>{pub.category}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    pub.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    pub.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {pub.status === 'Approved' && <CheckCircle2 size={10} className="mr-0.5" />}
                    {pub.status === 'Rejected' && <AlertCircle size={10} className="mr-0.5" />}
                    {pub.status === 'Pending' && <Clock size={10} className="mr-0.5" />}
                    {pub.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-350 whitespace-pre-line leading-relaxed font-sans max-h-40 overflow-y-auto pr-1">
                  {pub.content}
                </p>
              </div>

              {/* Action Buttons (Approve/Reject) */}
              {pub.status === 'Pending' && (
                <div className="flex items-center justify-end space-x-2 pt-4 border-t dark:border-slate-850">
                  <button
                    onClick={() => handleUpdateStatus(pub._id, pub.title, 'Rejected')}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-all"
                  >
                    <X size={12} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(pub._id, pub.title, 'Approved')}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md"
                  >
                    <Check size={12} />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          ))
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

export default ManagePublications;
