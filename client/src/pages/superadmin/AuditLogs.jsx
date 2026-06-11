import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { ShieldAlert, Search, RefreshCw, Filter, Calendar } from 'lucide-react';
import Toast from '../../components/Toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch audit log records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter options
  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  if (loading && logs.length === 0) {
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
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            System Security Audit Logs
          </h2>
          <p className="text-sm text-slate-350 mt-2">
            View the historical trail of configuration updates, user management commands, and database restores.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center shrink-0"
          title="Refresh Logs"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            placeholder="Search by details or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-royal transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        {/* Action Type Filter */}
        <div className="sm:col-span-4 relative">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-royal transition-all appearance-none"
          >
            {uniqueActions.map(act => (
              <option key={act} value={act}>
                {act === 'ALL' ? 'Filter by Action: All' : act}
              </option>
            ))}
          </select>
          <Filter size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        {/* Total Count Display */}
        <div className="sm:col-span-2 text-right text-xs font-semibold text-slate-500">
          Showing {filteredLogs.length} entries
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card border rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
          <ShieldAlert size={18} className="text-rose-500" />
          <span>Complete System Logs</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                <th className="p-3">User</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Event Details</th>
                <th className="p-3"><span className="flex items-center"><Calendar size={13} className="mr-1" /> Timestamp</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400 italic">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-800 dark:text-white">
                      @{log.username}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action.includes('FAIL') || log.action.includes('DELETE')
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default AuditLogs;
