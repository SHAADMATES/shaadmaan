import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Database, FileSpreadsheet, FileText, CheckSquare, Square, Search, RefreshCw, Filter, Sparkles, Download, Layers } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const UniversalExportHub = () => {
  const [selectedDataset, setSelectedDataset] = useState('students');
  const [loading, setLoading] = useState(true);
  const [rawRecords, setRawRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const datasets = [
    { id: 'students', label: 'Students Directory', endpoint: '/admin/students', icon: Layers, desc: 'All registered student profiles, wing associations, and emails.' },
    { id: 'wings', label: 'Wings & Chairmen Profile', endpoint: '/admin/wings', icon: Database, desc: 'Active wings, chairman names, assistant profiles, and login accounts.' },
    { id: 'programs', label: 'Program Events Directory', endpoint: '/admin/programs', icon: FileSpreadsheet, desc: 'All proposed and approved program events, dates, and venues.' },
    { id: 'auditLogs', label: 'System Audit Trail Logs', endpoint: '/superadmin/audit-logs', icon: FileText, desc: 'Complete historical log of system actions performed by users.' },
    { id: 'users', label: 'System Accounts Directory', endpoint: '/superadmin/users', icon: Layers, desc: 'All user accounts across Superadmin, Admin, Chairman, and Student roles.' }
  ];

  const fetchDatasetRecords = async (datasetId) => {
    setLoading(true);
    try {
      const target = datasets.find(d => d.id === datasetId);
      if (!target) return;
      const res = await api.get(target.endpoint);
      const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setRawRecords(list);

      // Extract available columns
      if (list.length > 0) {
        const keys = Object.keys(list[0]).filter(k => !k.startsWith('_') && k !== 'password' && k !== 'plainPassword');
        setAvailableFields(keys);
        setSelectedFields(keys); // Select all by default
      } else {
        setAvailableFields([]);
        setSelectedFields([]);
      }
    } catch (err) {
      console.error('Failed to load dataset records:', err);
      setToastType('error');
      setToastMessage('Could not retrieve data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetRecords(selectedDataset);
  }, [selectedDataset]);

  const handleDatasetChange = (dsId) => {
    setSelectedDataset(dsId);
    setSearchQuery('');
  };

  const toggleField = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const selectAllFields = () => setSelectedFields([...availableFields]);
  const deselectAllFields = () => setSelectedFields([]);

  // Filter records by search
  const filteredRecords = rawRecords.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(val => 
      val && typeof val !== 'object' && String(val).toLowerCase().includes(q)
    );
  });

  // Prepare custom formatted data containing only selected fields
  const getPreparedExportData = () => {
    return filteredRecords.map(item => {
      const obj = {};
      selectedFields.forEach(f => {
        let val = item[f];
        if (val && typeof val === 'object') {
          val = val.name || val.title || val.username || JSON.stringify(val);
        }
        obj[f.toUpperCase()] = val ?? 'N/A';
      });
      return obj;
    });
  };

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/15">
            <Sparkles size={12} className="text-emerald-400" />
            <span>Superadmin Export Studio</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
            Universal Data Extraction Center
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light">
            Select any database table, pick exact fields to include, filter records by keywords, and export to CSV Spreadsheet, JSON Dump, or Branded PDF Table instantly.
          </p>
        </div>
      </div>

      {/* Dataset Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {datasets.map(ds => {
          const Icon = ds.icon;
          const isSelected = selectedDataset === ds.id;
          return (
            <button
              key={ds.id}
              onClick={() => handleDatasetChange(ds.id)}
              className={`stat-badge-glow p-5 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden ${
                isSelected 
                  ? 'bg-gradient-to-br from-emerald-600/15 to-teal-600/15 border-emerald-500/60 shadow-xl -translate-y-1' 
                  : 'glass-card-hover border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-2xl ${isSelected ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <Icon size={20} />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{ds.label}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ds.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Field Selection Checkboxes */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white flex items-center space-x-2">
                <Filter size={18} className="text-emerald-500" />
                <span>Field Selection</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFields.length} of {availableFields.length} fields selected</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={selectAllFields}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={deselectAllFields}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                None
              </button>
            </div>
          </div>

          {availableFields.length === 0 ? (
            <p className="text-slate-400 text-center py-8 italic text-xs">No fields detected or dataset empty.</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {availableFields.map(field => {
                const checked = selectedFields.includes(field);
                return (
                  <label
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-800/60 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {checked ? <CheckSquare size={16} className="text-emerald-500 shrink-0" /> : <Square size={16} className="text-slate-400 shrink-0" />}
                      <span className="text-xs font-bold font-mono tracking-wide uppercase">{field}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Data Preview & Export Execution */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-6 flex flex-col">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search across records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => fetchDatasetRecords(selectedDataset)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
                title="Refresh Records"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <UniversalExport
                data={getPreparedExportData()}
                filename={`shaadmates_${selectedDataset}_${new Date().toISOString().slice(0,10)}`}
                label="Export Dataset"
                title={`${selectedDataset.toUpperCase()} DIRECTORY EXTRACTION`}
                buttonClass="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md glow-emerald"
              />
            </div>
          </div>

          {/* Table Preview */}
          <div className="flex-1 overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-semibold">Extracting records from database...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Database size={32} className="mb-2 opacity-30" />
                <p className="text-xs font-medium">No matching records found in this dataset.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3 w-12 text-center">#</th>
                    {selectedFields.slice(0, 6).map(field => (
                      <th key={field} className="p-3">{field}</th>
                    ))}
                    {selectedFields.length > 6 && (
                      <th className="p-3 text-emerald-500">+{selectedFields.length - 6} more</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                  {filteredRecords.slice(0, 10).map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      {selectedFields.slice(0, 6).map(f => {
                        let val = record[f];
                        if (val && typeof val === 'object') {
                          val = val.name || val.title || val.username || 'Object';
                        }
                        return (
                          <td key={f} className="p-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {String(val ?? 'N/A')}
                          </td>
                        );
                      })}
                      {selectedFields.length > 6 && (
                        <td className="p-3 text-slate-400 italic">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {filteredRecords.length > 10 && (
            <div className="text-right text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Showing first 10 rows preview out of <strong className="text-slate-700 dark:text-slate-200">{filteredRecords.length}</strong> total records. Click Export above to download full dataset.
            </div>
          )}
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

export default UniversalExportHub;
