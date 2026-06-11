import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Layout, PlusCircle, Trash2, ShieldAlert, Sparkles, Filter, CheckSquare, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const FormsManagement = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formName, setFormName] = useState('student');
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFields = async () => {
    try {
      const res = await api.get('/admin/form-fields');
      setFields(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch custom fields.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label || !name) {
      setErrorMsg('Field Label and Field Name are required.');
      return;
    }

    // Standardize name to camelCase
    const formattedName = name.replace(/[^a-zA-Z0-9]/g, '');
    const finalName = formattedName.charAt(0).toLowerCase() + formattedName.slice(1);

    try {
      await api.post('/admin/form-fields', {
        formName,
        label,
        name: finalName,
        type,
        required
      });
      setToastType('success');
      setToastMessage(`Custom field "${label}" added to ${formName} form.`);
      setLabel('');
      setName('');
      setType('text');
      setRequired(false);
      setErrorMsg('');
      fetchFields();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save custom field.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this custom form field?')) return;
    try {
      await api.delete(`/admin/form-fields/${id}`);
      setToastType('success');
      setToastMessage('Custom field deleted.');
      fetchFields();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete field.');
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
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
          Form Schema & Custom Fields Manager
        </h2>
        <p className="text-sm text-slate-350 mt-1">
          Dynamically append new inputs, fields, or checkboxes to platform data forms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Add New Field Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          <h3 className="text-lg font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <PlusCircle size={20} className="text-royal" />
            <span>Create Custom Field</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Module Form</label>
              <select
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
              >
                <option value="student">Student Registration Form</option>
                <option value="wing">Wing Creation Form</option>
                <option value="program">Program Proposal Form</option>
                <option value="transaction">Ledger Transaction Form</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Father's Name"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Name (camelCase key)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. fatherName"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Input Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="date">Date Picker</option>
                  <option value="email">Email address</option>
                  <option value="textarea">Multi-line Text</option>
                </select>
              </div>

              <div className="flex items-center pt-6 space-x-2">
                <input
                  type="checkbox"
                  id="requiredField"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="h-4 w-4 text-royal border-slate-300 rounded focus:ring-royal"
                />
                <label htmlFor="requiredField" className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Required field?
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-sm shadow hover:shadow-lg transition-all"
            >
              Append Schema Field
            </button>
          </form>
        </div>

        {/* Right Column - Table display */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          <h3 className="text-lg font-bold font-sans border-b border-slate-100 dark:border-slate-800/40 pb-4 flex items-center justify-between">
            <span>Dynamic Form Fields Directory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {fields.length} Fields Configured
            </span>
          </h3>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider bg-slate-500/5">
                  <th className="p-3">Label & Key</th>
                  <th className="p-3">Target Form</th>
                  <th className="p-3">Input Type</th>
                  <th className="p-3 text-center">Required</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-450 italic">
                      No custom fields added yet. Use the editor to add one.
                    </td>
                  </tr>
                ) : (
                  fields.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-white">{f.label}</div>
                        <div className="text-[10px] text-slate-450 font-mono">key: {f.name}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-royal/10 text-royal font-medium border border-royal/15">
                          {f.formName.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{f.type.toUpperCase()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          f.required ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {f.required ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

export default FormsManagement;
