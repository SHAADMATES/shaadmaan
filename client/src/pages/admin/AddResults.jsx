import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Printer, 
  Download, 
  Search, 
  Users, 
  Award,
  Medal,
  Sparkles
} from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';
import ShaadMatesLogo from '../../components/ShaadMatesLogo';

const AddResults = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // All candidates (students) across the entire institution
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Existing registered teams/groups for group programs
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [winners, setWinners] = useState([]);
  const [candidateFilter, setCandidateFilter] = useState('');

  // Toast & submission states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Fetch approved programs and all candidate students
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingStudents(true);
      try {
        const [progRes, stuRes] = await Promise.all([
          api.get('/admin/programs'),
          api.get('/admin/students')
        ]);
        setPrograms((progRes.data || []).filter(p => p.approved));
        setAllStudents(stuRes.data || []);
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load programs or student roster.');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchInitialData();
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
      // 1. Fetch any registrations/groups for this program
      try {
        const regRes = await api.get(`/admin/programs/${programId}/registrations`);
        setRegistrations(regRes.data || []);
      } catch (e) {
        setRegistrations([]);
      }

      // 2. Fetch existing results if already published to pre-populate
      try {
        const resRes = await api.get(`/results/${programId}`);
        if (resRes.data && resRes.data.winners && resRes.data.winners.length > 0) {
          const formattedWinners = resRes.data.winners.map(w => ({
            position: w.position,
            studentId: w.studentId?._id || w.studentId?.id || w.studentId || '',
            groupId: w.groupId?._id || w.groupId?.id || w.groupId || '',
            grade: w.grade || 'A',
            marks: w.marks ?? 90,
            points: w.points ?? 10,
            remarks: w.remarks || ''
          }));
          setWinners(formattedWinners);
          setToastType('info');
          setToastMessage('Existing results loaded. You can modify standings.');
        } else {
          initDefaultWinners();
        }
      } catch (e) {
        initDefaultWinners();
      }
    } catch (err) {
      setErrorMsg('Failed to initialize program standings workspace.');
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
      
      // Auto-assign default points based on position
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
      setErrorMsg('Please specify at least one winner entry.');
      return;
    }

    // Validation: Ensure a student or group is selected
    for (let i = 0; i < winners.length; i++) {
      const w = winners[i];
      if (selectedProgram.type === 'single' && !w.studentId) {
        setErrorMsg(`Row #${i + 1} (${w.position}): Please pick a student candidate.`);
        return;
      }
      if (selectedProgram.type === 'group' && !w.groupId && !w.studentId) {
        setErrorMsg(`Row #${i + 1} (${w.position}): Please pick a team or student representative.`);
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

      await api.post('/admin/results', payload);
      setToastType('success');
      setToastMessage('Program standings successfully declared and published!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit program results.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Prepare export data for UniversalExport
  const exportData = winners.map((w, i) => {
    const student = allStudents.find(s => (s._id || s.id) === w.studentId);
    return {
      Rank: i + 1,
      Position: w.position,
      CandidateName: student?.name || 'N/A',
      StudentID: student?.studentId || 'N/A',
      Wing: student?.wing || selectedProgram?.wing || 'General',
      Grade: w.grade,
      Marks: w.marks,
      Points: w.points,
      Remarks: w.remarks,
      Program: selectedProgram?.title || 'Program'
    };
  });

  const exportHeaders = [
    { key: 'Position', label: 'Position' },
    { key: 'CandidateName', label: 'Candidate Name' },
    { key: 'StudentID', label: 'Student ID' },
    { key: 'Wing', label: 'Wing' },
    { key: 'Grade', label: 'Grade' },
    { key: 'Marks', label: 'Marks' },
    { key: 'Points', label: 'Merit Points' },
    { key: 'Remarks', label: 'Remarks' },
  ];

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Program Selector Card */}
      <div className="glass-card border rounded-3xl p-6 shadow-md space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="text-royal" />
            <h3 className="text-lg font-bold font-sans">Declare Program Standing</h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Open Evaluation: All {allStudents.length} Students Eligible
          </span>
        </div>

        <div className="space-y-1 max-w-xl">
          <label className="form-label">Choose Approved Event / Program</label>
          <select
            value={selectedProgramId}
            onChange={(e) => handleProgramChange(e.target.value)}
            className="form-input"
          >
            <option value="">-- Select Event to Award Positions --</option>
            {programs.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.title} ({p.wing} Wing | {p.type === 'single' ? 'Solo' : 'Group'} | {new Date(p.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Winners Workspace */}
      {selectedProgramId && (
        <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6 printable-standings">
          {/* Institutional Print Header */}
          <div className="hidden print:flex items-center justify-between pb-4 mb-3 border-b-2 border-slate-900">
            <div className="flex items-center space-x-3">
              <ShaadMatesLogo size="sm" variant="emblem" />
              <div>
                <h1 className="text-xl font-black font-serif tracking-tight text-slate-900">
                  SHAAD MATES
                </h1>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                  Islamic Educational Academy • Official Program Standings Document
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600 font-medium">
              <p>Printed: {new Date().toLocaleString()}</p>
              <p>Database: Supabase PostgreSQL Cloud</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3 print:border-b-2 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-royal/10 text-royal dark:text-cyan border border-royal/20">
                  {selectedProgram?.wing} Wing
                </span>
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedProgram?.type} Event
                </span>
              </div>
              <h3 className="text-2xl font-extrabold font-sans text-slate-800 dark:text-white mt-1">
                Official Standings: {selectedProgram?.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Venue: {selectedProgram?.venue} | Date: {new Date(selectedProgram?.date).toLocaleDateString()}
              </p>
            </div>

            {/* Action Bar (Print, Export, Add Row) */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <UniversalExport
                data={exportData}
                filename={`${selectedProgram?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_standings`}
                headers={exportHeaders}
                label="Export Standings"
                title={`${selectedProgram?.title} - Standings Sheet`}
              />

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
                title="Print Standings Document"
              >
                <Printer size={14} className="mr-1.5" /> Print Sheet
              </button>

              <button
                type="button"
                onClick={handleAddWinner}
                className="px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-2xl text-xs flex items-center transition-colors"
              >
                <Plus size={14} className="mr-1" /> Add Position Row
              </button>
            </div>
          </div>

          {/* Candidate quick search */}
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

          {loadingRegistrations || loadingStudents ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-royal" />
              Loading candidate students and standings...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              <div className="space-y-4">
                {winners.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic bg-slate-500/5 rounded-2xl">
                    No positions added yet. Click "Add Position Row" to declare winners.
                  </div>
                ) : (
                  winners.map((winner, idx) => {
                    const selectedCandidate = allStudents.find(s => (s._id || s.id) === (winner.studentId || winner.groupId));
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

                    return (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end hover:border-royal/40 transition-colors"
                      >
                        {/* Position */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Position
                          </label>
                          <div className="hidden print:block font-bold text-slate-900 text-xs py-1">
                            {winner.position || 'N/A'}
                          </div>
                          <select
                            value={winner.position}
                            onChange={(e) => handleWinnerFieldChange(idx, 'position', e.target.value)}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl font-bold text-slate-800 dark:text-slate-100 text-xs print:hidden"
                          >
                            <option value="1st">🥇 1st Place</option>
                            <option value="2nd">🥈 2nd Place</option>
                            <option value="3rd">🥉 3rd Place</option>
                            <option value="Runner-up">🎖️ Runner-up</option>
                            <option value="Consolation">🎗️ Consolation</option>
                            <option value="Participation">📋 Participation</option>
                          </select>
                        </div>

                        {/* Recipient Candidate (All Students Visible & Printable) */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Candidate (All Students) *</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold print:hidden">
                              {filteredCandidates.length} Available
                            </span>
                          </label>
                          
                          {/* Print view: Bold Candidate Name and ID for official hardcopy */}
                          <div className="hidden print:block py-1">
                            {selectedCandidate ? (
                              <div className="text-slate-900">
                                <span className="font-extrabold text-sm">{selectedCandidate.name}</span>
                                <div className="text-[11px] font-semibold text-slate-600">
                                  ID: {selectedCandidate.studentId} • {selectedCandidate.wing || 'Campus'} Wing • {selectedCandidate.className || 'Class XII'}
                                </div>
                              </div>
                            ) : registrations.find(r => (r.groupId?._id || r.groupId?.id) === winner.groupId) ? (
                              <div className="text-slate-900 font-extrabold text-sm">
                                Team: {registrations.find(r => (r.groupId?._id || r.groupId?.id) === winner.groupId)?.groupId?.name}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Candidate not designated</span>
                            )}
                          </div>

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
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 print:hidden"
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
                            <optgroup label={`All Student Candidates (${filteredCandidates.length})`}>
                              {filteredCandidates.map(s => (
                                <option key={s._id || s.id} value={s._id || s.id}>
                                  {s.name} ({s.studentId} | {s.wing || 'General'} Wing | {s.className || 'Class XII'})
                                </option>
                              ))}
                            </optgroup>
                          </select>

                          {selectedCandidate && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate pt-0.5 print:hidden">
                              ✓ Candidate: {selectedCandidate.name} ({selectedCandidate.wing || 'General'} Wing)
                            </p>
                          )}
                        </div>

                      {/* Grade */}
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block">
                          Grade
                        </label>
                        <div className="hidden print:block font-bold text-slate-900 text-xs py-1 text-center">
                          {winner.grade || '-'}
                        </div>
                        <input
                          type="text"
                          value={winner.grade}
                          onChange={(e) => handleWinnerFieldChange(idx, 'grade', e.target.value)}
                          className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center font-bold text-xs print:hidden"
                          placeholder="A+"
                        />
                      </div>

                      {/* Marks */}
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block">
                          Marks
                        </label>
                        <div className="hidden print:block font-bold text-slate-900 text-xs py-1 text-center">
                          {winner.marks || '0'}
                        </div>
                        <input
                          type="number"
                          value={winner.marks}
                          onChange={(e) => handleWinnerFieldChange(idx, 'marks', e.target.value)}
                          className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center text-xs print:hidden"
                          min="0"
                          max="100"
                        />
                      </div>

                      {/* Points */}
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center block text-royal dark:text-cyan">
                          Points
                        </label>
                        <div className="hidden print:block font-black text-slate-900 text-xs py-1 text-center">
                          +{winner.points || '0'}
                        </div>
                        <input
                          type="number"
                          value={winner.points}
                          onChange={(e) => handleWinnerFieldChange(idx, 'points', e.target.value)}
                          className="w-full px-2 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-center font-black text-royal dark:text-cyan text-xs print:hidden"
                          min="0"
                        />
                      </div>

                      {/* Remarks */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Remarks
                        </label>
                        <div className="hidden print:block font-medium text-slate-700 text-xs py-1">
                          {winner.remarks || '-'}
                        </div>
                        <input
                          type="text"
                          value={winner.remarks}
                          onChange={(e) => handleWinnerFieldChange(idx, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs print:hidden"
                          placeholder="e.g. Outstanding delivery"
                        />
                      </div>

                      {/* Delete Action */}
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

              {/* Printable Signatures block for official printout */}
              <div className="hidden print:block pt-12 mt-8 border-t-2 border-slate-300">
                <div className="grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-800">
                  <div className="border-t border-slate-400 pt-2">
                    <p>Chief Adjudicator / Judge</p>
                    <p className="font-normal text-[10px] text-slate-500">Signature & Date</p>
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <p>Wing Chairman ({selectedProgram?.wing})</p>
                    <p className="font-normal text-[10px] text-slate-500">Endorsed</p>
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <p>Principal / Chief Administrator</p>
                    <p className="font-normal text-[10px] text-slate-500">Official Seal</p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
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
  );
};

export default AddResults;
