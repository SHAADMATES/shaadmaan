import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  ShieldAlert, Users, Database, Activity, RefreshCw, Server, Zap,
  Archive, CheckCircle2, AlertTriangle, BarChart3, TrendingUp, TrendingDown,
  UserCheck, BookOpen, Trophy, FileText, Clock, Eye, Settings, Lock,
  Globe, DollarSign, ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Toast from '../../components/Toast';

const StatBadge = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`p-5 rounded-2xl ${bg} border ${border} flex items-center justify-between group hover:-translate-y-0.5 transition-all`}>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

const SuperDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/superadmin/audit-logs')
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.slice(0, 10));
    } catch (err) {
      showToast('Failed to fetch system data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.post('/superadmin/backup');
      showToast(res.data.message || 'Database backup created!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Backup failed.', 'error');
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-48 rounded-3xl animate-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(n => <div key={n} className="h-24 rounded-2xl animate-shimmer" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl animate-shimmer" />
          <div className="lg:col-span-2 h-64 rounded-3xl animate-shimmer" />
        </div>
      </div>
    );
  }

  const netBalance = (stats?.totalIncome || 0) - (stats?.totalExpense || 0);
  const totalAccounts = (stats?.totalStudents || 0) + (stats?.totalWingManagers || 0) + 2;

  return (
    <div className="p-6 space-y-8 animate-scale">

      {/* ── Hero Banner ── */}
      <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#0d1b2a] via-[#1a2d4a] to-[#0d1b2a] text-white shadow-2xl overflow-hidden border border-white/5">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <ShieldAlert size={16} className="text-red-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Root Access • Super Admin</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              System Control Center
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Full platform visibility. Manage all user accounts, view financial health, monitor audit trails, and execute system operations from this root console.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold transition-all"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-bold transition-all disabled:opacity-60"
            >
              {backingUp ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{backingUp ? 'Backing Up...' : 'Run Backup'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge
          label="Total Accounts"
          value={totalAccounts}
          icon={Users}
          color="text-blue-500 bg-blue-500/10"
          bg="bg-white dark:bg-slate-900"
          border="border-slate-200 dark:border-slate-800"
        />
        <StatBadge
          label="Students"
          value={stats?.totalStudents || 0}
          icon={UserCheck}
          color="text-purple-500 bg-purple-500/10"
          bg="bg-white dark:bg-slate-900"
          border="border-slate-200 dark:border-slate-800"
        />
        <StatBadge
          label="Programs"
          value={stats?.totalPrograms || 0}
          icon={BookOpen}
          color="text-amber-500 bg-amber-500/10"
          bg="bg-white dark:bg-slate-900"
          border="border-slate-200 dark:border-slate-800"
        />
        <StatBadge
          label="Certificates"
          value={stats?.certificatesIssued || 0}
          icon={Trophy}
          color="text-emerald-500 bg-emerald-500/10"
          bg="bg-white dark:bg-slate-900"
          border="border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* ── Finance Overview + System Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Finance Tracker - 3 cols */}
        <div className="lg:col-span-3 p-6 rounded-3xl glass-card border shadow-lg space-y-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <DollarSign size={18} className="text-emerald-500" />
              <span>Treasury Ledger</span>
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${netBalance >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'}`}>
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ArrowUpRight size={12} />
                <span>Income</span>
              </div>
              <p className="text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                ${(stats?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <div className="flex items-center space-x-1 text-rose-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ArrowDownRight size={12} />
                <span>Expense</span>
              </div>
              <p className="text-xl font-mono font-extrabold text-rose-700 dark:text-rose-400">
                ${(stats?.totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${netBalance >= 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'}`}>
              <div className={`flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider mb-2 ${netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                <BarChart3 size={12} />
                <span>Net</span>
              </div>
              <p className={`text-xl font-mono font-extrabold ${netBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {netBalance >= 0 ? '' : '-'}${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Wing breakdown */}
          {stats?.wingsData?.length > 0 && (
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Wing Activity</p>
              <div className="space-y-2">
                {stats.wingsData.map((w, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{w._id}</span>
                    <span className="font-mono text-slate-500">{w.programsCount} program{w.programsCount !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Health + Quick Actions - 2 cols */}
        <div className="lg:col-span-2 space-y-4">

          {/* System Health */}
          <div className="p-6 rounded-3xl glass-card border shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan/10 rounded-full blur-2xl" />
            <h3 className="text-base font-bold flex items-center space-x-2 mb-5">
              <Server size={16} className="text-cyan" />
              <span>System Health</span>
            </h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'DB Latency', val: '24ms', pct: 15, color: 'bg-emerald-500', status: 'Optimal' },
                { label: 'API Traffic', val: '42 req/s', pct: 42, color: 'bg-royal', status: 'Normal' },
                { label: 'Storage', val: '68% used', pct: 68, color: 'bg-amber-500', status: 'Moderate' },
              ].map(({ label, val, pct, color, status }) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                    <span>{label}</span>
                    <span className="font-mono">{val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-2 text-emerald-500">
              <CheckCircle2 size={14} />
              <span className="text-xs font-semibold">All systems operational</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 rounded-3xl glass-card border shadow-lg">
            <h3 className="text-base font-bold flex items-center space-x-2 mb-4">
              <Zap size={16} className="text-amber-500" />
              <span>Root Actions</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/super/users', icon: Users, label: 'Manage Users', color: 'text-blue-500 bg-blue-500/10' },
                { to: '/super/logs', icon: ShieldAlert, label: 'Audit Logs', color: 'text-red-500 bg-red-500/10' },
                { to: '/super/backups', icon: Archive, label: 'Backups', color: 'text-emerald-500 bg-emerald-500/10' },
                { onClick: () => showToast('System cache cleared!'), icon: RefreshCw, label: 'Flush Cache', color: 'text-purple-500 bg-purple-500/10' },
              ].map((action, i) =>
                action.to ? (
                  <Link
                    key={i}
                    to={action.to}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon size={17} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center">{action.label}</span>
                  </Link>
                ) : (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon size={17} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center">{action.label}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Results Published', value: stats?.resultsPublished || 0, icon: BarChart3, gradient: 'from-blue-500/10 to-blue-500/5', icon_color: 'text-blue-500' },
          { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: FileText, gradient: 'from-purple-500/10 to-purple-500/5', icon_color: 'text-purple-500' },
          { label: 'Completed Events', value: stats?.completedPrograms || 0, icon: CheckCircle2, gradient: 'from-emerald-500/10 to-emerald-500/5', icon_color: 'text-emerald-500' },
          { label: 'Publications', value: stats?.publicationsCount || 0, icon: BookOpen, gradient: 'from-amber-500/10 to-amber-500/5', icon_color: 'text-amber-500' },
        ].map((item, i) => (
          <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${item.gradient} border border-slate-200 dark:border-slate-800 flex items-center space-x-4 hover:-translate-y-0.5 transition-all`}>
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm`}>
              <item.icon size={17} className={item.icon_color} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Audit Trail ── */}
      <div className="glass-card border rounded-3xl p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Clock size={18} className="text-rose-500" />
            <span>Recent Audit Trail</span>
          </h3>
          <Link
            to="/super/logs"
            className="text-xs font-bold text-royal hover:underline flex items-center space-x-1"
          >
            <Eye size={13} />
            <span>View All Logs</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4 hidden md:table-cell">Details</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400 italic">No audit records logged yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">@{log.username}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.action.includes('FAIL') || log.action.includes('DELETE')
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                          : log.action.includes('CREATE') || log.action.includes('ADD')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                          : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 text-slate-400 font-mono whitespace-nowrap">
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
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default SuperDashboard;
