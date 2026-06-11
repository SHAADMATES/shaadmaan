import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, X, FolderKanban, PlusCircle, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const AddProgram = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('single');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(0);
  
  // Rules management
  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!currentRule.trim()) return;
    setRules(prev => [...prev, currentRule.trim()]);
    setCurrentRule('');
  };

  const handleRemoveRule = (index) => {
    setRules(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !time || !venue) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        title,
        type,
        date,
        time,
        venue,
        description,
        maxParticipants: Number(maxParticipants),
        rules
      };

      await api.post('/chairman/programs', payload);
      
      setToastType('success');
      setToastMessage(`Program "${title}" proposed successfully! Waiting for Admin approval.`);
      
      // Reset
      setTitle('');
      setType('single');
      setDate('');
      setTime('');
      setVenue('');
      setDescription('');
      setMaxParticipants(0);
      setRules([]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit program proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-scale">
      <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <PlusCircle className="text-emerald" />
          <h3 className="text-lg font-bold font-sans">Propose Wing Program</h3>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
            <AlertCircle size={14} className="mr-2" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Program Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                placeholder="e.g. Football Tournament, Cyber Code Combat"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Program Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
              >
                <option value="single">Single Entry (Individual)</option>
                <option value="group">Group Entry (Team)</option>
              </select>
            </div>

            {/* Max Participants */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Max Participants Limit (0 = Unlimited)</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                min="0"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Target Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Target Time *</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                placeholder="e.g. 02:00 PM"
              />
            </div>

            {/* Venue */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                placeholder="e.g. Red Wing Labs, Football Field"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl min-h-[90px]"
                placeholder="Provide details about the program objectives..."
              />
            </div>

            {/* Dynamic Rules List Builder */}
            <div className="space-y-2 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-semibold text-slate-500 block">Rules & Regulations</label>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentRule}
                  onChange={(e) => setCurrentRule(e.target.value)}
                  className="flex-1 px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="Enter a rule..."
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl flex items-center transition-colors"
                >
                  <Plus size={14} className="mr-1" /> Add
                </button>
              </div>

              {rules.length > 0 && (
                <ul className="space-y-1.5 mt-2 bg-slate-500/5 p-3 rounded-2xl">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                      <span>{index + 1}. {rule}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(index)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Propose Program'
              )}
            </button>
          </div>
        </form>
      </div>

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

export default AddProgram;
