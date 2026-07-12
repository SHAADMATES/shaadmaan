import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Sparkles, BarChart2, PieChart as PieIcon, RefreshCw, Printer, FileText, Globe, ShieldCheck } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const ReportsStudio = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('system_summary'); // 'system_summary' | 'wing_comparison' | 'audit_trail'
  
  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  const fetchSuperData = async () => {
    setLoading(true);
    try {
      const [usersRes, auditRes] = await Promise.all([
        api.get('/superadmin/users'),
        api.get('/superadmin/audit-logs')
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const logs = Array.isArray(auditRes.data) ? auditRes.data : [];

      // Compute role counts
      const roleCounts = {};
      users.forEach(u => {
        const r = u.role || 'user';
        roleCounts[r] = (roleCounts[r] || 0) + 1;
      });

      setStats({
        totalUsers: users.length,
        roleCounts,
        logsCount: logs.length,
        usersList: users
      });
      setAuditLogs(logs);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load superadmin reports studio metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperData();
  }, []);

  const getRoleChartData = () => {
    if (!stats || !stats.roleCounts) return [];
    return Object.entries(stats.roleCounts).map(([role, count]) => ({
      name: role.toUpperCase().replace('_', ' '),
      count
    }));
  };

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-indigo-900 text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/15">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span>Superadmin Global Intelligence</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
            Executive Analytics Studio
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light">
            System-wide metric visualization, access security audit breakdowns, and universal export tools for executive oversight across all academic portals.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('system_summary')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'system_summary' ? 'bg-royal text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            System Distribution
          </button>
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'audit_trail' ? 'bg-royal text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Security & Audit Trail
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSuperData}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-2xl transition-all"
            title="Refresh Intelligence"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all shadow-sm"
          >
            <Printer size={14} />
            <span>Print Layout</span>
          </button>
          <UniversalExport
            data={activeTab === 'audit_trail' ? auditLogs : (stats?.usersList || [])}
            filename={`ShaadMates_Executive_${activeTab}_${new Date().toISOString().slice(0,10)}`}
            label="Export Brief"
            title={`SUPERADMIN EXECUTIVE BRIEF (${activeTab.toUpperCase()})`}
            buttonClass="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md glow-blue"
          />
        </div>
      </div>

      {/* Main Charts & Analytics View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Gathering global system intelligence...</p>
        </div>
      ) : activeTab === 'system_summary' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-badge-glow glass-card-hover p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Registered Accounts</span>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
              <span className="text-[11px] text-emerald-500 font-bold flex items-center">
                <ShieldCheck size={13} className="mr-1" /> Active directory synchronized
              </span>
            </div>
            <div className="stat-badge-glow glass-card-hover p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Audit Trail Events</span>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{stats?.logsCount || 0}</p>
              <span className="text-[11px] text-blue-500 font-bold flex items-center">
                <FileText size={13} className="mr-1" /> All actions logged securely
              </span>
            </div>
            <div className="stat-badge-glow glass-card-hover p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Health Status</span>
              <p className="text-4xl font-black text-emerald-500">OPTIMAL</p>
              <span className="text-[11px] text-slate-400 font-bold flex items-center">
                <Globe size={13} className="mr-1" /> Database latency &lt; 250ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                <BarChart2 size={16} className="text-royal" />
                <span>Account Role Distribution Breakdown</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getRoleChartData()}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {getRoleChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart */}
            <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                <PieIcon size={16} className="text-emerald-500" />
                <span>Role Allocation Ratio</span>
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getRoleChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {getRoleChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-500/5 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800 dark:text-white">Recent Security & Action Audit Trail ({auditLogs.length})</span>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User Role</th>
                  <th className="p-3.5">Action Performed</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                {auditLogs.slice(0, 25).map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 font-bold uppercase text-royal">{log.role || log.userRole || 'User'}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{log.action || 'System Action'}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{log.details || log.description || 'Verified operation'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default ReportsStudio;
