import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { BookMarked, Send, CheckCircle2, AlertCircle, Clock, Globe, HelpCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const Publications = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    language: 'English',
    category: 'Article',
  });

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/student/publications/my');
      setSubmissions(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load publication submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setToastType('error');
      setToastMessage('Please fill in Title and Content.');
      return;
    }

    try {
      await api.post('/student/publications', formData);
      setToastType('success');
      setToastMessage('Publication proposal submitted successfully!');
      setFormData({
        title: '',
        content: '',
        language: 'English',
        category: 'Article',
      });
      fetchSubmissions();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to submit publication.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          My Publications & Submissions
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Write and submit newsletters, essays, stories, or reports. Your submissions will be reviewed by platform administrators for publication approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Proposal submission form */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border shadow-lg space-y-6 h-fit">
          <h3 className="text-lg font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <BookMarked size={20} className="text-royal" />
            <span>Write Publication Article</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Article Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Navigating Web Development in 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
              />
            </div>

            {/* Language & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Urdu">Urdu (اردو)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
                >
                  <option value="Article">Article</option>
                  <option value="Story">Story</option>
                  <option value="Essay">Essay</option>
                  <option value="Research">Research Paper</option>
                  <option value="News">News</option>
                  <option value="Report">Report</option>
                </select>
              </div>
            </div>

            {/* Content body */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Content Body</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="8"
                placeholder="Draft your content body here..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal font-sans"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-sm shadow hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Send size={14} />
              <span>Submit for Approval</span>
            </button>
          </form>
        </div>

        {/* Right: Submissions lists */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          <h3 className="text-lg font-bold font-sans border-b border-slate-100 dark:border-slate-800/40 pb-4">
            Submission History Logs ({submissions.length})
          </h3>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {submissions.length === 0 ? (
              <p className="text-slate-400 text-center py-12 italic text-sm">
                No publication drafts submitted yet. Fill out the proposal editor.
              </p>
            ) : (
              submissions.map((pub) => (
                <div key={pub._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 hover-scale">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white leading-snug">
                        {pub.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-450">
                        <span className="flex items-center"><Globe size={10} className="mr-0.5" /> {pub.language}</span>
                        <span>•</span>
                        <span>{pub.category}</span>
                        <span>•</span>
                        <span>{new Date(pub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      pub.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : pub.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {pub.status === 'Approved' && <CheckCircle2 size={10} className="mr-0.5" />}
                      {pub.status === 'Rejected' && <AlertCircle size={10} className="mr-0.5" />}
                      {pub.status === 'Pending' && <Clock size={10} className="mr-0.5" />}
                      {pub.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans whitespace-pre-line">
                    {pub.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
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

export default Publications;
