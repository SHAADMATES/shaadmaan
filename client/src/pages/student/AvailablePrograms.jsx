import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Search, 
  FolderKanban, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  User, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Tag, 
  X,
  Trophy
} from 'lucide-react';
import Toast from '../../components/Toast';

const AvailablePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected Program for Details Modal
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/programs');
      setPrograms(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load programs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const wingsList = Array.from(new Set(programs.map(p => p.wing).filter(Boolean)));

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWing = wingFilter ? p.wing === wingFilter : true;
    const matchesType = typeFilter ? p.type === typeFilter : true;

    return matchesSearch && matchesWing && matchesType;
  });

  return (
    <div className="p-6 space-y-8 animate-scale">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-royal via-royal-light to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-gold" />
            <span>Open Campus Participation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Programs & Events Directory
          </h2>
          <p className="text-sm sm:text-base text-slate-100 max-w-2xl font-light leading-relaxed">
            All programs are open to all enrolled students! You do not need to submit any pre-registration form. Simply turn up at the venue on schedule and present your student ID to compete.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-6 rounded-3xl border space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title, venue, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-11"
            />
          </div>

          <div>
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Wings</option>
              {wingsList.map((w, idx) => (
                <option key={idx} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Event Types</option>
              <option value="single">Individual (Solo)</option>
              <option value="group">Team (Group)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Program Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border space-y-3">
          <FolderKanban size={48} className="mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Programs Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No events match your current filter criteria. Try clearing your search or wing filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const rules = prog.rules ? (() => {
              try { return JSON.parse(prog.rules); } catch { return []; }
            })() : [];

            return (
              <div
                key={prog._id || prog.id}
                className="p-6 rounded-3xl glass-card border hover-scale shadow-sm flex flex-col justify-between space-y-5 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-royal/10 dark:bg-cyan/10 text-royal dark:text-cyan border border-royal/20 dark:border-cyan/20 uppercase tracking-wider">
                      {prog.wing || 'Campus'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Open to All
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {prog.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prog.description || 'Join this exciting competition to earn merit points and prestigious standings for your wing.'}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-royal shrink-0" />
                      <span>{new Date(prog.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-cyan shrink-0" />
                      <span>{prog.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500 shrink-0" />
                      <span className="line-clamp-1">{prog.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-emerald-500 shrink-0" />
                      <span>Type: <strong className="capitalize text-slate-700 dark:text-slate-200">{prog.type}</strong> {prog.maxParticipants > 0 ? `(${prog.maxParticipants} max per team)` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(prog)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-royal hover:text-white dark:hover:bg-cyan dark:hover:text-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Info size={14} /> View Rules & Guidelines
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-royal/10 dark:bg-cyan/10 text-royal dark:text-cyan border border-royal/20 dark:border-cyan/20 uppercase tracking-wider">
                  {selectedProgram.wing} Wing
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedProgram.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed flex items-start gap-3">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <strong className="block font-bold mb-0.5">Direct Participation Active</strong>
                Pre-registration is completely waived for this program. All enrolled students are invited to appear directly at the venue at the stated time with their Student ID Card.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold block">Date & Time</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {new Date(selectedProgram.date).toLocaleDateString()} at {selectedProgram.time}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold block">Venue</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{selectedProgram.venue}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold block">Format</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">
                  {selectedProgram.type} Competition {selectedProgram.maxParticipants > 0 ? `(Max ${selectedProgram.maxParticipants})` : ''}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold block">Status</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">Approved & Scheduled</p>
              </div>
            </div>

            {selectedProgram.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {selectedProgram.description}
                </p>
              </div>
            )}

            {/* Rules list */}
            {selectedProgram.rules && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-royal" /> Event Rules & Criteria
                </h4>
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedProgram.rules);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return (
                        <ul className="space-y-2 text-xs">
                          {parsed.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-royal mt-1.5 shrink-0"></span>
                              <span>{typeof r === 'string' ? r : r.rule || JSON.stringify(r)}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  } catch (e) {}
                  return (
                    <p className="text-xs text-slate-400 italic">
                      Standard campus competition guidelines apply. Bring your student badge and necessary materials.
                    </p>
                  );
                })()}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailablePrograms;
