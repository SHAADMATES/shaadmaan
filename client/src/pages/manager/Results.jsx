import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ClipboardList, 
  Printer, 
  Search, 
  Users, 
  Award,
  Sparkles 
} from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const ManagerResults = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'publish'
  const [results, setResults] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish Form States
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [winners, setWinners] = useState([]);
  const [candidateFilter, setCandidateFilter] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchResultsAndPrograms = async () => {
    setLoading(true);
    try {
      const [resRes, progRes, stuRes] = await Promise.all([
        api.get('/chairman/results'),
        api.get('/chairman/programs'),
        // Fetch candidates: try chairman endpoint, and admin students as fallback/supplement
        api.get('/chairman/students').catch(() => api.get('/admin/students'))
      ]);
      setResults(resRes.data || []);
      setPrograms((progRes.data || []).filter(p => p.approved));
      
      let candidateList = stuRes.data || [];
      // If candidateList is small, also merge with all students from /admin/students if accessible
      try {
        const fullRoster = await api.get('/admin/students');
        if (fullRoster.data && fullRoster.data.length > candidateList.length) {
          candidateList = fullRoster.data;
        }
      } catch (e) {
        // Ignored if chairman role doesn't have admin route access
      }
      setAllStudents(candidateList);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load wing program standings and candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsAndPrograms();
  }, []);

  const handleProgramChange = async (programId) => {
    setSelectedProgramId(programId);
    setWinners([]);
    setRegistrations([]);
    setErrorMsg('');
    
    if (!programId) {
      setSelectedProgram(null);
      return;
    }

    const prog = programs.find(p => (p._id || p.id) === programId);
    setSelectedProgram(prog);
    setLoadingRegistrations(true);

    try {
      // 1. Fetch registrations for this wing/program if any
      try {
        const regRes = await api.get('/chairman/registrations');
        const programRegs = (regRes.data || []).filter(r => (r.programId?._id || r.programId?.id || r.programId) === programId);
        setRegistrations(programRegs);
      } catch (e) {
        setRegistrations([]);
      }

      // 2. Check existing results
      const existing = results.find(r => (r.programId?._id || r.programId?.id || r.programId) === programId);
      if (existing && existing.winners && existing.winners.length > 0) {
        const formattedWinners = existing.winners.map(w => ({
          position: w.position,
          studentId: w.studentId?._id || w.studentId?.id || w.studentId || '',
          groupId: w.groupId?._id || w.groupId?.id || w.groupId || '',
          grade: w.grade || 'A',
          marks: w.marks ?? 90,
          points: w.points ?? 10,
          remarks: w.remarks || ''
        }));
        setWinners(formattedWinners);
      } else {
        initDefaultWinners();
      }
    } catch (err) {
      initDefaultWinners();
      setErrorMsg('Failed to initialize program standing entry.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const initDefaultWinners = () => {
    setWinners([
      { position: '1st', studentId: '', groupId: '', grade: 'A+', marks: 95, points: 10, remarks: 'Champion' },
      { position: '2nd', studentId: '', groupId: '', grade: 'A', marks: 88, points: 8, remarks: 'Runner-up' },
      { position: '3rd', studentId: '', groupId: '', grade: 'B+', marks: 80, points: 6, remarks: 'Second Runner-up' }
    ]);
  };

  const handleAddWinner = () => {
    setWinners(prev => [
      ...prev,
      {
        position: 'Runner-up',
        studentId: '',
        groupId: '',
        grade: 'B',
        marks: 75,
        points: 4,
        remarks: 'Special Mention'
      }
    ]);
  };

  const handleRemoveWinner = (idx) => {
    setWinners(prev => prev.filter((_, i) => i !== idx));
  };

  const handleWinnerFieldChange = (idx, field, value) => {
    setWinners(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      
      if (field === 'position') {
        if (value === '1st') {
          updated[idx].points = 10;
          updated[idx].grade = 'A+';
        } else if (value === '2nd') {
          updated[idx].points = 8;
          updated[idx].grade = 'A';
        } else if (value === '3rd') {
          updated[idx].points = 6;
          updated[idx].grade = 'B+';
        } else if (value === 'Runner-up') {
          updated[idx].points = 4;
          updated[idx].grade = 'B';
        } else if (value === 'Consolation') {
          updated[idx].points = 3;
          updated[idx].grade = 'B';
        } else {
          updated[idx].points = 2;
          updated[idx].grade = 'C';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    if (winners.length === 0) {
      setErrorMsg('Please specify at least one standing winner.');
      return;
    }

    // Validation: Ensure each row has a candidate student or team
    for (let i = 0; i < winners.length; i++) {
      const w = winners[i];
      if (!w.studentId && !w.groupId) {
        setErrorMsg(`Row #${i + 1} (${w.position}): Please pick a student candidate or team.`);
        return;
      }
    }

    setLoadingSubmit(true);
    setErrorMsg('');

    try {
      const payload = {
        programId: selectedProgramId,
        type: selectedProgram.type,
        winners: winners.map(w => ({
          position: w.position,
          studentId: w.studentId || null,
          groupId: w.groupId || null,
          grade: w.grade || 'A',
          marks: Number(w.marks) || 0,
          points: Number(w.points) || 0,
          remarks: w.remarks || ''
        }))
      };

      await api.post('/chairman/results', payload);
      setToastType('success');
      setToastMessage('Results standings successfully published to Website registry & certificates generated!');
      
      // Refresh
      setSelectedProgramId('');
      setSelectedProgram(null);
      setWinners([]);
      setActiveTab('list');
      fetchResultsAndPrograms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit program standing.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Filtered candidate roster based on search filter
  const filteredCandidates = allStudents.filter(s => {
    if (!candidateFilter) return true;
    const q = candidateFilter.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.wing?.toLowerCase().includes(q) ||
      s.className?.toLowerCase().includes(q)
    );
  });

  // Export data for UniversalExport
  const exportStandingsData = winners.map((w, idx) => {
    const student = allStudents.find(s => (s._id || s.id) === w.studentId);
    return {
      Rank: idx + 1,
      Position: w.position,
      Candidate: student?.name || 'Assigned Candidate',
      StudentID: student?.studentId || 'N/A',
      Wing: student?.wing || selectedProgram?.wing || 'Wing',
      Grade: w.grade,
      Marks: w.marks,
      Points: w.points,
      Remarks: w.remarks || 'N/A',
      Program: selectedProgram?.title || 'Program Event'
    };
  });

  const exportHeaders = [
    { key: 'Position', label: 'Position' },
    { key: 'Candidate', label: 'Candidate Name' },
    { key: 'StudentID', label: 'Student ID' },
    { key: 'Wing', label: 'Wing' },
    { key: 'Grade', label: 'Grade' },
    { key: 'Marks', label: 'Marks' },
    { key: 'Points', label: 'Merit Points' },
    { key: 'Remarks', label: 'Remarks' },
  ];

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header Tabs & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b dark:border-slate-800 pb-3 gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-850 dark:text-white">
            <Trophy className="text-gold" />
            <span>Wing Program Standings & Results</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Open Evaluation: All {allStudents.length} candidate students are eligible for positions and awards.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-royal text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Published Standings ({results.length})
            </button>
            <button
              onClick={() => { setActiveTab('publish'); handleProgramChange(''); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'publish'
                  ? 'bg-royal text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Declare Standing
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-4 text-slate-400" size={28} />
          Loading Standings registry and student roster...
        </div>
      ) : activeTab === 'list' ? (
        /* Standings list view */
        results.length === 0 ? (
          <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
            No program standings published in your wing yet. Click "Declare Standing" to award positions to candidates.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <span className="text-xs font-semibold text-slate-500">
                Displaying {results.length} published event scorecards
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
              >
                <Printer size={14} className="mr-1.5" /> Print Overview
              </button>
            </div>

            {results.map((resObj) => {
              const resExportData = (resObj.winners || []).map((w, idx) => ({
                Position: w.position,
                Candidate: w.studentId?.name || w.groupId?.name || 'N/A',
                StudentID: w.studentId?.studentId || 'N/A',
                Grade: w.grade || 'A',
                Marks: w.marks || 0,
                Points: w.points || 0,
                Remarks: w.remarks || 'N/A',
                Program: resObj.programId?.title || 'Program'
              }));

              return (
                <div key={resObj._id || resObj.id} className="p-6 rounded-3xl glass-card border space-y-4 shadow border-slate-200/50 print:border-b-2 print:border-black">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-800 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-royal dark:text-cyan uppercase tracking-wider">
                        Official Program Standing
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
                        {resObj.programId?.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Published: {new Date(resObj.publishedAt || Date.now()).toLocaleDateString()} | Wing: {resObj.programId?.wing || 'Wing'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 print:hidden">
                      <UniversalExport
                        data={resExportData}
                        filename={`${resObj.programId?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_standings`}
                        headers={exportHeaders}
                        label="Export"
                        title={`${resObj.programId?.title} - Standings Sheet`}
                      />
                      <button
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center"
                        title="Print Sheet"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resObj.winners.map((winner, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800/60 flex items-center justify-between hover-scale"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg uppercase border ${
                              winner.position === '1st'
                                ? 'bg-amber-100/80 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                : winner.position === '2nd'
                                ? 'bg-slate-200 border-slate-350 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-orange-100/70 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400'
                            }`}>
                              {winner.position === '1st' ? '🥇 1st' : winner.position === '2nd' ? '🥈 2nd' : winner.position === '3rd' ? '🥉 3rd' : winner.position}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">Grade: {winner.grade}</span>
                          </div>
                          
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-1 truncate max-w-[170px]">
                            {winner.studentId?.name || winner.groupId?.name || 'Candidate'}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {winner.studentId?.studentId ? `ID: ${winner.studentId.studentId}` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 italic truncate max-w-[170px]">"{winner.remarks || 'Honored candidate.'}"</p>
                        </div>

                        <div className="text-right pl-2">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Points</div>
                          <div className="text-xl font-black text-royal dark:text-cyan">+{winner.points}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{winner.marks} marks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Standings publish form view */
        <div className="space-y-6">
          <div className="glass-card border rounded-3xl p-6 shadow-md space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-sans text-slate-800 dark:text-white flex items-center space-x-2">
                <Trophy size={16} className="text-royal" />
                <span>Choose Approved Program Activity</span>
              </h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                All {allStudents.length} Students Eligible
              </span>
            </div>

            <div className="max-w-xl space-y-1">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Program Event
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
              >
                <option value="">-- Choose Program Event to Award Standings --</option>
                {programs.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.title} ({p.wing} Wing | {p.type === 'single' ? 'Solo' : 'Group'} | {new Date(p.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProgramId && (
            <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-800 pb-4 gap-3 print:border-b-2 print:border-black">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-royal/10 text-royal dark:text-cyan border border-royal/20">
                      {selectedProgram?.wing} Wing
                    </span>
                    <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedProgram?.type} Event
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                    Standings Sheet: {selectedProgram?.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Venue: {selectedProgram?.venue} | Open Candidate Assignment Active
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <UniversalExport
                    data={exportStandingsData}
                    filename={`${selectedProgram?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_standings`}
                    headers={exportHeaders}
                    label="Export Standings"
                    title={`${selectedProgram?.title} - Standings Sheet`}
                  />

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
                  >
                    <Printer size={14} className="mr-1.5" /> Print Sheet
                  </button>

                  <button
                    type="button"
                    onClick={handleAddWinner}
                    className="px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-2xl text-xs flex items-center justify-center transition-colors"
                  >
                    <Plus size={14} className="mr-1" /> Add Position Row
                  </button>
                </div>
              </div>

              {/* Quick candidate filter */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2 print:hidden">
                <Search size={16} className="text-slate-400 shrink-0 ml-1" />
                <input
                  type="text"
                  placeholder="Quick search student candidate by name, admission ID, or wing..."
                  value={candidateFilter}
                  onChange={(e) => setCandidateFilter(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                {candidateFilter && (
                  <button
                    onClick={() => setCandidateFilter('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center print:hidden">
                  <AlertCircle size={16} className="mr-2 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {loadingRegistrations ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-royal" />
                  Loading candidate students and standings...
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  <div className="space-y-4">
                    {winners.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-500/5 rounded-2xl">
                        No positions specified. Click "Add Position Row" above.
                      </div>
                    ) : (
                      winners.map((winner, idx) => {
                        const selectedStudent = allStudents.find(s => (s._id || s.id) === winner.studentId);
                        
                        return (
                          <div 
                            key={idx} 
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end hover:border-royal/40 transition-colors"
                          >
                            {/* Position */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Position
                              </label>
                              <select
                                value={winner.position}
                                onChange={(e) => handleWinnerFieldChange(idx, 'position', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-xs"
                              >
                                <option value="1st">🥇 1st Place</option>
                                <option value="2nd">🥈 2nd Place</option>
                                <option value="3rd">🥉 3rd Place</option>
                                <option value="Runner-up">🎖️ Runner-up</option>
                                <option value="Consolation">🎗️ Consolation</option>
                                <option value="Participation">📋 Participation</option>
                              </select>
                            </div>

                            {/* Recipient candidate selection (ALL STUDENTS SHOWN) */}
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Candidate Student (All Candidates) *</span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  {filteredCandidates.length} Available
                                </span>
                              </label>
                              
                              <select
                                value={winner.studentId || winner.groupId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const isGroup = registrations.some(r => (r.groupId?._id || r.groupId?.id) === val);
                                  if (isGroup) {
                                    handleWinnerFieldChange(idx, 'groupId', val);
                                    handleWinnerFieldChange(idx, 'studentId', '');
                                  } else {
                                    handleWinnerFieldChange(idx, 'studentId', val);
                                    handleWinnerFieldChange(idx, 'groupId', '');
                                  }
                                }}
                                className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                              >
                                <option value="">-- Choose Any Candidate Student --</option>
                                
                                {registrations.length > 0 && (
                                  <optgroup label="Registered Teams / Groups">
                                    {registrations.map(r => (
                                      <option key={r._id || r.id} value={r.groupId?._id || r.groupId?.id}>
                                        Team: {r.groupId?.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                <optgroup label={`All Candidate Students (${filteredCandidates.length})`}>
                                  {filteredCandidates.map(s => (
                                    <option key={s._id || s.id} value={s._id || s.id}>
                                      {s.name} ({s.studentId} | {s.wing || 'Wing'} | {s.className || 'Class XII'})
                                    </option>
                                  ))}
                                </optgroup>
                              </select>

                              {selectedStudent && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate pt-0.5">
                                  ✓ Selected: {selectedStudent.name} ({selectedStudent.wing || 'General'} Wing)
                                </p>
                              )}
                            </div>

                            {/* Grade */}
                            <div className="sm:col-span-1 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block">
                                Grade
                              </label>
                              <input
                                type="text"
                                value={winner.grade}
                                onChange={(e) => handleWinnerFieldChange(idx, 'grade', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center font-bold text-xs"
                                placeholder="A+"
                              />
                            </div>

                            {/* Marks */}
                            <div className="sm:col-span-1 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block">
                                Marks
                              </label>
                              <input
                                type="number"
                                value={winner.marks}
                                onChange={(e) => handleWinnerFieldChange(idx, 'marks', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center text-xs"
                                min="0"
                                max="100"
                              />
                            </div>

                            {/* Points */}
                            <div className="sm:col-span-1 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block text-royal dark:text-cyan">
                                Points
                              </label>
                              <input
                                type="number"
                                value={winner.points}
                                onChange={(e) => handleWinnerFieldChange(idx, 'points', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center font-black text-royal dark:text-cyan text-xs"
                                min="0"
                              />
                            </div>

                            {/* Remarks */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Remarks
                              </label>
                              <input
                                type="text"
                                value={winner.remarks}
                                onChange={(e) => handleWinnerFieldChange(idx, 'remarks', e.target.value)}
                                className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs"
                                placeholder="e.g. Excellent delivery"
                              />
                            </div>

                            {/* Remove row */}
                            <div className="sm:col-span-1 flex justify-center pb-0.5 print:hidden">
                              <button
                                type="button"
                                onClick={() => handleRemoveWinner(idx)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="Remove row"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Print Signatures Block */}
                  <div className="hidden print:block pt-12 mt-8 border-t-2 border-slate-300">
                    <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-800">
                      <div className="border-t border-slate-400 pt-2">
                        <p>Wing Chairman ({selectedProgram?.wing})</p>
                        <p className="font-normal text-[10px] text-slate-500">Evaluator Signature</p>
                      </div>
                      <div className="border-t border-slate-400 pt-2">
                        <p>Academic Dean / Coordinator</p>
                        <p className="font-normal text-[10px] text-slate-500">Endorsed</p>
                      </div>
                      <div className="border-t border-slate-400 pt-2">
                        <p>Chief Administrator</p>
                        <p className="font-normal text-[10px] text-slate-500">Official Seal</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t dark:border-slate-850 print:hidden">
                    <button
                      type="submit"
                      disabled={loadingSubmit || winners.length === 0}
                      className="px-8 py-3.5 bg-gradient-to-r from-royal to-cyan hover:from-royal-dark hover:to-cyan-dark text-white font-extrabold rounded-2xl shadow-lg hover:shadow-cyan/30 transition-all disabled:opacity-50 flex items-center justify-center glow-blue"
                    >
                      {loadingSubmit ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle2 size={18} className="mr-2" /> Declare & Publish Standings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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

export default ManagerResults;
