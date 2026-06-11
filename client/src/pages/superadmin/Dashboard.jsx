import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { ShieldAlert, Users, Database, Activity, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const SuperDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);

        const logsRes = await api.get('/superadmin/audit-logs');
        setLogs(logsRes.data.slice(0, 5));
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to fetch system data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          Super Admin Console
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Root access console. Manage platform users, access audit logs, configure databases, and system backups.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card border flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Accounts</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {(stats?.totalStudents || 0) + (stats?.totalWingManagers || 0) + 2}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-royal/10 text-royal">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Wings</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {stats?.wingsData?.length || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-cyan/10 text-cyan">
            <Database size={24} />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Audits</span>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {logs.length} logged
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald/10 text-emerald">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="glass-card border rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
          <ShieldAlert size={18} className="text-royal" />
          <span>Recent System Audit Actions</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400 italic">No audit records logged.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-500/5">
                    <td className="p-3 font-semibold">@{log.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action.includes('FAIL') ? 'bg-rose-50 text-rose-600' : 'bg-royal/10 text-royal'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{log.details}</td>
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

export default SuperDashboard;
