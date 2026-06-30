import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Trophy, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const AddResults = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [winners, setWinners] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/admin/programs');
        // Only show approved programs
        setPrograms(res.data.filter(p => p.approved));
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load programs.');
      }
    };
    fetchPrograms();
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

    const prog = programs.find(p => p._id === programId);
    setSelectedProgram(prog);
    setLoadingRegistrations(true);

    try {
      // 1. Fetch registered students/groups for this program
      const regRes = await api.get(`/admin/programs/${programId}/registrations`);
      setRegistrations(regRes.data);

      // 2. Fetch existing results if any to pre-populate
      try {
        const resRes = await api.get(`/results/${programId}`);
        if (resRes.data && resRes.data.winners) {
          // Map backend winner object into form state
          const formattedWinners = resRes.data.winners.map(w => ({
            position: w.position,
            studentId: w.studentId?._id || '',
            groupId: w.groupId?._id || '',
            grade: w.grade || '',
            marks: w.marks || 0,
            points: w.points || 0,
            remarks: w.remarks || ''
          }));
          setWinners(formattedWinners);
          setToastType('info');
          setToastMessage('Existing results loaded. You can edit them.');
        }
      } catch (e) {
        // No results published yet, start with blank winner list
        handleAddWinner(prog.type);
      }
    } catch (err) {
      setErrorMsg('Failed to load registered participants.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleAddWinner = (type) => {
    setWinners(prev => [
      ...prev,
      {
        position: '1st',
        studentId: '',
        groupId: '',
        grade: 'A+',
        marks: 100,
        points: 10,
        remarks: ''
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
      setErrorMsg('Please add at least one winner entry.');
      return;
    }

    // Validation check: Check if all winner selections are completed
    for (let w of winners) {
      if (selectedProgram.type === 'single' && !w.studentId) {
        setErrorMsg('Please select a student for each winner position.');
        return;
      }
      if (selectedProgram.type === 'group' && !w.groupId) {
        setErrorMsg('Please select a team for each winner position.');
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
          studentId: selectedProgram.type === 'single' ? w.studentId : null,
          groupId: selectedProgram.type === 'group' ? w.groupId : null,
          grade: w.grade,
          marks: Number(w.marks),
          points: Number(w.points),
          remarks: w.remarks
        }))
      };

      await api.post('/admin/results', payload);
      setToastType('success');
      setToastMessage('Program results published successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit program results.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Program Selector Card */}
      <div className="glass-card border rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Trophy className="text-royal" />
          <h3 className="text-lg font-bold font-sans">Declare Program Standing</h3>
        </div>

        <div className="space-y-1 max-w-md">
          <label className="form-label  ">Choose Approved Program</label>
          <select
            value={selectedProgramId}
            onChange={(e) => handleProgramChange(e.target.value)}
            className="form-input"
          >
            <option value="">Select Program</option>
            {programs.map(p => (
              <option key={p._id} value={p._id}>{p.title} ({p.wing})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Winners Form */}
      {selectedProgramId && (
        <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
            <div>
              <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white">
                Assign Positions for: {selectedProgram?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Program Type:{' '}
                <span className="font-semibold uppercase text-royal">{selectedProgram?.type}</span>
                {' '}| Total Registered: {registrations.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddWinner(selectedProgram?.type)}
              className="px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-xl text-xs flex items-center justify-center transition-colors"
            >
              <Plus size={14} className="mr-1" /> Add Standings row
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
              <AlertCircle size={14} className="mr-2 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingRegistrations ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-slate-400" />
              Loading registered students...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
              <div className="space-y-4">
                {winners.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic bg-slate-500/5 rounded-2xl">
                    No winner entries. Click "Add Standings row" to specify achievements.
                  </div>
                ) : (
                  winners.map((winner, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-6 gap-4 items-end animate-scale"
                    >
                      {/* Position */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">Position</label>
                        <select
                          value={winner.position}
                          onChange={(e) => handleWinnerFieldChange(idx, 'position', e.target.value)}
                          className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                        >
                          <option value="1st">1st Place</option>
                          <option value="2nd">2nd Place</option>
                          <option value="3rd">3rd Place</option>
                          <option value="Runner-up">Runner-up</option>
                          <option value="Participation">Participation</option>
                        </select>
                      </div>

                      {/* Recipient Student/Group */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-400">
                          {selectedProgram.type === 'single' ? 'Select Student *' : 'Select Registered Team *'}
                        </label>
                        {selectedProgram.type === 'single' ? (
                          <select
                            value={winner.studentId}
                            onChange={(e) => handleWinnerFieldChange(idx, 'studentId', e.target.value)}
                            className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-xs"
                          >
                            <option value="">Choose Registered Student</option>
                            {registrations.map(r => (
                              <option key={r._id} value={r.studentId?._id}>
                                {r.studentId?.name} ({r.studentId?.studentId})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={winner.groupId}
                            onChange={(e) => handleWinnerFieldChange(idx, 'groupId', e.target.value)}
                            className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-xs"
                          >
                            <option value="">Choose Registered Team</option>
                            {registrations.map(r => (
                              <option key={r._id} value={r.groupId?._id}>
                                {r.groupId?.name} (Leader: {r.studentId?.name})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Grade & Marks */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">Grade</label>
                          <input
                            type="text"
                            value={winner.grade}
                            onChange={(e) => handleWinnerFieldChange(idx, 'grade', e.target.value)}
                            className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-center"
                            placeholder="A+"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">Marks</label>
                          <input
                            type="number"
                            value={winner.marks}
                            onChange={(e) => handleWinnerFieldChange(idx, 'marks', e.target.value)}
                            className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-center"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      {/* Points */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">Points</label>
                        <input
                          type="number"
                          value={winner.points}
                          onChange={(e) => handleWinnerFieldChange(idx, 'points', e.target.value)}
                          className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-center font-bold text-royal dark:text-cyan"
                          min="0"
                        />
                      </div>

                      {/* Remarks & Delete button */}
                      <div className="flex space-x-2 items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <label className="text-xs font-semibold text-slate-400">Remarks</label>
                          <input
                            type="text"
                            value={winner.remarks}
                            onChange={(e) => handleWinnerFieldChange(idx, 'remarks', e.target.value)}
                            className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                            placeholder="Excellent work"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWinner(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all self-end mb-1.5"
                          title="Remove row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={loadingSubmit || winners.length === 0}
                  className="px-8 py-3 bg-royal hover:bg-royal-dark text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center glow-blue"
                >
                  {loadingSubmit ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="mr-1.5" /> Publish Standings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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

export default AddResults;
