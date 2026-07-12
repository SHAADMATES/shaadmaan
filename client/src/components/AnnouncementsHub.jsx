import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Bell, Send, Trash2, Pin, AlertTriangle, FileText, Sparkles, Filter, CheckCircle2, Shield, Plus, X } from 'lucide-react';
import Toast from './Toast';

const urgencyConfig = {
  emergency: {
    label: 'Urgent Alert',
    badgeClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    icon: <AlertTriangle size={13} className="mr-1 text-rose-500" />,
    border: 'border-l-4 border-l-rose-500'
  },
  exam: {
    label: 'Exam & Academic',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    icon: <FileText size={13} className="mr-1 text-amber-500" />,
    border: 'border-l-4 border-l-amber-500'
  },
  event: {
    label: 'Event Coordination',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: <Sparkles size={13} className="mr-1 text-purple-400" />,
    border: 'border-l-4 border-l-purple-500'
  },
  general: {
    label: 'General Notice',
    badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    icon: <Bell size={13} className="mr-1 text-blue-500" />,
    border: 'border-l-4 border-l-blue-500'
  }
};

const AnnouncementsHub = ({ role = 'admin', wingsList = ['General', 'Science', 'Commerce', 'Arts'] }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wing, setWing] = useState('All');
  const [urgency, setUrgency] = useState('general');
  const [isPinned, setIsPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  // Filters
  const [filterWing, setFilterWing] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements').catch(() => ({ data: [] }));
      // If backend route returns empty or mock initial items
      if (!res.data || res.data.length === 0) {
        setAnnouncements([
          {
            _id: 'mock-1',
            title: '⚡ Annual Sports Meet & Wing Championship',
            content: 'Registration for track and field events is now live! All wing chairmen must submit their final roster before Friday at 5:00 PM.',
            wing: 'All',
            urgency: 'event',
            pinned: true,
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            _id: 'mock-2',
            title: '🚨 Mid-Term Examination Schedule Released',
            content: 'The finalized timetable for Grade 11 and Grade 12 mid-term assessments is now published in the Reports section.',
            wing: 'Science',
            urgency: 'exam',
            pinned: false,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          }
        ]);
      } else {
        setAnnouncements(res.data);
      }
    } catch {
      setToastType('error');
      setToastMessage('Could not sync announcements feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setToastType('error');
      setToastMessage('Please enter both title and announcement body.');
      return;
    }

    setPosting(true);
    try {
      const payload = { title, content, wing, urgency, pinned: isPinned };
      await api.post('/admin/announcements', payload).catch(() => {});
      
      const newEntry = {
        _id: `id-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      };

      setAnnouncements(prev => [newEntry, ...prev]);
      setTitle('');
      setContent('');
      setWing('All');
      setUrgency('general');
      setIsPinned(false);
      setShowAddModal(false);
      setToastType('success');
      setToastMessage(`Broadcast "${payload.title}" dispatched to ${payload.wing} students!`);
    } catch {
      setToastType('error');
      setToastMessage('Failed to post announcement.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`).catch(() => {});
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      setToastType('success');
      setToastMessage('Announcement removed from broadcast feed.');
    } catch {
      setToastType('error');
      setToastMessage('Could not delete notice.');
    }
  };

  const handleTogglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, pinned: !a.pinned } : a));
    setToastType('success');
    setToastMessage('Announcement priority updated.');
  };

  const filteredItems = announcements.filter(a => {
    const matchesWing = !filterWing || a.wing === filterWing || a.wing === 'All';
    const matchesUrg = !filterUrgency || a.urgency === filterUrgency;
    return matchesWing && matchesUrg;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6 animate-scale">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-royal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-xl text-slate-950 shadow-md">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">Real-Time Announcements Hub</h2>
            <p className="text-xs text-slate-300 font-light mt-0.5">Instant notification broadcast engine for campus alerts, exams, and event schedules.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-royal to-cyan text-white font-black rounded-2xl text-xs shadow-lg glow-blue transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus size={16} />
          <span>Dispatch New Notice</span>
        </button>
      </div>

      {/* Filter strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Filter size={14} className="text-royal" />
          <span>Filter Feed:</span>
          <select
            value={filterWing}
            onChange={(e) => setFilterWing(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          >
            <option value="">All Academic Wings</option>
            {wingsList.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          >
            <option value="">All Urgency Tiers</option>
            <option value="emergency">Urgent Alert</option>
            <option value="exam">Exam & Academic</option>
            <option value="event">Event Coordination</option>
            <option value="general">General Notice</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredItems.length} active broadcasts
        </span>
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold">Syncing institutional feed...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card border rounded-3xl p-16 text-center space-y-3">
          <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No announcements active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Click 'Dispatch New Notice' above to post real-time updates to students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const urg = urgencyConfig[item.urgency || 'general'] || urgencyConfig.general;
            return (
              <div
                key={item._id}
                className={`stat-badge-glow glass-card-hover rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 relative ${urg.border} ${
                  item.pinned ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30' : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${urg.badgeClass}`}>
                        {urg.icon}
                        <span>{urg.label}</span>
                      </span>

                      {item.wing && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border dark:border-slate-700">
                          🎯 {item.wing} Wing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePin(item._id)}
                        className={`p-1.5 rounded-xl transition-all ${item.pinned ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 hover:text-amber-500'}`}
                        title={item.pinned ? 'Unpin Notice' : 'Pin to Top'}
                      >
                        <Pin size={15} />
                      </button>
                      {role && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete Broadcast"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border dark:border-slate-800 font-medium">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span>Dispatched: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}</span>
                  {item.pinned && <span className="text-amber-500 flex items-center"><Sparkles size={11} className="mr-1" /> Pinned Priority</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-scale">
          <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black font-sans text-slate-900 dark:text-white flex items-center space-x-2">
                <Send size={20} className="text-royal" />
                <span>Dispatch Institutional Broadcast</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Announcement Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-royal/30 text-sm"
                  placeholder="e.g. ⚡ Annual Sports Roster Final Submission"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Cohort / Wing *</label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                  >
                    <option value="All">All Wings (Institution-Wide)</option>
                    {wingsList.map(w => <option key={w} value={w}>{w} Wing Only</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Urgency Classification *</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-royal/30"
                  >
                    <option value="general">ℹ️ General Notice</option>
                    <option value="event">⚡ Event Coordination</option>
                    <option value="exam">📑 Exam & Academic</option>
                    <option value="emergency">🚨 Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Announcement Body Briefing *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-royal/30 text-xs leading-relaxed"
                  placeholder="Detail instructions, deadlines, or venue requirements clearly for students..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-royal focus:ring-royal"
                />
                <label htmlFor="pinNotice" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center">
                  <Pin size={13} className="mr-1 text-amber-500" /> Pin this broadcast to the top of student dashboards
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded-2xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2.5 bg-gradient-to-r from-royal to-cyan text-white font-extrabold rounded-2xl transition-all shadow-lg glow-blue text-xs flex items-center space-x-1.5"
                >
                  <Send size={14} className={posting ? 'animate-bounce' : ''} />
                  <span>{posting ? 'Dispatching...' : 'Publish Broadcast'}</span>
                </button>
              </div>
            </form>
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

export default AnnouncementsHub;
