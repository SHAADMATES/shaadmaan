import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Trophy, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Layers, ClipboardList } from 'lucide-react';
import Toast from '../../components/Toast';

const ManagerResults = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'publish'
  const [results, setResults] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish Form States
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

  const fetchResultsAndPrograms = async () => {
    setLoading(true);
    try {
      const resRes = await api.get('/chairman/results');
      setResults(resRes.data);

      const progRes = await api.get('/chairman/programs');
      // Only approved programs proposed by this wing
      setPrograms(progRes.data.filter(p => p.approved));
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load wing program standings.');
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

    const prog = programs.find(p => p._id === programId);
    setSelectedProgram(prog);
    setLoadingRegistrations(true);

    try {
      // Fetch registrations in this wing
      const regRes = await api.get('/chairman/registrations');
      // Filter for this programId
      const programRegs = regRes.data.filter(r => r.programId?._id === programId);
      setRegistrations(programRegs);

      // Check existing results
      const existing = results.find(r => r.programId?._id === programId);
      if (existing) {
        const formattedWinners = existing.winners.map(w => ({
          position: w.position,
          studentId: w.studentId?._id || '',
          groupId: w.groupId?._id || '',
          grade: w.grade || '',
          marks: w.marks || 0,
          points: w.points || 0,
          remarks: w.remarks || ''
        }));
        setWinners(formattedWinners);
      } else {
        handleAddWinner();
      }
    } catch (err) {
      setErrorMsg('Failed to load registered participants.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleAddWinner = () => {
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

    for (let w of winners) {
      if (selectedProgram.type === 'single' && !w.studentId) {
        setErrorMsg('Please select a student for each standings row.');
        return;
      }
      if (selectedProgram.type === 'group' && !w.groupId) {
        setErrorMsg('Please select a team for each standings row.');
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

      await api.post('/chairman/results', payload);
      setToastType('success');
      setToastMessage('Results standings successfully published to Website registry!');
      
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

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header Tabs */}
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
        <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-850 dark:text-white">
          <Trophy className="text-gold" />
          <span>Wing Program Standing results</span>
        </h2>
        
        <div className="flex space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-royal text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Published Standings
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

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-4 text-slate-400" size={28} />
          Loading Standings registry...
        </div>
      ) : activeTab === 'list' ? (
        /* Standings list view */
        results.length === 0 ? (
          <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
            No program standings published in your wing. Click "Declare Standing" to publish some.
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((resObj) => (
              <div key={resObj._id} className="p-6 rounded-3xl glass-card border space-y-4 shadow border-slate-200/50">
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Program standing</span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                      {resObj.programId?.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Published: {new Date(resObj.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resObj.winners.map((winner, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800/60 flex items-center justify-between hover-scale"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                            winner.position === '1st'
                              ? 'bg-amber-100/60 border-amber-300 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : winner.position === '2nd'
                              ? 'bg-slate-250 border-slate-350 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-orange-100/50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400'
                          }`}>
                            {winner.position}
                          </span>
                          <span className="text-[10px] text-slate-450">Grade: {winner.grade}</span>
                        </div>
                        
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 mt-1 truncate max-w-[130px]">
                          {winner.studentId?.name || winner.groupId?.name || 'N/A'}
                        </h4>
                        <p className="text-[10px] text-slate-450 italic truncate max-w-[130px]">"{winner.remarks || 'No remarks.'}"</p>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Points</div>
                        <div className="text-lg font-black text-royal dark:text-cyan">+{winner.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Standings publish form view */
        <div className="space-y-6">
          <div className="glass-card border rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold font-sans text-slate-750 dark:text-white">Choose Approved Program Activity</h3>
            <select
              value={selectedProgramId}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full max-w-md px-3.5 py-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl text-xs focus:outline-none"
            >
              <option value="">Select Program</option>
              {programs.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>

          {selectedProgramId && (
            <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-800 pb-4 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Publish Standings for: {selectedProgram?.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Program Type: <span className="font-semibold uppercase text-royal">{selectedProgram?.type}</span> | Registered Participants: {registrations.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddWinner}
                  className="px-4 py-2 bg-royal/10 hover:bg-royal/20 text-royal dark:text-cyan dark:bg-cyan/10 dark:hover:bg-cyan/20 font-bold rounded-xl text-[10px] flex items-center justify-center transition-colors"
                >
                  <Plus size={12} className="mr-1" /> Add Position Row
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {loadingRegistrations ? (
                <div className="p-6 text-center text-slate-400">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-slate-400" />
                  Loading registered students...
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  <div className="space-y-4">
                    {winners.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-500/5 rounded-2xl">
                        No positions specified. Click "Add Position Row".
                      </div>
                    ) : (
                      winners.map((winner, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-6 gap-4 items-end animate-scale"
                        >
                          {/* Position */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-450 uppercase">Position</label>
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

                          {/* Recipient selection */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-450 uppercase">
                              {selectedProgram.type === 'single' ? 'Select Student *' : 'Select Team *'}
                            </label>
                            {selectedProgram.type === 'single' ? (
                              <select
                                value={winner.studentId}
                                onChange={(e) => handleWinnerFieldChange(idx, 'studentId', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-xs"
                              >
                                <option value="">Choose Student</option>
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
                                <option value="">Choose Team</option>
                                {registrations.map(r => (
                                  <option key={r._id} value={r.groupId?._id}>
                                    {r.groupId?.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Grade & Marks */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-455 uppercase">Grade</label>
                              <input
                                type="text"
                                value={winner.grade}
                                onChange={(e) => handleWinnerFieldChange(idx, 'grade', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-center"
                                placeholder="A+"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-455 uppercase">Marks</label>
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
                            <label className="text-[10px] font-bold text-slate-455 uppercase">Points</label>
                            <input
                              type="number"
                              value={winner.points}
                              onChange={(e) => handleWinnerFieldChange(idx, 'points', e.target.value)}
                              className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-center font-bold text-royal dark:text-cyan"
                            />
                          </div>

                          {/* Remarks */}
                          <div className="flex space-x-2 items-center justify-between">
                            <div className="space-y-1 flex-1">
                              <label className="text-[10px] font-bold text-slate-455 uppercase">Remarks</label>
                              <input
                                type="text"
                                value={winner.remarks}
                                onChange={(e) => handleWinnerFieldChange(idx, 'remarks', e.target.value)}
                                className="w-full px-2 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                                placeholder="Remarks..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveWinner(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl mt-4"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t dark:border-slate-850">
                    <button
                      type="submit"
                      disabled={loadingSubmit || winners.length === 0}
                      className="px-6 py-2.5 bg-royal hover:bg-royal-dark text-white font-bold rounded-xl shadow transition-all flex items-center"
                    >
                      {loadingSubmit ? 'Saving...' : 'Publish results Standing'}
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
