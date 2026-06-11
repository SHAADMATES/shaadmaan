import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Search, FolderKanban, Check, Plus, X, Users, User, AlertCircle, Info, Calendar } from 'lucide-react';
import Toast from '../../components/Toast';

const AvailablePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected Program for Details Panel
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Registration states
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]); // Array of Student objects
  
  // Student lookup search
  const [studentQuery, setStudentQuery] = useState('');
  const [studentMatches, setStudentMatches] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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

  // Search students for group invitations
  useEffect(() => {
    const searchInvitedStudents = async () => {
      if (studentQuery.length < 2) {
        setStudentMatches([]);
        return;
      }
      setSearchingStudents(true);
      try {
        const res = await api.get(`/student/search?query=${studentQuery}`);
        
        // Filter out already selected members
        const invitedIds = invitedMembers.map(m => m._id);
        const filteredMatches = res.data.filter(s => !invitedIds.includes(s._id));

        setStudentMatches(filteredMatches);
      } catch (err) {
        console.error('Failed to lookup students', err);
      } finally {
        setSearchingStudents(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchInvitedStudents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [studentQuery, invitedMembers]);

  const handleOpenRegister = () => {
    if (!selectedProgram) return;
    setTeamName('');
    setInvitedMembers([]);
    setStudentQuery('');
    setStudentMatches([]);
    setErrorMsg('');
    setRegModalOpen(true);
  };

  const handleSelectStudent = (student) => {
    setInvitedMembers(prev => [...prev, student]);
    setStudentQuery('');
    setStudentMatches([]);
  };

  const handleRemoveInvited = (id) => {
    setInvitedMembers(prev => prev.filter(m => m._id !== id));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;

    if (selectedProgram.type === 'group' && !teamName) {
      setErrorMsg('Please specify a Team Name.');
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg('');

    try {
      const payload = {
        programId: selectedProgram._id,
        type: selectedProgram.type
      };

      if (selectedProgram.type === 'group') {
        payload.teamName = teamName;
        payload.memberIds = invitedMembers.map(m => m._id);
      }

      await api.post('/student/registrations', payload);
      setToastType('success');
      setToastMessage('Successfully registered for program!');
      setRegModalOpen(false);
      
      // Update status/registrations if needed
      fetchPrograms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Filters
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWing = wingFilter === '' || p.wing === wingFilter;
    const matchesType = typeFilter === '' || p.type === typeFilter;
    return matchesSearch && matchesWing && matchesType;
  });

  const wingsList = [...new Set(programs.map(p => p.wing))].filter(Boolean);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Search and Filters */}
      <div className="bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl text-sm w-full focus:outline-none"
          />
        </div>

        <select
          value={wingFilter}
          onChange={(e) => setWingFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl text-sm focus:outline-none"
        >
          <option value="">All Wings</option>
          {wingsList.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl text-sm focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="group">Group</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Programs Grid */}
        <div className="lg:col-span-2 space-y-4 h-fit">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading programs...
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
              No programs found matching search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPrograms.map((p) => (
                <div 
                  key={p._id} 
                  className={`p-6 rounded-3xl glass-card border flex flex-col justify-between hover-scale cursor-pointer ${
                    selectedProgram?._id === p._id ? 'border-royal shadow-lg ring-1 ring-royal' : 'shadow'
                  }`}
                  onClick={() => setSelectedProgram(p)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {p.wing}
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        p.type === 'single'
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20'
                      }`}>
                        {p.type}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-white leading-tight">
                      {p.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1 text-royal" />
                      {new Date(p.date).toLocaleDateString()}
                    </span>
                    <span className="text-royal font-bold">Status: {p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Program Detail Panel */}
        <div className="glass-card border rounded-3xl p-6 shadow-lg h-fit space-y-6">
          {selectedProgram ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{selectedProgram.wing}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${
                  selectedProgram.type === 'single'
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20'
                }`}>
                  {selectedProgram.type}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white leading-tight animate-scale">
                  {selectedProgram.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Status: {selectedProgram.status}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/50 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Date</p>
                  <p className="font-semibold">{new Date(selectedProgram.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Time</p>
                  <p className="font-semibold">{selectedProgram.time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Venue</p>
                  <p className="font-semibold">{selectedProgram.venue}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-slate-400">Description</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-500/5 p-3 rounded-xl">
                  {selectedProgram.description || 'No description provided.'}
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-slate-400">Rules & Instructions</h4>
                {selectedProgram.rules && selectedProgram.rules.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 bg-slate-500/5 p-3 rounded-xl text-slate-600 dark:text-slate-300">
                    {selectedProgram.rules.map((rule, index) => (
                      <li key={index} className="leading-relaxed">{rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic bg-slate-500/5 p-3 rounded-xl">No specific rules defined.</p>
                )}
              </div>

              {/* Register Action */}
              {selectedProgram.status === 'Active' || selectedProgram.status === 'Upcoming' ? (
                <button
                  onClick={handleOpenRegister}
                  className="w-full py-3 bg-royal hover:bg-royal-dark text-white font-bold rounded-2xl text-xs shadow-md transition-all glow-blue"
                >
                  Register for this Event
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold rounded-2xl text-xs cursor-not-allowed"
                >
                  Registrations Closed
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 text-sm space-y-2">
              <Info size={32} className="text-slate-300 dark:text-slate-600" />
              <p className="font-semibold">No Event Selected</p>
              <p className="text-xs">Click a program in the grid to view specifications and register.</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="glass-card border rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-sans">
                Event Registration Details
              </h3>
              <button onClick={() => setRegModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
                <AlertCircle size={14} className="mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850/50 text-xs space-y-1">
                <p className="text-slate-400 font-medium">Program Title</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedProgram?.title}</p>
                <p className="text-slate-400 mt-1 font-medium">Type</p>
                <p className="font-semibold uppercase text-royal">{selectedProgram?.type} program</p>
              </div>

              {/* Group Fields */}
              {selectedProgram?.type === 'group' && (
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Team Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Team Name *</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="e.g. Cyber Knights"
                    />
                  </div>

                  {/* Team Members Invite Lookup */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-semibold text-slate-500">Invite Members (Start typing fellow student name/ID...)</label>
                    <input
                      type="text"
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                      placeholder="Search..."
                    />

                    {/* Lookup result list */}
                    {studentMatches.length > 0 && (
                      <div className="absolute top-[68px] inset-x-0 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg z-50 p-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                        {studentMatches.map(student => (
                          <div
                            key={student._id}
                            onClick={() => handleSelectStudent(student)}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-semibold flex items-center justify-between rounded-lg"
                          >
                            <span>{student.name} ({student.studentId})</span>
                            <span className="text-[10px] text-slate-400 font-normal uppercase">{student.wing}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchingStudents && (
                      <div className="absolute right-3 top-[34px]">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Invited list chips */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400">Team Roster (Auto-includes you as Leader):</p>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-500/5 rounded-2xl min-h-[50px]">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-royal/15 text-royal border border-royal/20 rounded-xl flex items-center">
                        You (Leader)
                      </span>
                      {invitedMembers.map(member => (
                        <span 
                          key={member._id} 
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center"
                        >
                          {member.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveInvited(member._id)}
                            className="ml-1.5 p-0.5 text-slate-400 hover:text-rose-500 rounded"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="px-6 py-2 bg-royal hover:bg-royal-dark text-white font-bold rounded-xl transition-all shadow glow-blue"
                >
                  {loadingSubmit ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Signup'
                  )}
                </button>
              </div>
            </form>
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

export default AvailablePrograms;
