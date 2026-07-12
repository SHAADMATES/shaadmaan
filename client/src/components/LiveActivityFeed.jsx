import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, ShieldCheck, FileText, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';

const LiveActivityFeed = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const endpoint = user?.role === 'super_admin' ? '/superadmin/live-activity' : '/admin/live-activity';
      const res = await api.get(endpoint);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load live activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // Auto refresh every 30 seconds
    const timer = setInterval(fetchActivity, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const getActionIcon = (action = '') => {
    if (action.includes('LOGIN') || action.includes('USER')) {
      return <UserCheck size={14} className="text-blue-500" />;
    }
    if (action.includes('APPROVE') || action.includes('CERTIFICATE')) {
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    }
    if (action.includes('ROLE') || action.includes('SECURITY')) {
      return <ShieldCheck size={14} className="text-purple-500" />;
    }
    if (action.includes('CREATE') || action.includes('PROGRAM') || action.includes('ANNOUNCEMENT')) {
      return <FileText size={14} className="text-amber-500" />;
    }
    return <Activity size={14} className="text-cyan-500" />;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = (new Date() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="glass-card-hover p-6 relative overflow-hidden my-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md flex items-center justify-center">
            <Activity size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Live System Activity Ticker</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time organizational audit stream (auto-refreshes every 30s)</p>
          </div>
        </div>

        <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center">
          <Clock size={12} className="mr-1 text-slate-400" /> Live Stream
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center items-center text-slate-400 text-xs">
          <Loader2 size={16} className="animate-spin mr-2" /> Loading audit stream...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No activity logs recorded yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors text-xs"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">@{log.username || 'system'}</span>
                    <span className="text-slate-400 font-mono text-[10px] bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    {log.details || 'Performed organizational action'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                {getTimeAgo(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveActivityFeed;
